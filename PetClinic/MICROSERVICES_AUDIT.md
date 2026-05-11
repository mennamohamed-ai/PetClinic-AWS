# 🔍 AUDITORÍA CRÍTICA: PetClinic Microservices Architecture

## Fecha de Auditoría: 11 de Mayo, 2026

---

## ⚠️ PROBLEMAS CRÍTICOS ENCONTRADOS

### 1. **🚨 PROBLEMA CRÍTICO: Imagen Nginx en el Backend (NGINX BUG)**

**Severidad:** 🔴 CRÍTICA - El servicio Backend está ejecutando Nginx en lugar de Java

**Ubicación:** Terraform state file - Backend Task Definition

**Problema Actual:**
```json
{
  "image": "nginx:latest",  // ❌ INCORRECTO
  "portMappings": [{"containerPort": 9090}],
  "containerPort": 9090
}
```

**Causa Raíz:**
- El Dockerfile del Backend es correcto (usa `eclipse-temurin:21-jre`)
- Pero en `terraform/ecs.tf`, la imagen referenciada está usando la imagen equivocada
- O se pasó la URL incorrecta durante el terraform apply

**Impacto:**
- ❌ El endpoint `/api` no funciona (es Nginx, no Spring Boot)
- ❌ No hay base de datos disponible
- ❌ Eureka no puede registrar el servicio correctamente
- ❌ Los health checks fallan

**Verificación:**
```bash
# Revisar qué imagen está desplegada
aws ecs describe-task-definition \
  --task-definition petclinic-prod-backend:1 \
  --query 'taskDefinition.containerDefinitions[0].image'

# Debería retornar algo como:
# "515060545576.dkr.ecr.us-east-1.amazonaws.com/petclinic-backend:latest"
# NO "nginx:latest"
```

---

### 2. **🔴 Service Discovery Incompleto (EUREKA MISCONFIGURATION)**

**Severidad:** 🔴 CRÍTICA - Los microservicios NO se están registrando en Eureka correctamente

#### Problema 2.1: Backend NO tiene configuración de Eureka

**Archivo:** `Backend/src/main/resources/application-prod.properties`

**Problema:**
```properties
# ❌ FALTA configuración de Eureka
# No hay:
# eureka.client.service-url.defaultZone
# eureka.instance.hostname
# eureka.instance.instance-id
```

**Impacto:**
- ❌ Backend NO se registra en Eureka
- ❌ API Gateway NO puede descubrir el backend
- ❌ Las rutas por service name (`lb://main-service`) fallan

#### Problema 2.2: ML Service NO tiene configuración de Eureka

**Archivo:** `ml-service/config.py` y ECS Task Definition

**Problema:**
- No hay variables de entorno para Eureka
- No hay cliente de Eureka en Python (FastAPI)
- API Gateway usa URL directa: `http://ml-service:8000`

#### Problema 2.3: Inconsistencia en nombres de servicios

**Problema:**
- Backend se registra como "backend"
- Pero API Gateway intenta conectar a "main-service"
- No coinciden los nombres

---

### 3. **🟠 API Gateway Routing Inconsistente (GATEWAY ROUTING)**

**Severidad:** 🟠 ALTA - Inconsistencia en las rutas

**Archivo:** `api-gateway/src/main/resources/application-prod.yml`

**Problema Actual:**
```yaml
routes:
  - id: ml-service-api
    uri: http://ml-service:8000              # ❌ URL DIRECTA (sin Eureka)
    predicates:
      - Path=/api/ml/**
    
  - id: main-service-api
    uri: lb://main-service                   # ❌ EUREKA LOAD BALANCER
    predicates:
      - Path=/api/**
```

**Problemas:**
1. **Inconsistencia**: ML Service usa URL directa, Backend usa Eureka
2. **Dependency Issue**: `http://ml-service:8000` depende del DNS interno de ECS
3. **No Resilience**: Si ML Service falla, no hay reintentos automáticos
4. **Service Discovery**: ML Service nunca se registra en Eureka

**Impacto:**
- ❌ Las dos rutas usan mecanismos diferentes
- ❌ No hay redundancia para ML Service
- ❌ Dificultad para troubleshoot problemas de conectividad

---

### 4. **🟠 ALB Health Checks Incorrectos (HEALTH CHECK MISMATCH)**

**Severidad:** 🟠 ALTA - Health checks no coinciden con la configuración de la aplicación

**Ubicación:** `terraform/alb.tf`

#### Problema 4.1: Backend Health Check con context path

