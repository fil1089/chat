> ## Documentation Index
> Fetch the complete documentation index at: https://polza.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Загрузить файл

> Загрузка файла в хранилище

## Способы загрузки

Storage API поддерживает два способа загрузки файлов:

1. **Multipart/form-data** — загрузка файла напрямую
2. **Base64** — загрузка закодированного файла в JSON

## Параметры

| Параметр         | Тип    | Обязательный   | Описание                                                  |
| ---------------- | ------ | -------------- | --------------------------------------------------------- |
| `file`           | binary | Да (multipart) | Файл для загрузки (multipart/form-data)                   |
| `base64`         | string | Да (JSON)      | Файл в формате base64                                     |
| `mimeType`       | string | Нет            | MIME-тип файла (определяется автоматически при multipart) |
| `externalUserId` | string | Нет            | Внешний идентификатор пользователя (макс. 128 символов)   |
| `storagePolicy`  | string | Нет            | Политика хранения (по умолчанию TEMP\_UPLOAD)             |

## Политики хранения

| Политика      | Срок хранения | Описание                                       |
| ------------- | ------------- | ---------------------------------------------- |
| `TEMP_UPLOAD` | 24 часа       | Временная загрузка пользователя (по умолчанию) |
| `PERMANENT`   | Бессрочно     | Постоянное хранение                            |

<Note>
  Политика `TEMP_GENERATION` (7 дней) применяется автоматически к результатам AI генераций через Media API и не может быть задана вручную.
</Note>

## Примеры

<CodeGroup>
  ```bash Multipart theme={null}
  curl -X POST "https://polza.ai/api/v1/storage/upload" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -F "file=@image.png" \
    -F "storagePolicy=PERMANENT"
  ```

  ```bash Base64 theme={null}
  curl -X POST "https://polza.ai/api/v1/storage/upload" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "base64": "iVBORw0KGgoAAAANSUhEUg...",
      "mimeType": "image/png",
      "storagePolicy": "PERMANENT"
    }'
  ```
</CodeGroup>

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


## OpenAPI

````yaml POST /v1/storage/upload
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
  /v1/storage/upload:
    post:
      tags:
        - Хранилище
      summary: Загрузить файл
      description: >-
        Поддерживает два способа загрузки: файл (multipart/form-data), base64
        (JSON)
      operationId: StorageController_uploadFile[1]
      parameters: []
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              oneOf:
                - type: object
                  description: Загрузка файла через multipart/form-data
                  properties:
                    file:
                      type: string
                      format: binary
                      description: Файл для загрузки
                    externalUserId:
                      type: string
                      description: ID внешнего пользователя
                      example: user_123
                    storagePolicy:
                      type: string
                      enum:
                        - TEMP_UPLOAD
                        - PERMANENT
                      description: Политика хранения
                      example: TEMP_UPLOAD
                - type: object
                  description: Загрузка через base64
                  properties:
                    base64:
                      type: string
                      description: Данные в формате base64
                      example: data:image/png;base64,iVBORw0KGgo...
                    mimeType:
                      type: string
                      description: MIME тип
                      example: image/png
                    externalUserId:
                      type: string
                      description: ID внешнего пользователя
                      example: user_123
                    storagePolicy:
                      type: string
                      enum:
                        - TEMP_UPLOAD
                        - PERMANENT
                      description: Политика хранения
                      example: TEMP_UPLOAD
          application/json:
            schema:
              oneOf:
                - type: object
                  description: Загрузка файла через multipart/form-data
                  properties:
                    file:
                      type: string
                      format: binary
                      description: Файл для загрузки
                    externalUserId:
                      type: string
                      description: ID внешнего пользователя
                      example: user_123
                    storagePolicy:
                      type: string
                      enum:
                        - TEMP_UPLOAD
                        - PERMANENT
                      description: Политика хранения
                      example: TEMP_UPLOAD
                - type: object
                  description: Загрузка через base64
                  properties:
                    base64:
                      type: string
                      description: Данные в формате base64
                      example: data:image/png;base64,iVBORw0KGgo...
                    mimeType:
                      type: string
                      description: MIME тип
                      example: image/png
                    externalUserId:
                      type: string
                      description: ID внешнего пользователя
                      example: user_123
                    storagePolicy:
                      type: string
                      enum:
                        - TEMP_UPLOAD
                        - PERMANENT
                      description: Политика хранения
                      example: TEMP_UPLOAD
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