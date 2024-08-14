locals {
  bucket_sa_name = "bucket-sa-${var.bucket_name}"
  bucket_name    = "${var.bucket_name}-${random_string.bucket.result}"
  site_folder    = "${path.root}/${var.local_folder}"
  index_document = var.index_file
}

resource "yandex_storage_bucket" "website_bucket" {
  bucket = local.bucket_name
  acl    = "public-read"

  website {
    index_document = local.index_document
    #     error_document = "error.html"
    routing_rules = <<EOF
      [{
          "Condition": {
              "KeyPrefixEquals": "images/"
          },
          "Redirect": {
              "ReplaceKeyPrefixWith": "space-visualizer/images/"
          }
      }]
      EOF
  }
  access_key = yandex_iam_service_account_static_access_key.this.access_key
  secret_key = yandex_iam_service_account_static_access_key.this.secret_key

  depends_on = [yandex_resourcemanager_folder_iam_member.storage_editor]
}

resource "yandex_storage_object" "index_file" {
  bucket = yandex_storage_bucket.website_bucket.bucket

  key          = local.index_document
  source       = "${local.site_folder}/${local.index_document}"
  content_type = "text/html"

  access_key = yandex_iam_service_account_static_access_key.this.access_key
  secret_key = yandex_iam_service_account_static_access_key.this.secret_key

}

resource "yandex_storage_object" "website_files" {
  for_each = fileset(local.site_folder, "**")

  bucket = yandex_storage_bucket.website_bucket.bucket
  key    = "space-visualizer/${each.key}"
  source = "${local.site_folder}/${each.key}"
  content_type = lookup(
    var.mime_types,
    element(split(".", each.value), length(split(".", each.value)) - 1),
    "application/octet-stream"
  )
  access_key = yandex_iam_service_account_static_access_key.this.access_key
  secret_key = yandex_iam_service_account_static_access_key.this.secret_key

}


resource "yandex_iam_service_account" "bucket" {
  # Создаем сервисный аккаунт.
  name        = local.bucket_sa_name
  description = "Сервисный аккаунт для Object Storage"
}


resource "yandex_resourcemanager_folder_iam_member" "storage_editor" {
  # Добавляем для сервисного аккаунта роль.
  folder_id = var.folder_id
  member    = "serviceAccount:${yandex_iam_service_account.bucket.id}"
  role      = "storage.editor"
}

resource "yandex_iam_service_account_static_access_key" "this" {
  # Создание статического ключа доступа
  service_account_id = yandex_iam_service_account.bucket.id
  description        = "Создание статического ключа доступа для bucket"
}


resource "random_string" "bucket" {
  length  = 8
  special = false
  upper   = false
}
