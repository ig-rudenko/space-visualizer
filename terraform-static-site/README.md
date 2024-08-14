<!-- BEGIN_TF_DOCS -->
## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_terraform"></a> [terraform](#requirement\_terraform) | >= 1.0.0 |
| <a name="requirement_yandex"></a> [yandex](#requirement\_yandex) | >= 0.101.0 |

## Providers

| Name | Version |
|------|---------|
| <a name="provider_random"></a> [random](#provider\_random) | n/a |
| <a name="provider_yandex"></a> [yandex](#provider\_yandex) | >= 0.101.0 |

## Modules

No modules.

## Resources

| Name | Type |
|------|------|
| [random_string.bucket](https://registry.terraform.io/providers/hashicorp/random/latest/docs/resources/string) | resource |
| [yandex_iam_service_account.bucket](https://registry.terraform.io/providers/yandex-cloud/yandex/latest/docs/resources/iam_service_account) | resource |
| [yandex_iam_service_account_static_access_key.this](https://registry.terraform.io/providers/yandex-cloud/yandex/latest/docs/resources/iam_service_account_static_access_key) | resource |
| [yandex_resourcemanager_folder_iam_member.storage_editor](https://registry.terraform.io/providers/yandex-cloud/yandex/latest/docs/resources/resourcemanager_folder_iam_member) | resource |
| [yandex_storage_bucket.website_bucket](https://registry.terraform.io/providers/yandex-cloud/yandex/latest/docs/resources/storage_bucket) | resource |
| [yandex_storage_object.index_file](https://registry.terraform.io/providers/yandex-cloud/yandex/latest/docs/resources/storage_object) | resource |
| [yandex_storage_object.website_files](https://registry.terraform.io/providers/yandex-cloud/yandex/latest/docs/resources/storage_object) | resource |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_bucket_name"></a> [bucket\_name](#input\_bucket\_name) | Название bucket для статического сайта | `string` | `"my-site"` | no |
| <a name="input_folder_id"></a> [folder\_id](#input\_folder\_id) | Идентификатор каталога в облаке | `string` | n/a | yes |
| <a name="input_index_file"></a> [index\_file](#input\_index\_file) | Имя файла для отображения главной страницы | `string` | `"index.html"` | no |
| <a name="input_local_folder"></a> [local\_folder](#input\_local\_folder) | Локальная папка с файлами сайта (относительный путь) | `string` | `"dist"` | no |
| <a name="input_mime_types"></a> [mime\_types](#input\_mime\_types) | Структура форматов файлов и MIME типов, для работы сайта. Лучше не менять. | `map(string)` | <pre>{<br>  "css": "text/css",<br>  "gif": "image/gif",<br>  "html": "text/html",<br>  "jpeg": "image/jpeg",<br>  "jpg": "image/jpeg",<br>  "js": "application/javascript",<br>  "png": "image/png",<br>  "svg": "image/svg+xml"<br>}</pre> | no |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_local_site_folder"></a> [local\_site\_folder](#output\_local\_site\_folder) | Вывод пути локальной папки где хранятся файлы сайта |
| <a name="output_site_url"></a> [site\_url](#output\_site\_url) | Ссылка на поднятый сайт |
<!-- END_TF_DOCS -->