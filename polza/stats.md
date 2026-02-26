> ## Documentation Index
> Fetch the complete documentation index at: https://polza.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Статистика хранилища

> Получение статистики использования хранилища

<Warning>
  Этот эндпоинт доступен только пользователям с ролью **admin** в организации. Обычный API-ключ не подойдёт — требуется JWT-авторизация через консоль.
</Warning>

## Пример

```bash  theme={null}
curl "https://polza.ai/api/v1/storage/stats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Ответ (200)

```json  theme={null}
{
  "usedBytes": 1073741824,
  "totalBytes": 10737418240,
  "fileCount": 256,
  "filesByType": {
    "IMAGE": 180,
    "VIDEO": 50,
    "AUDIO": 26
  },
  "filesByPolicy": {
    "TEMP_UPLOAD": 30,
    "TEMP_GENERATION": 186,
    "PERMANENT": 40
  },
  "usagePercent": 10.0
}
```

## Поля ответа

| Поле            | Тип    | Описание                                         |
| --------------- | ------ | ------------------------------------------------ |
| `usedBytes`     | number | Использованный объём в байтах                    |
| `totalBytes`    | number | Общий доступный объём                            |
| `fileCount`     | number | Общее количество файлов                          |
| `filesByType`   | object | Количество файлов по типам (IMAGE, VIDEO, AUDIO) |
| `filesByPolicy` | object | Количество файлов по политикам хранения          |
| `usagePercent`  | number | Процент использования хранилища                  |


## OpenAPI

````yaml GET /v1/storage/stats
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
  /v1/storage/stats:
    get:
      tags:
        - Хранилище
      summary: Получить статистику хранилища
      operationId: StorageController_getStats[1]
      parameters: []
      responses:
        '200':
          description: ''
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/StorageStatsPresenter'
      security:
        - bearer: []
components:
  schemas:
    StorageStatsPresenter:
      type: object
      properties:
        usedBytes:
          type: number
          example: 1024000
          description: Использовано байт
        totalBytes:
          type: number
          example: 5368709120
          description: Общий лимит байт
        fileCount:
          type: number
          example: 42
          description: Количество файлов
        filesByType:
          type: object
          example:
            IMAGE: 30
            VIDEO: 8
            AUDIO: 2
          description: Количество файлов по типам
        filesByPolicy:
          type: object
          example:
            TEMP_UPLOAD: 15
            TEMP_GENERATION: 20
            PERMANENT: 7
          description: Количество файлов по политикам хранения
        usagePercent:
          type: number
          example: 19.05
          description: Процент использования
      required:
        - usedBytes
        - totalBytes
        - fileCount
        - filesByType
        - filesByPolicy
        - usagePercent
  securitySchemes:
    bearer:
      type: http
      scheme: bearer
      bearerFormat: API Key
      description: >-
        API ключ передаётся в заголовке: Authorization: Bearer
        <POLZA_AI_API_KEY>

````