terraform {
  required_providers {
    yandex = {
      source = "yandex-cloud/yandex"
    }
  }
  required_version = ">= 0.13"
}

provider "yandex" {
  zone      = var.zone
  folder_id = var.folder_id
  cloud_id  = var.cloud_id
}


module "static-site" {
  source    = "./terraform-static-site"
  folder_id = var.folder_id

  local_folder = "dist"
  index_file   = "index.html"
  bucket_name  = var.url_prefix
}

output "site_url" {
  # Отображение URL
  value = module.static-site.site_url
}