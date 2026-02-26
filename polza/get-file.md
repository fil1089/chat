> ## Documentation Index
> Fetch the complete documentation index at: https://polza.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Информация о файле

> Получение информации о конкретном файле

## Пример

```bash  theme={null}
curl "https://polza.ai/api/v1/storage/files/file_abc123" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Ответ (200)

```json  theme={null}
{
  "id": "file_abc123",
  "fileType": "IMAGE",
  "mimeType": "image/png",
  "source": "USER_UPLOAD",
  "storagePolicy": "PERMANENT",
  "url": "https://cdn.polza.ai/files/file_abc123.png",
  "size": 245760,
  "externalUserId": null,
  "expiresAt": null,
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

## Поля ответа

| Поле             | Тип          | Описание                               |
| ---------------- | ------------ | -------------------------------------- |
| `id`             | string       | ID файла                               |
| `fileType`       | string       | Тип: IMAGE, VIDEO, AUDIO               |
| `mimeType`       | string       | MIME-тип (например, image/png)         |
| `source`         | string       | Источник: USER\_UPLOAD, AI\_GENERATION |
| `storagePolicy`  | string       | Политика хранения                      |
| `url`            | string       | URL файла на CDN                       |
| `size`           | number       | Размер в байтах                        |
| `externalUserId` | string\|null | Внешний ID пользователя                |
| `expiresAt`      | string\|null | Дата истечения (null для PERMANENT)    |
| `createdAt`      | string       | Дата создания                          |
| `updatedAt`      | string       | Дата обновления                        |


## OpenAPI

````yaml GET /v1/storage/files/{id}
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
    get:
      tags:
        - Хранилище
      summary: Получить информацию о файле
      operationId: StorageController_getFile[1]
      parameters:
        - name: id
          required: true
          in: path
          schema:
            type: string
      responses:
        '200':
          description: ''
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/StorageFilePresenter'
      security:
        - bearer: []
components:
  schemas:
    StorageFilePresenter:
      type: object
      properties:
        id:
          type: string
          example: file_123abc
          description: ID файла
        externalUserId:
          type: object
          example: external_user_456
          description: ID внешнего пользователя клиента (для группировки файлов)
          nullable: true
        fileType:
          type: string
          example: IMAGE
          description: Тип файла (IMAGE, VIDEO, AUDIO)
        mimeType:
          type: string
          example: image/jpeg
          description: MIME-тип файла
        source:
          type: string
          example: USER_UPLOAD
          description: Источник файла (USER_UPLOAD, AI_GENERATION)
        storagePolicy:
          type: string
          example: TEMP_UPLOAD
          description: Политика хранения (TEMP_UPLOAD, TEMP_GENERATION, PERMANENT)
        url:
          type: string
          example: https://s3.polza.ai/f/211837/2026/01/t_c2446f3cf93ac9f5.png
          description: URL файла
        size:
          type: number
          example: 154832
          description: Размер файла в байтах
        expiresAt:
          type: object
          example: '2025-01-03T14:00:00.000Z'
          description: Дата истечения срока действия файла
          nullable: true
        createdAt:
          format: date-time
          type: string
          example: '2025-01-03T12:00:00.000Z'
          description: Дата создания
        updatedAt:
          format: date-time
          type: string
          example: '2025-01-03T12:00:00.000Z'
          description: Дата обновления
      required:
        - id
        - fileType
        - mimeType
        - source
        - storagePolicy
        - url
        - size
        - createdAt
        - updatedAt
  securitySchemes:
    bearer:
      type: http
      scheme: bearer
      bearerFormat: API Key
      description: >-
        API ключ передаётся в заголовке: Authorization: Bearer
        <POLZA_AI_API_KEY>

````