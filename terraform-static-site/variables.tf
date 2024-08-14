variable "bucket_name" {
  description = "Название bucket для статического сайта"
  default     = "my-site"
  type        = string
}

variable "folder_id" {
  description = "Идентификатор каталога в облаке"
  type        = string
  nullable    = false
}

variable "local_folder" {
  description = "Локальная папка с файлами сайта (относительный путь)"
  type        = string
  default     = "dist"
}

variable "index_file" {
  description = "Имя файла для отображения главной страницы"
  type        = string
  default     = "index.html"
}

variable "mime_types" {
  description = "Структура форматов файлов и MIME типов, для работы сайта. Лучше не менять."
  type        = map(string)
  default = {
    "html" = "text/html"
    "css"  = "text/css"
    "js"   = "application/javascript"
    "png"  = "image/png"
    "jpg"  = "image/jpeg"
    "jpeg" = "image/jpeg"
    "gif"  = "image/gif"
    "svg"  = "image/svg+xml"
    # Add other mime types if needed
  }
}
