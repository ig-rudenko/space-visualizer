output "local_site_folder" {
  description = "Вывод пути локальной папки где хранятся файлы сайта"
  value       = local.site_folder
}


output "site_url" {
  description = "Ссылка на поднятый сайт"
  value       = "https://${yandex_storage_bucket.website_bucket.bucket}.website.yandexcloud.net"
}