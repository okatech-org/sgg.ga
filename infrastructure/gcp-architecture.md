# SGG Digital - Architecture Google Cloud Platform

## Vue d'ensemble

Ce document décrit l'architecture cloud complète pour SGG Digital sur Google Cloud Platform (GCP).

---

## 1. Schéma d'Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              GOOGLE CLOUD PLATFORM                               │
│                           Projet: sgg-digital-gabon                              │
│                              Région: europe-west1                                │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            CLOUD ARMOR + CLOUD CDN                               │
│                           (Protection DDoS + Cache)                              │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           CLOUD LOAD BALANCER                                    │
│                          (HTTPS Load Balancing)                                  │
│                         sgg.ga / api.sgg.ga                                     │
└─────────────────────────────────────────────────────────────────────────────────┘
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌───────────────────────────────────┐ ┌───────────────────────────────────┐
│         CLOUD RUN                  │ │         CLOUD RUN                  │
│      (Frontend React)              │ │       (Backend API)                │
│                                    │ │                                    │
│  ┌─────────────────────────────┐  │ │  ┌─────────────────────────────┐  │
│  │   Container: sgg-frontend   │  │ │  │   Container: sgg-api         │  │
│  │   Image: React/Nginx        │  │ │  │   Image: Node.js/Express     │  │
│  │   CPU: 1, Memory: 512Mi     │  │ │  │   CPU: 2, Memory: 1Gi        │  │
│  │   Min: 1, Max: 10           │  │ │  │   Min: 1, Max: 20            │  │
│  └─────────────────────────────┘  │ │  └─────────────────────────────┘  │
└───────────────────────────────────┘ └───────────────────┬───────────────┘
                                                          │
                    ┌─────────────────────────────────────┼─────────────────┐
                    │                                     │                 │
                    ▼                                     ▼                 ▼
┌───────────────────────────────┐ ┌───────────────────────────────┐ ┌───────────────────┐
│     CLOUD SQL                  │ │    CLOUD STORAGE               │ │  SECRET MANAGER   │
│    (PostgreSQL 15)             │ │                                │ │                   │
│                                │ │  ┌─────────────────────────┐  │ │  • DB credentials │
│  Instance: sgg-db-prod         │ │  │ sgg-documents-prod      │  │ │  • API keys       │
│  Tier: db-custom-4-16384       │ │  │ (Documents officiels)   │  │ │  • JWT secrets    │
│  Storage: 100GB SSD            │ │  └─────────────────────────┘  │ │  • OAuth secrets  │
│  HA: Enabled                   │ │  ┌─────────────────────────┐  │ │                   │
│  Backup: Daily                 │ │  │ sgg-uploads-prod        │  │ └───────────────────┘
│  Private IP                    │ │  │ (Fichiers utilisateurs) │  │
│                                │ │  └─────────────────────────┘  │
│  Databases:                    │ │  ┌─────────────────────────┐  │
│  • sgg_production              │ │  │ sgg-backups-prod        │  │
│  • sgg_staging                 │ │  │ (Sauvegardes)           │  │
│                                │ │  └─────────────────────────┘  │
└───────────────────────────────┘ └───────────────────────────────┘

                    │                                     │
                    ▼                                     ▼
┌───────────────────────────────┐ ┌───────────────────────────────┐
│    CLOUD MEMORYSTORE           │ │    CLOUD TASKS                 │
│       (Redis)                  │ │    (File d'attente)            │
│                                │ │                                │
│  Instance: sgg-cache           │ │  • Envoi emails               │
│  Memory: 5GB                   │ │  • Génération PDF             │
│  Version: 7.0                  │ │  • Notifications push         │
│                                │ │  • Traitements batch          │
│  Usage:                        │ │                                │
│  • Sessions                    │ └───────────────────────────────┘
│  • Cache API                   │
│  • Rate limiting               │ ┌───────────────────────────────┐
│                                │ │    CLOUD SCHEDULER             │
└───────────────────────────────┘ │    (Tâches planifiées)         │
                                   │                                │
                                   │  • Nettoyage sessions         │
                                   │  • Rapports automatiques      │
                                   │  • Alertes délais             │
                                   │  • Sauvegardes                │
                                   └───────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              SERVICES TRANSVERSES                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐    │
│  │  FIREBASE AUTH      │  │  CLOUD LOGGING      │  │  CLOUD MONITORING   │    │
│  │                     │  │                     │  │                     │    │
│  │  • Email/Password   │  │  • Application logs │  │  • Uptime checks    │    │
│  │  • OAuth2 (Google)  │  │  • Audit logs       │  │  • Alerting         │    │
│  │  • MFA              │  │  • Error tracking   │  │  • Dashboards       │    │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘    │
│                                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐    │
│  │  CLOUD ARMOR        │  │  VPC NETWORK        │  │  IDENTITY-AWARE     │    │
│  │                     │  │                     │  │  PROXY (IAP)        │    │
│  │  • WAF rules        │  │  • Private subnet   │  │                     │    │
│  │  • Rate limiting    │  │  • VPC connector    │  │  • Admin access     │    │
│  │  • Geo-blocking     │  │  • Firewall rules   │  │  • Zero-trust       │    │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Composants Détaillés

### 2.1 Cloud SQL (PostgreSQL)

**Configuration:**
```yaml
Instance: sgg-db-prod
Region: europe-west1
Zone: europe-west1-b (Primary)
      europe-west1-c (Replica HA)

Machine Type: db-custom-4-16384
  - vCPUs: 4
  - Memory: 16 GB

Storage:
  Type: SSD
  Size: 100 GB
  Auto-resize: Enabled (max 500 GB)

Availability:
  Type: Regional (High Availability)
  Failover Replica: Automatic

Backup:
  Automated: Daily at 02:00 UTC
  Retention: 30 days
  Point-in-time Recovery: Enabled (7 days)

Network:
  Connectivity: Private IP only
  VPC: sgg-vpc-prod
  Authorized Networks: None (VPC only)

Maintenance:
  Window: Sunday 03:00-04:00 UTC
  Updates: Automatic

Flags:
  - log_connections: on
  - log_disconnections: on
  - log_statement: ddl
  - log_min_duration_statement: 1000
```

### 2.2 Cloud Run (Backend API)

**Configuration:**
```yaml
Service: sgg-api
Region: europe-west1

Container:
  Image: eu.gcr.io/sgg-digital-gabon/sgg-api:latest
  Port: 8080
  Command: ["node", "dist/server.js"]

Resources:
  CPU: 2
  Memory: 1Gi
  CPU Throttling: false

Scaling:
  Min Instances: 1
  Max Instances: 20
  Concurrency: 80

Networking:
  Ingress: Internal and Cloud Load Balancing
  VPC Connector: sgg-vpc-connector
  Egress: All traffic through VPC connector

Environment Variables:
  NODE_ENV: production
  DATABASE_URL: (from Secret Manager)
  REDIS_URL: (from Secret Manager)
  GCS_BUCKET: sgg-documents-prod

Secrets (from Secret Manager):
  - DATABASE_URL
  - JWT_SECRET
  - FIREBASE_CONFIG
  - SENDGRID_API_KEY
```

### 2.3 Cloud Run (Frontend)

**Configuration:**
```yaml
Service: sgg-frontend
Region: europe-west1

Container:
  Image: eu.gcr.io/sgg-digital-gabon/sgg-frontend:latest
  Port: 80

Resources:
  CPU: 1
  Memory: 512Mi

Scaling:
  Min Instances: 1
  Max Instances: 10
  Concurrency: 200

Networking:
  Ingress: All
```

### 2.4 Cloud Storage

**Buckets:**

| Bucket | Usage | Classe | Accès |
|--------|-------|--------|-------|
| `sgg-documents-prod` | Documents officiels (JO, décrets) | Standard | Public (lecture) |
| `sgg-uploads-prod` | Fichiers utilisateurs | Standard | Privé (signé) |
| `sgg-backups-prod` | Sauvegardes DB et fichiers | Nearline | Privé |
| `sgg-static-prod` | Assets statiques (images, fonts) | Standard | Public CDN |

**Configuration sécurité:**
```yaml
# sgg-documents-prod
Uniform Bucket-Level Access: Enabled
Versioning: Enabled
Lifecycle:
  - Archive after 365 days
  - Delete versions after 90 days

# sgg-uploads-prod
Uniform Bucket-Level Access: Enabled
Versioning: Enabled
CORS:
  - Origin: https://sgg.ga
    Methods: [GET, PUT, POST]
    MaxAge: 3600
Lifecycle:
  - Delete incomplete uploads after 7 days
  - Archive after 365 days

# sgg-backups-prod
Retention Policy: 30 days
Object Lock: Enabled
```

### 2.5 Cloud Memorystore (Redis)

**Configuration:**
```yaml
Instance: sgg-cache
Region: europe-west1
Tier: Standard (HA)
Memory: 5 GB
Version: 7.0

Network:
  VPC: sgg-vpc-prod
  IP Range: 10.0.2.0/29

Maintenance:
  Window: Sunday 04:00-05:00 UTC

Usage:
  - Session storage
  - API response cache
  - Rate limiting counters
  - Pub/Sub for real-time
```

### 2.6 Firebase Auth

**Configuration:**
```yaml
Project: sgg-digital-gabon

Sign-in Methods:
  - Email/Password: Enabled
  - Google: Enabled (for internal users)
  - Phone: Enabled (SMS OTP)

Multi-Factor Authentication: Optional (Recommended for admins)

Email Templates:
  - Password Reset: Custom (French)
  - Email Verification: Custom (French)

Security Rules:
  - Session Duration: 7 days
  - Token Refresh: Automatic
```

---

## 3. Réseau et Sécurité

### 3.1 VPC Configuration

```yaml
Network: sgg-vpc-prod
Region: europe-west1

Subnets:
  - Name: sgg-subnet-main
    Range: 10.0.0.0/20
    Region: europe-west1
    Private Google Access: Enabled

  - Name: sgg-subnet-db
    Range: 10.0.16.0/24
    Region: europe-west1
    Purpose: Cloud SQL

VPC Connector:
  Name: sgg-vpc-connector
  Region: europe-west1
  Network: sgg-vpc-prod
  IP Range: 10.8.0.0/28
  Min Instances: 2
  Max Instances: 10

Cloud NAT:
  Name: sgg-nat
  Region: europe-west1
  Purpose: Outbound internet for Cloud Run
```

### 3.2 Firewall Rules

```yaml
Rules:
  - Name: allow-internal
    Direction: Ingress
    Priority: 1000
    Source: 10.0.0.0/8
    Targets: All instances
    Protocols: All
    Action: Allow

  - Name: allow-health-checks
    Direction: Ingress
    Priority: 1000
    Source: 130.211.0.0/22, 35.191.0.0/16
    Targets: All instances
    Protocols: TCP:8080
    Action: Allow

  - Name: deny-all-ingress
    Direction: Ingress
    Priority: 65534
    Source: 0.0.0.0/0
    Action: Deny
```

### 3.3 Cloud Armor (WAF)

```yaml
Policy: sgg-security-policy

Rules:
  - Name: block-malicious-countries
    Priority: 100
    Match: origin.region_code in ['RU', 'CN', 'KP']
    Action: Deny(403)

  - Name: rate-limit-api
    Priority: 200
    Match: request.path.startsWith('/api/')
    Rate Limit:
      Threshold: 100
      Interval: 60s
    Action: Throttle

  - Name: owasp-sql-injection
    Priority: 300
    Expression: evaluatePreconfiguredExpr('sqli-stable')
    Action: Deny(403)

  - Name: owasp-xss
    Priority: 400
    Expression: evaluatePreconfiguredExpr('xss-stable')
    Action: Deny(403)

  - Name: allow-all
    Priority: 2147483647
    Match: true
    Action: Allow
```

---

## 4. CI/CD Pipeline

### 4.1 Cloud Build Configuration

```yaml
# cloudbuild.yaml
steps:
  # Build Frontend
  - name: 'node:20'
    entrypoint: 'npm'
    args: ['ci']
    dir: 'frontend'
    id: 'install-frontend'

  - name: 'node:20'
    entrypoint: 'npm'
    args: ['run', 'build']
    dir: 'frontend'
    id: 'build-frontend'
    waitFor: ['install-frontend']

  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'eu.gcr.io/$PROJECT_ID/sgg-frontend:$COMMIT_SHA', '-f', 'frontend/Dockerfile', 'frontend']
    id: 'docker-frontend'
    waitFor: ['build-frontend']

  # Build Backend
  - name: 'node:20'
    entrypoint: 'npm'
    args: ['ci']
    dir: 'backend'
    id: 'install-backend'

  - name: 'node:20'
    entrypoint: 'npm'
    args: ['run', 'build']
    dir: 'backend'
    id: 'build-backend'
    waitFor: ['install-backend']

  - name: 'node:20'
    entrypoint: 'npm'
    args: ['test']
    dir: 'backend'
    id: 'test-backend'
    waitFor: ['build-backend']

  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'eu.gcr.io/$PROJECT_ID/sgg-api:$COMMIT_SHA', '-f', 'backend/Dockerfile', 'backend']
    id: 'docker-backend'
    waitFor: ['test-backend']

  # Push images
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'eu.gcr.io/$PROJECT_ID/sgg-frontend:$COMMIT_SHA']
    waitFor: ['docker-frontend']

  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'eu.gcr.io/$PROJECT_ID/sgg-api:$COMMIT_SHA']
    waitFor: ['docker-backend']

  # Deploy to Cloud Run
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'sgg-frontend'
      - '--image=eu.gcr.io/$PROJECT_ID/sgg-frontend:$COMMIT_SHA'
      - '--region=europe-west1'
      - '--platform=managed'

  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'sgg-api'
      - '--image=eu.gcr.io/$PROJECT_ID/sgg-api:$COMMIT_SHA'
      - '--region=europe-west1'
      - '--platform=managed'

  # Run database migrations
  - name: 'gcr.io/cloud-builders/gcloud'
    entrypoint: 'bash'
    args:
      - '-c'
      - |
        gcloud run jobs execute sgg-db-migrate --region=europe-west1 --wait

timeout: '1800s'
options:
  logging: CLOUD_LOGGING_ONLY
```

---

## 5. Monitoring et Alerting

### 5.1 Dashboards

```yaml
Dashboards:
  - Name: SGG Overview
    Widgets:
      - Cloud Run Request Count
      - Cloud Run Latency (p50, p95, p99)
      - Cloud SQL Connections
      - Cloud SQL CPU/Memory
      - Redis Hit Rate
      - Error Rate by Service

  - Name: Business Metrics
    Widgets:
      - Nominations par jour
      - Textes en cours par étape
      - Courriers traités
      - Connexions utilisateurs
```

### 5.2 Alerting Policies

```yaml
Policies:
  - Name: High Error Rate
    Condition: Cloud Run error rate > 1%
    Duration: 5 minutes
    Notification: Email + Slack

  - Name: Database Connection Saturation
    Condition: Cloud SQL connections > 80%
    Duration: 5 minutes
    Notification: Email + PagerDuty

  - Name: High Latency
    Condition: Cloud Run p95 latency > 2s
    Duration: 10 minutes
    Notification: Email

  - Name: Service Down
    Condition: Uptime check fails
    Duration: 1 minute
    Notification: Email + SMS + PagerDuty

  - Name: Storage Quota
    Condition: Cloud SQL storage > 80%
    Duration: 1 hour
    Notification: Email
```

---

## 6. Estimation des Coûts

### Coûts Mensuels Estimés (Production)

| Service | Configuration | Coût Estimé (USD) |
|---------|---------------|-------------------|
| Cloud SQL | db-custom-4-16384, HA, 100GB | ~$350 |
| Cloud Run (API) | 2 vCPU, 1Gi, avg 5 instances | ~$150 |
| Cloud Run (Frontend) | 1 vCPU, 512Mi, avg 2 instances | ~$50 |
| Cloud Storage | 500GB Standard + 100GB Nearline | ~$20 |
| Cloud Memorystore | 5GB Standard | ~$150 |
| Cloud Load Balancer | HTTPS LB | ~$25 |
| Cloud Armor | Standard | ~$15 |
| Cloud NAT | Egress | ~$30 |
| Firebase Auth | 10,000 MAU | Gratuit |
| Cloud Build | 120 min/jour | ~$10 |
| Logging/Monitoring | 50GB logs | ~$25 |
| **TOTAL** | | **~$825/mois** |

### Notes:
- Les coûts peuvent varier selon l'utilisation réelle
- Réductions possibles avec Committed Use Discounts
- Environnement de staging : ~30% du coût production

---

## 7. Plan de Déploiement

### Phase 1: Infrastructure (Semaine 1-2)
- [ ] Créer le projet GCP
- [ ] Configurer le VPC et les sous-réseaux
- [ ] Déployer Cloud SQL
- [ ] Configurer Cloud Storage
- [ ] Déployer Redis
- [ ] Configurer Firebase Auth

### Phase 2: Application (Semaine 3-4)
- [ ] Conteneuriser le frontend
- [ ] Conteneuriser le backend
- [ ] Configurer Cloud Run
- [ ] Configurer le Load Balancer
- [ ] Migrer les données

### Phase 3: Sécurité (Semaine 5)
- [ ] Configurer Cloud Armor
- [ ] Configurer IAP
- [ ] Audit de sécurité
- [ ] Tests de pénétration

### Phase 4: Production (Semaine 6)
- [ ] Migration DNS
- [ ] Tests de charge
- [ ] Formation équipe
- [ ] Go-live

---

## 8. Contacts et Support

| Rôle | Contact |
|------|---------|
| Project Lead | project-lead@sgg.ga |
| DevOps | devops@sgg.ga |
| Security | security@sgg.ga |
| GCP Support | Via Console GCP |

---

*Document créé le 5 février 2026*
*Version 1.0*
