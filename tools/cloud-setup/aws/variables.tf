
# ------------------------------------- Variables --------------------------------------------------

variable "region" {
  description = "Region of the AWS Instance"
  type        = string
  default     = "PLACEHOLDER_REGION"
}

variable "app_name" {
  description = "Name of the AAT app"
  type        = string
  default     = "PLACEHOLDER_APP_NAME"
}

variable "backend_name" {
  description = "Name of the Backend container service"
  type        = string
  default     = "PLACEHOLDER_BACKEND_NAME"
}

variable "admin_app_name" {
  description = "Name of the Admin app s3 bucket"
  type        = string
  default     = "PLACEHOLDER_ADMIN_APP_NAME"
}

variable "contractor_app_name" {
  description = "Name of the contractor app s3 bucket"
  type        = string
  default     = "PLACEHOLDER_CONTRACTOR_APP_NAME"
}

variable "db_password" {
  description = "Password for the Postgres Database"
  type        = string
  default     = "PLACEHOLDER_DB_PASSWORD"
}
