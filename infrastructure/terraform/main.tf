# ============================================================================
# SGG Digital - Infrastructure Terraform
# Google Cloud Platform Configuration
# ============================================================================

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }

  backend "gcs" {
    bucket = "sgg-terraform-state"
    prefix = "terraform/state"
  }
}

# ============================================================================
# Variables
# ============================================================================

variable "project_id" {
  description = "The GCP project ID"
  type        = string
  default     = "sgg-digital-gabon"
}

variable "region" {
  description = "The GCP region"
  type        = string
  default     = "europe-west1"
}

variable "zone" {
  description = "The GCP zone"
  type        = string
  default     = "europe-west1-b"
}

variable "environment" {
  description = "Environment (prod, staging, dev)"
  type        = string
  default     = "prod"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

# ============================================================================
# Provider Configuration
# ============================================================================

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# ============================================================================
# Enable Required APIs
# ============================================================================

resource "google_project_service" "services" {
  for_each = toset([
    "compute.googleapis.com",
    "sqladmin.googleapis.com",
    "run.googleapis.com",
    "containerregistry.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com",
    "secretmanager.googleapis.com",
    "redis.googleapis.com",
    "cloudtasks.googleapis.com",
    "cloudscheduler.googleapis.com",
    "logging.googleapis.com",
    "monitoring.googleapis.com",
    "servicenetworking.googleapis.com",
    "vpcaccess.googleapis.com",
    "firebase.googleapis.com",
    "identitytoolkit.googleapis.com",
  ])

  project = var.project_id
  service = each.value

  disable_on_destroy = false
}

# ============================================================================
# VPC Network
# ============================================================================

resource "google_compute_network" "sgg_vpc" {
  name                    = "sgg-vpc-${var.environment}"
  auto_create_subnetworks = false
  project                 = var.project_id

  depends_on = [google_project_service.services]
}

resource "google_compute_subnetwork" "sgg_subnet_main" {
  name          = "sgg-subnet-main-${var.environment}"
  ip_cidr_range = "10.0.0.0/20"
  region        = var.region
  network       = google_compute_network.sgg_vpc.id

  private_ip_google_access = true
}

resource "google_compute_subnetwork" "sgg_subnet_db" {
  name          = "sgg-subnet-db-${var.environment}"
  ip_cidr_range = "10.0.16.0/24"
  region        = var.region
  network       = google_compute_network.sgg_vpc.id

  private_ip_google_access = true
}

# Private Service Connection for Cloud SQL
resource "google_compute_global_address" "private_ip_range" {
  name          = "sgg-private-ip-range"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.sgg_vpc.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.sgg_vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_range.name]
}

# VPC Connector for Cloud Run
resource "google_vpc_access_connector" "sgg_connector" {
  name          = "sgg-vpc-connector"
  region        = var.region
  ip_cidr_range = "10.8.0.0/28"
  network       = google_compute_network.sgg_vpc.name

  min_instances = 2
  max_instances = 10

  depends_on = [google_project_service.services]
}

# Cloud NAT for outbound internet access
resource "google_compute_router" "sgg_router" {
  name    = "sgg-router-${var.environment}"
  region  = var.region
  network = google_compute_network.sgg_vpc.id
}

resource "google_compute_router_nat" "sgg_nat" {
  name                               = "sgg-nat-${var.environment}"
  router                             = google_compute_router.sgg_router.name
  region                             = var.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"

  log_config {
    enable = true
    filter = "ERRORS_ONLY"
  }
}

# ============================================================================
# Cloud SQL (PostgreSQL)
# ============================================================================

