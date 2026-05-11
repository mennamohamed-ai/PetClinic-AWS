# 🔧 SOLUCIONES: Correcciones Paso a Paso

## FASE 1: CORRECCIONES CRÍTICAS

---

## FIX #1: Corregir Backend Task Definition - Imagen Nginx

### Problema:
Backend está corriendo Nginx en lugar de Java/Spring Boot

### Solución:

**Paso 1: Verificar la imagen correcta en ECR**
```bash
aws ecr describe-images --repository-name petclinic-backend \
  --query 'imageDetails[0].[imageTags,imageUri]'

# Debería retornar algo como:
# imageTags: ["latest", "prod-latest", "sha-xxxxx"]
# imageUri: "515060545576.dkr.ecr.us-east-1.amazonaws.com/petclinic-backend:latest"
```

**Paso 2: Actualizar terraform/variables.tf**

Si tienes una variable `docker_image_urls` o similar, debe apuntar a la imagen correcta:
```hcl
variable "docker_image_urls" {
  description = "Docker image URLs from ECR"
  type = object({
    backend       = string
    api_gateway   = string
    ml_service    = string
    frontend      = string
  })
}
```

**Paso 3: Verificar terraform/terraform.tfvars**

Asegurar que la imagen es de ECR, NO nginx:
```hcl
docker_image_urls = {
  backend       = "515060545576.dkr.ecr.us-east-1.amazonaws.com/petclinic-backend:latest"
  # NO: "nginx:latest"  ❌
  api_gateway   = "515060545576.dkr.ecr.us-east-1.amazonaws.com/petclinic-api-gateway:latest"
  ml_service    = "515060545576.dkr.ecr.us-east-1.amazonaws.com/petclinic-ml-service:latest"
  frontend      = "515060545576.dkr.ecr.us-east-1.amazonaws.com/petclinic-frontend:latest"
}
```

**Paso 4: Re-aplicar Terraform**
```bash
cd terraform/
terraform plan -out=tfplan
# Revisar que muestre "backend image: old-image -> new-image"
terraform apply tfplan
```

**Paso 5: Force new deployment en ECS**
```bash
aws ecs update-service \
  --cluster petclinic-prod-cluster \
  --service petclinic-prod-backend-service \
  --force-new-deployment
```

**Verificación:**
```bash
# Esperar a que los tasks sean healthy
aws ecs wait services-stable \
  --cluster petclinic-prod-cluster \
  --services petclinic-prod-backend-service

# Verificar imagen deployada
aws ecs describe-task-definition \
  --task-definition petclinic-prod-backend:1 \
  --query 'taskDefinition.containerDefinitions[0].image'
# Debe retornar: 515060545576.dkr.ecr.us-east-1.amazonaws.com/petclinic-backend:latest
```

---

## FIX #2: Configurar Eureka en Backend

### Problema:
Backend NO tiene configuración de Eureka, por lo que NO se registra en el servicio de discovery

### Solución:

**Reemplazar** el contenido de `Backend/src/main/resources/application-prod.properties`:

