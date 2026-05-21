# 🐾 PetClinic AWS

A full-stack, cloud-ready **Pet Clinic Management System** built with a microservices architecture. It supports multiple user roles (Admin, Receptionist, Vet, Pet Owner) and includes an ML-powered service for smart features.

---

## 🏗️ Architecture Overview

```
Frontend (React/Vite)
        │
        ▼
  API Gateway :8080
        │
        ├──► Backend / Main Service :9090  ──► MySQL :3306
        │
        └──► ML Service :8000
  Eureka Server :8761  (Service Discovery)
```

### Services

| Service | Description | Port |
|---|---|---|
| `frontend` | React + Vite UI served via Nginx | `5173` |
| `api-gateway` | Single entry point, routes to services | `8080` |
| `main-service` | Core business logic (Spring Boot) | `9090` |
| `ml-service` | Python ML inference service | `8000` |
| `eureka-server` | Service discovery (Spring Eureka) | `8761` |
| `mysql` | Primary database | `3306` |
| `cloudfront` | CDN · Global frontend delivery | — |

---

## 🚀 Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Git

### Run the Project

```bash
# 1. Clone the repo
git clone https://github.com/mennamohamed-ai/PetClinic-AWS.git
cd PetClinic-AWS

# 2. Start all services
docker-compose up -d

# 3. Wait for all containers to be healthy (~2 minutes)
docker-compose ps
```

The app will be available at **http://localhost:5173**

---

## 👥 Default Users

All users share the same default password: **`PetDemo12!Aa`**

| Email | Role |
|---|---|
| `admin@petclinic.com` | Admin |
| `reception@petclinic.com` | Receptionist |
| `mariam@petclinic.com` | Vet |
| `hany@petclinic.com` | Vet |
| `karim.owner@mail.com` | Pet Owner |

---

## 🛠️ Tech Stack

### Backend
- **Java 21** + **Spring Boot 3**
- Spring Security + JWT Authentication
- Spring Cloud Netflix Eureka (service discovery)
- Spring Cloud Gateway
- BCrypt password hashing (strength 12)

### Frontend
- **React** + **Vite**
- Served via **Nginx** in Docker

### ML Service
- **Python** + FastAPI
- Exposed on port `8000` with `/health` endpoint

### Infrastructure
- **Docker** + **Docker Compose**
- **MySQL 8.4**
- **GitHub Actions** (CI/CD workflows in `.github/workflows`)

---

## ☁️ AWS Cloud Services

| Service | Used for |
|---|---|
| **ECS / Fargate** | Container orchestration — runs all microservices without managing servers |
| **VPC** | Isolated network for all services; subnets, security groups, and NACLs |
| **ALB** | Application Load Balancer routes external traffic to the API Gateway container |
| **CloudFront** | CDN — caches and delivers the React frontend globally with low latency |
| **RDS (MySQL)** | Managed MySQL 8.4 — replaces the local `mysql` container in production |
| **S3** | Stores static assets, DB seed files, and CI/CD build artifacts |
| **ECR** | Private container registry — images pushed by GitHub Actions and pulled at deploy time |
| **IAM** | Role-based access for ECS, GitHub Actions OIDC, and cross-service permissions |
| **CodeDeploy** | Blue/green deployments triggered by GitHub Actions workflows |

---

## 📁 Project Structure

```
PetClinic-AWS/
├── Backend/               # Spring Boot auth + main logic
├── Frontend/              # React + Vite app
├── api-gateway/           # Spring Cloud Gateway
├── eureka-server/         # Service discovery
├── main-service/          # Core business service
├── ml-service/            # Python ML service
├── Diagrams/              # Architecture diagrams
├── docker-compose.yml     # Full stack orchestration
└── mysql_petclinic_seed.sql  # Database seed data
```

---

## 🔑 API Reference

A full Postman collection is included:

```
PetClinic_Backend_Postman_Collection.json
```

Import it into [Postman](https://www.postman.com/) to explore all available endpoints.

---

## 🔒 Security Notes

- Passwords are stored as **BCrypt hashes** (`$2b$12$...`)
- JWT tokens are used for stateless authentication
- CORS is configured to allow `localhost` on any port (development mode)
- CSRF protection is disabled (JWT + SameSite cookie used instead)