resource "google_sql_database_instance" "sgg_db" {
  name             = "sgg-db-${var.environment}"
  database_version = "POSTGRES_15"
  region           = var.region

  deletion_protection = var.environment == "prod" ? true : false

  settings {
    tier              = var.environment == "prod" ? "db-custom-4-16384" : "db-custom-2-8192"
    availability_type = var.environment == "prod" ? "REGIONAL" : "ZONAL"
    disk_size         = 100
    disk_type         = "PD_SSD"
    disk_autoresize   = true

    backup_configuration {
      enabled                        = true
      start_time                     = "02:00"
      point_in_time_recovery_enabled = true
      transaction_log_retention_days = 7

      backup_retention_settings {
        retained_backups = 30
        retention_unit   = "COUNT"
      }
    }

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.sgg_vpc.id
      require_ssl     = true
    }

    database_flags {
      name  = "log_connections"
      value = "on"
    }

    database_flags {
      name  = "log_disconnections"
      value = "on"
    }

    database_flags {
      name  = "log_statement"
      value = "ddl"
    }

    database_flags {
      name  = "log_min_duration_statement"
      value = "1000"
    }

    maintenance_window {
      day          = 7 # Sunday
      hour         = 3
      update_track = "stable"
    }

    insights_config {
      query_insights_enabled  = true
      query_string_length     = 1024
      record_application_tags = true
      record_client_address   = true
    }
  }

  depends_on = [google_service_networking_connection.private_vpc_connection]
}

resource "google_sql_database" "sgg_database" {
  name     = "sgg_${var.environment}"
  instance = google_sql_database_instance.sgg_db.name
}

resource "google_sql_user" "sgg_user" {
  name     = "sgg_app"
  instance = google_sql_database_instance.sgg_db.name
  password = var.db_password
}

# ============================================================================
# Cloud Memorystore (Redis)
# ============================================================================

resource "google_redis_instance" "sgg_cache" {
  name           = "sgg-cache-${var.environment}"
  tier           = "STANDARD_HA"
  memory_size_gb = var.environment == "prod" ? 5 : 1
  region         = var.region
  redis_version  = "REDIS_7_0"

  authorized_network = google_compute_network.sgg_vpc.id

  maintenance_policy {
    weekly_maintenance_window {
      day = "SUNDAY"
      start_time {
        hours   = 4
        minutes = 0
      }
    }
  }

  depends_on = [google_project_service.services]
}

# ============================================================================
# Cloud Storage Buckets
# ============================================================================

resource "google_storage_bucket" "sgg_documents" {
  name          = "sgg-documents-${var.environment}"
  location      = var.region
  storage_class = "STANDARD"

  uniform_bucket_level_access = true
  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type          = "SetStorageClass"
      storage_class = "NEARLINE"
    }
  }

  cors {
    origin          = ["https://sgg.ga", "https://*.sgg.ga"]
    method          = ["GET", "HEAD"]
    response_header = ["Content-Type"]
    max_age_seconds = 3600
  }
}

resource "google_storage_bucket" "sgg_uploads" {
  name          = "sgg-uploads-${var.environment}"
  location      = var.region
  storage_class = "STANDARD"

  uniform_bucket_level_access = true
  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age                   = 7
      matches_storage_class = ["STANDARD"]
      with_state            = "ARCHIVED"
    }
    action {
      type = "Delete"
    }
  }

  cors {
    origin          = ["https://sgg.ga", "https://*.sgg.ga"]
    method          = ["GET", "PUT", "POST"]
    response_header = ["Content-Type", "Content-Length"]
    max_age_seconds = 3600
  }
}

resource "google_storage_bucket" "sgg_backups" {
  name          = "sgg-backups-${var.environment}"
  location      = var.region
  storage_class = "NEARLINE"

  uniform_bucket_level_access = true
  versioning {
    enabled = true
  }

  retention_policy {
    retention_period = 2592000 # 30 days in seconds
  }
}

# ============================================================================
# Secret Manager
# ============================================================================

