variable "folder_id" {
  description = "Идентификатор каталога в облаке"
  type        = string
  nullable    = false
}

variable "url_prefix" {
  description = "Префикс URL адреса и название bucket"
  type        = string
  default     = "space.visualizer"
}

variable "cloud_id" {
  description = "Идентификатор Облака"
  type        = string
  nullable    = false
}

variable "zone" {
  description = "Имя зоны доступности"
  type        = string
  nullable    = false
  validation {
    condition     = contains(["ru-central1-a", "ru-central1-b", "ru-central1-d"], var.zone)
    error_message = "Зона доступности должна быть указана!"
  }
}
