> ## Documentation Index
> Fetch the complete documentation index at: https://polza.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Список файлов

> Получение списка файлов с фильтрацией и пагинацией

## Параметры запроса

### Пагинация

| Параметр | Тип     | По умолчанию | Описание                               |
| -------- | ------- | ------------ | -------------------------------------- |
| `page`   | integer | 1            | Номер страницы (от 1)                  |
| `limit`  | integer | 20           | Количество записей на странице (1-100) |

### Фильтрация

| Параметр         | Тип    | Описание                                            |
| ---------------- | ------ | --------------------------------------------------- |
| `fileType`       | string | Тип файла: IMAGE, VIDEO, AUDIO                      |
| `source`         | string | Источник: USER\_UPLOAD, AI\_GENERATION              |
| `storagePolicy`  | string | Политика: TEMP\_UPLOAD, TEMP\_GENERATION, PERMANENT |
| `externalUserId` | string | ID внешнего пользователя (макс. 128 символов)       |

### Сортировка

| Параметр    | Тип    | По умолчанию | Описание                                         |
| ----------- | ------ | ------------ | ------------------------------------------------ |
| `sortBy`    | string | createdAt    | Поле: createdAt, size, expiresAt, externalUserId |
| `sortOrder` | string | desc         | Направление: asc, desc                           |

## Пример

```bash  theme={null}
curl "https://polza.ai/api/v1/storage/files?fileType=IMAGE&page=1&limit=10&sortBy=createdAt&sortOrder=desc" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Ответ (200)

```json  theme={null}
{
  "data": [
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
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```


## OpenAPI

````yaml GET /v1/storage/files
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
  /v1/storage/files:
    get:
      tags:
        - Хранилище
      summary: Получить список файлов
      operationId: StorageController_listFiles[1]
      parameters:
        - name: page
          required: false
          in: query
          description: Номер страницы (начиная с 1)
          schema:
            example: 1
            type: number
        - name: limit
          required: false
          in: query
          description: Лимит записей на странице (1-100)
          schema:
            example: 20
            type: number
        - name: externalUserId
          required: false
          in: query
          description: Фильтр по ID внешнего пользователя
          schema:
            example: user_123
            type: string
        - name: fileType
          required: false
          in: query
          description: Фильтр по типу файла
          schema:
            example: IMAGE
            type: string
            enum:
              - IMAGE
              - VIDEO
              - AUDIO
        - name: source
          required: false
          in: query
          description: Фильтр по источнику файла
          schema:
            example: USER_UPLOAD
            type: string
            enum:
              - USER_UPLOAD
              - AI_GENERATION
        - name: storagePolicy
          required: false
          in: query
          description: Фильтр по политике хранения
          schema:
            example: TEMP_UPLOAD
            type: string
            enum:
              - TEMP_UPLOAD
              - TEMP_GENERATION
              - PERMANENT
        - name: sortBy
          required: false
          in: query
          description: Поле для сортировки
          schema:
            example: createdAt
            type: string
            enum:
              - createdAt
              - size
              - expiresAt
              - externalUserId
        - name: sortOrder
          required: false
          in: query
          description: Порядок сортировки
          schema:
            example: desc
            type: string
            enum:
              - asc
              - desc
      responses:
        '200':
          description: ''
          content:
            application/json:
              schema:
                type: array
                items:
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