> ## Documentation Index
> Fetch the complete documentation index at: https://polza.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# POST Media Operations

> Выполнение операций над существующими медиа (extend, upscale)

## Операции над медиа

После генерации медиа контента можно выполнять дополнительные операции:

| Операция        | Описание                       | Тип         |
| --------------- | ------------------------------ | ----------- |
| `extend`        | Продление видео                | Асинхронная |
| `upscale_1080p` | Увеличение разрешения до 1080p | Синхронная  |
| `upscale_4k`    | Увеличение разрешения до 4K    | Синхронная  |

## Синхронные vs Асинхронные операции

### Синхронные операции (upscale)

Результат возвращается сразу в поле `data`:

```json  theme={null}
{
  "id": "aig_abc123",
  "object": "media.generation",
  "status": "completed",
  "created": 1703001244,
  "model": "google/gemini-2.5-flash-image",
  "data": {
    "url": "https://storage.polza.ai/video_1080p.mp4"
  }
}
```

### Асинхронные операции (extend)

Создаётся новая генерация со статусом `pending`:

```json  theme={null}
{
  "id": "aig_xyz789",
  "object": "media.generation",
  "status": "pending",
  "created": 1703001244,
  "model": "pending"
}
```

Для получения результата используйте [GET /v1/media/{id}](/api-reference/media/status) с новым ID.

### Параметр async

* `async: false` (по умолчанию) — ждёт результат до 120 секунд
* `async: true` — сразу возвращает ID новой генерации

## Примеры

### Продление видео (extend)

```bash  theme={null}
curl -X POST "https://polza.ai/api/v1/media/aig_abc123/operations" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "extend",
    "params": {
      "prompt": "Камера отдаляется, показывая панораму города"
    }
  }'
```

### Увеличение разрешения (upscale)

```bash  theme={null}
curl -X POST "https://polza.ai/api/v1/media/aig_abc123/operations" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "upscale_1080p"
  }'
```

## Параметры операции extend

| Параметр   | Тип    | Обязательный | Описание                          |
| ---------- | ------ | ------------ | --------------------------------- |
| `prompt`   | string | Да           | Промпт для продолжения видео      |
| `seeds`    | number | Нет          | Seed для воспроизводимости        |
| `duration` | number | Нет          | Длительность продления (3-10 сек) |

<Note>
  Операция extend создаёт новую генерацию с новым ID.
  Оригинальное видео не изменяется.
</Note>


## OpenAPI

````yaml POST /v1/media/{id}/operations
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
  /v1/media/{id}/operations:
    post:
      tags:
        - Медиа
      summary: Выполнить операцию над медиа
      operationId: MediaController_executeOperation[1]
      parameters:
        - name: id
          required: true
          in: path
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/MediaOperationRequestDto'
      responses:
        '200':
          description: ''
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MediaStatusPresenter'
        '401':
          description: Ошибка авторизации. Проверьте ключ доступа
        '403':
          description: Ошибка доступа. Проверьте права доступа ключа
        '500':
          description: Ошибка сервера. Обратитесь к поставщику услуг
      security:
        - bearer: []
components:
  schemas:
    MediaOperationRequestDto:
      type: object
      properties:
        operation:
          type: string
          description: ID операции
          example: extend
          enum:
            - extend
            - upscale_1080p
            - upscale_4k
        params:
          type: object
          description: Параметры операции. Зависят от типа операции.
          example:
            prompt: Продолжение сцены
            seeds: 12345
        async:
          type: boolean
          description: >-
            Асинхронный режим. При true сразу возвращает ID операции, результат
            получить через GET /v2/media/:id
          example: false
          default: false
      required:
        - operation
    MediaStatusPresenter:
      type: object
      properties:
        id:
          type: string
          description: Уникальный идентификатор генерации
          example: gen_581761234567890123
        object:
          type: string
          description: Тип объекта
          example: media.generation
        status:
          type: string
          description: Статус генерации
          enum:
            - pending
            - processing
            - completed
            - failed
            - cancelled
          example: pending
        created:
          type: number
          description: Временная метка создания (Unix timestamp)
          example: 1703001234
        model:
          type: string
          description: ID модели, которая генерирует контент
          example: google/gemini-2.5-flash-image
        completed_at:
          type: number
          description: Временная метка завершения (Unix timestamp)
          example: 1703001244
        data:
          description: Данные сгенерированного контента
          oneOf:
            - 1000b25d-1faa-4b80-ac22-a61594e3be66
            - b4c35f0b-f17b-47de-9ba1-708ddb530ffd
        usage:
          description: Информация об использовании ресурсов
          allOf:
            - $ref: '#/components/schemas/MediaUsagePresenter'
        error:
          description: Информация об ошибке (если failed)
          allOf:
            - $ref: '#/components/schemas/MediaErrorPresenter'
        content:
          type: string
          description: >-
            Текстовый ответ модели (если вернула текст вместо/вместе с
            изображением)
          example: Банан и яблоко — это фрукты.
        reasoning_summary:
          type: string
          description: Краткое резюме рассуждений модели
          example: Preparing image generation prompt with camera settings...
        warnings:
          description: Предупреждения (неподдерживаемые параметры и т.д.)
          example:
            - >-
              Параметр isEnhance не поддерживается OpenRouter и будет
              проигнорирован
          type: array
          items:
            type: string
      required:
        - id
        - object
        - status
        - created
        - model
    MediaUsagePresenter:
      type: object
      properties:
        input_units:
          type: number
          description: Входные единицы (для edit mode)
          example: 1
        output_units:
          type: number
          description: Выходные единицы (сгенерированные)
          example: 1
        duration_seconds:
          type: number
          description: Длительность для видео/аудио (секунды)
          example: 5
        input_tokens:
          type: number
          description: Количество входных токенов
          example: 10
        output_tokens:
          type: number
          description: Количество выходных токенов
          example: 0
        total_tokens:
          type: number
          description: Общее количество токенов
          example: 10
        cost_rub:
          type: number
          description: Стоимость в рублях
          example: 1.5
        cost:
          type: number
          description: Стоимость в рублях (alias для cost_rub)
          example: 1.5
    MediaErrorPresenter:
      type: object
      properties:
        code:
          type: string
          description: Код ошибки (FORBIDDEN, BAD_GATEWAY, REQUEST_TIMEOUT и т.д.)
          example: BAD_GATEWAY
        message:
          type: string
          description: Сообщение об ошибке на русском языке
          example: Ошибка генерации медиа контента
      required:
        - code
        - message
  securitySchemes:
    bearer:
      type: http
      scheme: bearer
      bearerFormat: API Key
      description: >-
        API ключ передаётся в заголовке: Authorization: Bearer
        <POLZA_AI_API_KEY>

````