resource "google_secret_manager_secret" "db_url" {
  secret_id = "sgg-database-url-${var.environment}"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "db_url_version" {
  secret      = google_secret_manager_secret.db_url.id
  secret_data = "postgresql://sgg_app:${var.db_password}@${google_sql_database_instance.sgg_db.private_ip_address}:5432/sgg_${var.environment}"
}

resource "google_secret_manager_secret" "jwt_secret" {
  secret_id = "sgg-jwt-secret-${var.environment}"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "redis_url" {
  secret_id = "sgg-redis-url-${var.environment}"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "redis_url_version" {
  secret      = google_secret_manager_secret.redis_url.id
  secret_data = "redis://${google_redis_instance.sgg_cache.host}:${google_redis_instance.sgg_cache.port}"
}

# ============================================================================
# Cloud Run Services
# ============================================================================

resource "google_cloud_run_v2_service" "sgg_api" {
  name     = "sgg-api"
  location = var.region

  template {
    scaling {
      min_instance_count = 1
      max_instance_count = var.environment == "prod" ? 20 : 5
    }

    vpc_access {
      connector = google_vpc_access_connector.sgg_connector.id
      egress    = "ALL_TRAFFIC"
    }

    containers {
      image = "eu.gcr.io/${var.project_id}/sgg-api:latest"

      ports {
        container_port = 8080
      }

      resources {
        limits = {
          cpu    = "2"
          memory = "1Gi"
        }
        cpu_idle = false
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "GCS_BUCKET"
        value = google_storage_bucket.sgg_documents.name
      }

      env {
        name = "DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.db_url.secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "REDIS_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.redis_url.secret_id
            version = "latest"
          }
        }
      }
    }

    service_account = google_service_account.sgg_api_sa.email
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  depends_on = [
    google_project_service.services,
    google_secret_manager_secret_version.db_url_version,
    google_secret_manager_secret_version.redis_url_version
  ]
}

resource "google_cloud_run_v2_service" "sgg_frontend" {
  name     = "sgg-frontend"
  location = var.region

  template {
    scaling {
      min_instance_count = 1
      max_instance_count = var.environment == "prod" ? 10 : 3
    }

    containers {
      image = "eu.gcr.io/${var.project_id}/sgg-frontend:latest"

      ports {
        container_port = 80
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  depends_on = [google_project_service.services]
}

# Allow unauthenticated access to frontend
resource "google_cloud_run_service_iam_member" "frontend_public" {
  location = google_cloud_run_v2_service.sgg_frontend.location
  service  = google_cloud_run_v2_service.sgg_frontend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ============================================================================
# Service Accounts
# ============================================================================

resource "google_service_account" "sgg_api_sa" {
  account_id   = "sgg-api-${var.environment}"
  display_name = "SGG API Service Account"
}

resource "google_project_iam_member" "sgg_api_sql" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.sgg_api_sa.email}"
}

resource "google_project_iam_member" "sgg_api_storage" {
  project = var.project_id
  role    = "roles/storage.objectAdmin"
  member  = "serviceAccount:${google_service_account.sgg_api_sa.email}"
}

resource "google_project_iam_member" "sgg_api_secrets" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.sgg_api_sa.email}"
}

# ============================================================================
# Cloud Armor (Security Policy)
# ============================================================================

resource "google_compute_security_policy" "sgg_security" {
  name = "sgg-security-policy"

  # Block malicious countries
  rule {
    action   = "deny(403)"
    priority = 100
    match {
      expr {
        expression = "origin.region_code == 'RU' || origin.region_code == 'CN' || origin.region_code == 'KP'"
      }
    }
    description = "Block malicious countries"
  }

  # Rate limiting
  rule {
    action   = "throttle"
    priority = 200
    match {
      expr {
        expression = "true"
      }
    }
    rate_limit_options {
      conform_action = "allow"
      exceed_action  = "deny(429)"
      rate_limit_threshold {
        count        = 100
        interval_sec = 60
      }
    }
    description = "Rate limit all requests"
  }

  # SQL Injection protection
  rule {
    action   = "deny(403)"
    priority = 300
    match {
      expr {
        expression = "evaluatePreconfiguredExpr('sqli-stable')"
      }
    }
    description = "SQL Injection protection"
  }

  # XSS protection
  rule {
    action   = "deny(403)"
    priority = 400
    match {
      expr {
        expression = "evaluatePreconfiguredExpr('xss-stable')"
      }
    }
    description = "XSS protection"
  }

  # Default allow
  rule {
    action   = "allow"
    priority = 2147483647
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    description = "Default allow rule"
  }
}

# ============================================================================
# Cloud Scheduler (Cron Jobs)
# ============================================================================

resource "google_cloud_scheduler_job" "cleanup_sessions" {
  name        = "sgg-cleanup-sessions"
  description = "Clean up expired sessions"
  schedule    = "0 2 * * *" # Daily at 2 AM
  time_zone   = "Africa/Libreville"

  http_target {
    http_method = "POST"
    uri         = "${google_cloud_run_v2_service.sgg_api.uri}/api/internal/cleanup-sessions"

    oidc_token {
      service_account_email = google_service_account.sgg_api_sa.email
    }
  }
}

resource "google_cloud_scheduler_job" "gar_reminders" {
  name        = "sgg-gar-reminders"
  description = "Send GAR report reminders"
  schedule    = "0 8 25 * *" # 25th of each month at 8 AM
  time_zone   = "Africa/Libreville"

  http_target {
    http_method = "POST"
    uri         = "${google_cloud_run_v2_service.sgg_api.uri}/api/internal/gar-reminders"

    oidc_token {
      service_account_email = google_service_account.sgg_api_sa.email
    }
  }
}

resource "google_cloud_scheduler_job" "nomination_alerts" {
  name        = "sgg-nomination-alerts"
  description = "Check nomination deadlines and send alerts"
  schedule    = "0 9 * * 1-5" # Weekdays at 9 AM
  time_zone   = "Africa/Libreville"

  http_target {
    http_method = "POST"
    uri         = "${google_cloud_run_v2_service.sgg_api.uri}/api/internal/nomination-alerts"

    oidc_token {
      service_account_email = google_service_account.sgg_api_sa.email
    }
  }
}

# ============================================================================
# Monitoring & Alerting
# ============================================================================

resource "google_monitoring_notification_channel" "email" {
  display_name = "SGG Admin Email"
  type         = "email"

  labels = {
    email_address = "alerts@sgg.ga"
  }
}

resource "google_monitoring_uptime_check_config" "api_check" {
  display_name = "SGG API Health Check"
  timeout      = "10s"
  period       = "60s"

  http_check {
    path         = "/api/health"
    port         = 443
    use_ssl      = true
    validate_ssl = true
  }

  monitored_resource {
    type = "uptime_url"
    labels = {
      project_id = var.project_id
      host       = "api.sgg.ga"
    }
  }
}

resource "google_monitoring_alert_policy" "uptime_alert" {
  display_name = "SGG API Down"
  combiner     = "OR"

  conditions {
    display_name = "Uptime check failed"
    condition_threshold {
      filter          = "metric.type=\"monitoring.googleapis.com/uptime_check/check_passed\" AND resource.type=\"uptime_url\""
      duration        = "60s"
      comparison      = "COMPARISON_LT"
      threshold_value = 1
      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_FRACTION_TRUE"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.id]

  alert_strategy {
    auto_close = "1800s"
  }
}

resource "google_monitoring_alert_policy" "error_rate" {
  display_name = "High Error Rate"
  combiner     = "OR"

  conditions {
    display_name = "Error rate > 1%"
    condition_threshold {
      filter          = "resource.type=\"cloud_run_revision\" AND metric.type=\"run.googleapis.com/request_count\" AND metric.labels.response_code_class=\"5xx\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0.01

      aggregations {
        alignment_period     = "60s"
        per_series_aligner   = "ALIGN_RATE"
        cross_series_reducer = "REDUCE_SUM"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.id]
}

# ============================================================================
# Outputs
# ============================================================================

output "database_connection_name" {
  value       = google_sql_database_instance.sgg_db.connection_name
  description = "Cloud SQL connection name"
}

output "database_private_ip" {
  value       = google_sql_database_instance.sgg_db.private_ip_address
  description = "Cloud SQL private IP"
  sensitive   = true
}

output "redis_host" {
  value       = google_redis_instance.sgg_cache.host
  description = "Redis host"
}

output "api_url" {
  value       = google_cloud_run_v2_service.sgg_api.uri
  description = "Cloud Run API URL"
}

output "frontend_url" {
  value       = google_cloud_run_v2_service.sgg_frontend.uri
  description = "Cloud Run Frontend URL"
}

output "storage_buckets" {
  value = {
    documents = google_storage_bucket.sgg_documents.name
    uploads   = google_storage_bucket.sgg_uploads.name
    backups   = google_storage_bucket.sgg_backups.name
  }
  description = "Storage bucket names"
}