**Problema:**
```hcl
# Target Group: Backend
health_check {
  path = "/actuator/health"        # ❌ INCORRECTO
  matcher = "200"
}

# Pero en application-prod.properties:
server.servlet.context-path=/api   # ✅ Los requests van a /api/*
```

**Impacto:**
- ALB espera: `GET http://backend:9090/actuator/health`
- Pero Spring Boot sirve: `GET http://backend:9090/api/actuator/health`
- ❌ **Health checks SIEMPRE fallan** (404 Not Found)
- ❌ Las instancias se marcan como unhealthy
- ❌ El tráfico no se enruta correctamente

#### Problema 4.2: API Gateway Health Check

**Problema:**
```hcl
health_check {
  path = "/actuator/health"        # ✅ CORRECTO (sin context-path)
  matcher = "200"
}

# Spring Cloud Gateway default context-path es: "/"
```

**Estado:** ✅ CORRECTO

#### Problema 4.3: ML Service Health Check

**Problema:**
```hcl
health_check {
  path = "/health"                 # ¿Existe este endpoint?
  matcher = "200"
}

# FastAPI main.py define:
@app.get("/health")                # ✅ Debería estar presente
```

**Necesita verificación** de que el endpoint existe en FastAPI

---

### 5. **🟠 ALB Listener Rules Configuración Incorrecta (ALB ROUTING)**

**Severidad:** 🟠 ALTA - Las reglas de enrutamiento no están optimizadas

**Ubicación:** `terraform/alb.tf`

**Problema Actual:**
```hcl
# Priority 1: Catch-all
resource "aws_lb_listener_rule" "api_gateway" {
  priority = 1
  condition {
    path_pattern {
      values = ["/", "/*"]          # ❌ CATCH-ALL (acepta TODO)
    }
  }
  action {
    target_group_arn = aws_lb_target_group.api_gateway.arn
  }
}

# Priority 20: Backend (NUNCA se alcanza porque Priority 1 catch-all)
resource "aws_lb_listener_rule" "backend" {
  priority = 20
  condition {
    path_pattern {
      values = ["/api/v1/backend*", "/backend*"]
    }
  }
  action {
    target_group_arn = aws_lb_target_group.backend.arn
  }
}

# Priority 30: ML Service (NUNCA se alcanza)
resource "aws_lb_listener_rule" "ml_service" {
  priority = 30
  condition {
    path_pattern {
      values = ["/api/ml/*"]
    }
  }
  action {
    target_group_arn = aws_lb_target_group.ml_service.arn
  }
}
```

**Problema:**
- Priority 1 usa `["/" , "/*"]` que coincide con TODOS los paths
- Las reglas de Priority 20 y 30 NUNCA se ejecutan
- TODO va al API Gateway

**Flujo Actual (INCORRECTO):**
```
ALB (80) 
  ↓
Priority 1 (catch-all: "/*") 
  ↓ MATCH ✓
API Gateway Target Group
  ↓ (API Gateway enruta según su propia configuración)
```

**Flujo Esperado:**
```
ALB (80)
  ↓
Priority 10: "/" → API Gateway (frontend)
Priority 20: "/api/ml/*" → ML Service
Priority 30: "/api/v1/backend*" → Backend
Priority 100: Default → API Gateway
```

---

### 6. **🟡 Networking: Eureka Interno vs ECS Task IPs (EUREKA REGISTRATION)**

**Severidad:** 🟡 MEDIA - Eureka puede registrar IPs internas pero no asignadas correctamente

**Problema:**
En la configuración de ECS, no hay variables para:
- `eureka.instance.ip-address` (IP interna del ECS task)
- `eureka.instance.hostname` (nombre DNS del ECS task)
- `eureka.instance.prefer-ip-address` (preferir IP en lugar de hostname)

**Flujo Actual (Potential Issue):**
```
Backend Task (IP: 10.0.128.5)
  ↓
Registra en Eureka: hostname = "localhost" o "CONTAINER_NAME"
  ↓
API Gateway intenta conectar a "localhost" 
  ❌ NO FUNCIONA (localhost != IP del container)
```

**Solución Esperada:**
```
Backend Task (IP: 10.0.128.5)
  ↓
Registra en Eureka con IP: 10.0.128.5:9090
  ↓
API Gateway conecta a 10.0.128.5:9090
  ✅ FUNCIONA
```

---

### 7. **🟡 Environment Variables: Configuración Incompleta (ENV VARS)**

**Severidad:** 🟡 MEDIA - Variables faltantes para conectividad

#### Problema 7.1: Backend SPRING_APPLICATION_NAME

**Ubicación:** `terraform/ecs.tf` - Backend Task Definition

