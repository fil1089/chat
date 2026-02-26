> ## Documentation Index
> Fetch the complete documentation index at: https://polza.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Удалить файл

> Удаление файла из хранилища

## Пример

```bash  theme={null}
curl -X DELETE "https://polza.ai/api/v1/storage/files/file_abc123" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Ответ (200)

```json  theme={null}
{
  "success": true
}
```

<Warning>
  Удаление файла необратимо. Файл будет удалён из хранилища и CDN.
</Warning>


## OpenAPI

````yaml DELETE /v1/storage/files/{id}
openapi: 3.0.0
info:
  title: Polza.ai API
  description: AI агрегатор — унифицированный доступ к сотням AI моделей
  version: '1.0'
  contact: {}
servers:
  - url: https://polza.ai/api
    description: Production
security: []
tags: []
paths:
  /v1/storage/files/{id}:
    delete:
      tags:
        - Хранилище
      summary: Удалить файл
      operationId: StorageController_deleteFile[1]
      parameters:
        - name: id
          required: true
          in: path
          schema:
            type: string
      responses:
        '200':
          description: ''
      security:
        - bearer: []
components:
  securitySchemes:
    bearer:
      type: http
      scheme: bearer
      bearerFormat: API Key
      description: >-
        API ключ передаётся в заголовке: Authorization: Bearer
        <POLZA_AI_API_KEY>

````