**Problema:**
```hcl
environment = [
  {
    name  = "SPRING_APPLICATION_NAME"
    value = "main-service"              # ✅ Correcto
  }
]
```

**Pero en properties:**
```properties
spring.application.name=backend         # ❌ Carga de properties sobrescribe
```

**Impacto:**
- Spring primero carga `backend` de properties
- Luego intenta cargar `main-service` de env var
- El nombre final depende del orden de precedencia

#### Problema 7.2: Backend NO tiene variables de Eureka

**Falta:** En `terraform/ecs.tf` Backend Task Definition
```hcl
# ❌ FALTA
environment = [
  {
    name  = "EUREKA_URI"
    value = "http://eureka-server:8761/eureka"
  },
  {
    name  = "EUREKA_INSTANCE_IP_ADDRESS"
    value = "???" # Cómo obtener la IP del task?
  }
]
```

#### Problema 7.3: Frontend S3 Sync Failure

**Logs indicaban:**
```
aws s3 sync dist/ s3://petclinic-prod-frontend-assets-515060545576 --delete
Exit Code: 1
```

**Probable Causa:**
- AWS credentials no configuradas correctamente en el terminal
- O permisos insuficientes de S3

**Solución:** Configurar AWS CLI correctamente

---

## 📊 Tabla Resumen de Problemas

| # | Componente | Problema | Severidad | Impacto | Estado |
|---|---|---|---|---|---|
| 1 | Backend Docker | Imagen Nginx en lugar de Java | 🔴 CRÍTICA | Backend completamente no funcional | ❌ BLOQUEADO |
| 2 | Eureka Discovery | Backend NO se registra | 🔴 CRÍTICA | Service Discovery no funciona | ❌ BLOQUEADO |
| 3 | Gateway Routing | Rutas inconsistentes (URL directo vs Eureka) | 🟠 ALTA | Falta de resilience | ⚠️ DEGRADADO |
| 4 | ALB Health Checks | Path incorrecto para Backend | 🟠 ALTA | Health checks siempre fallan | ❌ FALSO NEGATIVO |
| 5 | ALB Rules | Catch-all priority 1 bloquea otras rutas | 🟠 ALTA | Enrutamiento incorrecto | ❌ INCORRECTO |
| 6 | Eureka IPs | Instances registran localhost | 🟡 MEDIA | Conectividad entre servicios problemática | ⚠️ RIESGO |
| 7 | Env Variables | Configuración incompleta de Eureka | 🟡 MEDIA | Servicios no se descubren mutuamente | ⚠️ INCOMPLETO |
| 8 | Frontend S3 | aws s3 sync falla | 🟡 MEDIA | Frontend no se despliega | ❌ FALLA |

---

## 🔧 PLAN DE CORRECCIÓN (PRIORIDADES)

### FASE 1: CORRECCIONES CRÍTICAS (URGENTE)

**1. Fijar imagen de Backend en Terraform**
- Reemplazar `nginx:latest` con la imagen correcta del ECR
- Re-aplicar terraform

**2. Configurar Eureka en Backend (production-prod.properties)**
- Agregar configuración de Eureka client
- Agregar instance-id y hostname

**3. Fijar ALB Health Check Path para Backend**
- Cambiar de `/actuator/health` a `/api/actuator/health`

### FASE 2: CORRECCIONES ALTAS (ALTO IMPACTO)

**4. Corregir ALB Listener Rules**
- Reordenar priorities correctamente
- Sacar catch-all de priority 1

**5. Hacer consistentes las rutas del Gateway**
- Usar Eureka para ambas (ML Service + Backend)
- O DNS para ambas

### FASE 3: CORRECCIONES MEDIAS (ROBUSTEZ)

**6. Agregar Eureka a ML Service**
- Agregar cliente de Eureka en Python
- O usar discovery alternativo

**7. Configurar Eureka Instance Details correctamente**
- IPs, hostnames, ports

---

## 📋 ARCHIVOS A MODIFICAR

1. ✏️ `terraform/ecs.tf` - Corregir imagen Backend, agregar env vars Eureka
2. ✏️ `terraform/alb.tf` - Fijar health checks y listener rules
3. ✏️ `Backend/src/main/resources/application-prod.properties` - Agregar Eureka config
4. ✏️ `api-gateway/src/main/resources/application-prod.yml` - Hacer consistentes las rutas
5. ✏️ `ml-service/app/main.py` - Agregar endpoint `/health`
6. ✏️ `.github/workflows/deploy.yml` - Asegurar imágenes correctas en ECR

---

Esta auditoría continúa en el siguiente documento con las soluciones paso a paso...
