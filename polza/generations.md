> ## Documentation Index
> Fetch the complete documentation index at: https://polza.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# POST Images Generations

> Генерация изображений (OpenAI-совместимый API)

OpenAI-совместимый эндпоинт для генерации изображений. Поддерживает формат запросов GPT image models, DALL-E 3, DALL-E 2.

<Info>
  Этот эндпоинт совместим с OpenAI SDK и подходит для быстрой миграции существующего кода.
  Если вы разрабатываете новый софт — рекомендуем использовать [Media API](/api-reference/media/create), который предоставляет единый интерфейс для всех медиа-операций.
</Info>

<Note>
  Этот эндпоинт доступен по пути `/v2/images/generations`. При использовании OpenAI SDK с `base_url="https://polza.ai/api/v1"` запросы автоматически направляются на правильный путь.
</Note>

## Параметры

### Обязательные

| Параметр | Тип    | Описание                                               |
| -------- | ------ | ------------------------------------------------------ |
| `model`  | string | Модель для генерации (например, gpt-image-1, dall-e-3) |
| `prompt` | string | Текстовое описание изображения                         |

### Опциональные

| Параметр          | Тип            | По умолчанию | Описание                                |
| ----------------- | -------------- | ------------ | --------------------------------------- |
| `n`               | integer (1-10) | 1            | Количество изображений                  |
| `size`            | string         | auto         | Размер изображения                      |
| `quality`         | string         | auto         | Качество генерации                      |
| `response_format` | string         | url          | Формат ответа: url, b64\_json           |
| `style`           | string         | vivid        | Стиль: vivid, natural (только DALL-E 3) |
| `user`            | string         | —            | Идентификатор конечного пользователя    |

### size

Размер генерируемого изображения:

| Значение    | Описание                                      |
| ----------- | --------------------------------------------- |
| `auto`      | Провайдер сам определит размер (по умолчанию) |
| `256x256`   | Маленький квадрат                             |
| `512x512`   | Средний квадрат                               |
| `1024x1024` | Большой квадрат                               |
| `1536x1024` | Горизонтальный                                |
| `1024x1536` | Вертикальный                                  |
| `1792x1024` | Широкий горизонтальный                        |
| `1024x1792` | Высокий вертикальный                          |

### quality

Качество генерации:

| Значение   | Описание                            |
| ---------- | ----------------------------------- |
| `auto`     | Автоматический выбор (по умолчанию) |
| `low`      | Низкое качество (быстрее)           |
| `medium`   | Среднее качество                    |
| `high`     | Высокое качество                    |
| `standard` | Стандартное (для DALL-E)            |
| `hd`       | HD качество (для DALL-E 3)          |

## Примеры

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://polza.ai/api/v2/images/generations" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "gpt-image-1",
      "prompt": "Космический пейзаж с планетами",
      "size": "1024x1024",
      "quality": "high"
    }'
  ```

  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      base_url="https://polza.ai/api/v1",
      api_key="YOUR_API_KEY"
  )

  response = client.images.generate(
      model="gpt-image-1",
      prompt="Футуристический город на закате",
      size="1792x1024",
      quality="high",
      n=1
  )

  print(response.data[0].url)
  ```
</CodeGroup>

## Поведение при таймауте

Генерация выполняется синхронно с таймаутом **120 секунд**.

### Успешная генерация (до 120 сек)

Возвращается объект с результатом:

```json  theme={null}
{
  "created": 1706123456,
  "data": [
    {
      "url": "https://cdn.polza.ai/...",
      "revised_prompt": "Улучшенный промпт..."
    }
  ],
  "usage": {
    "input_tokens": 10,
    "output_tokens": 0,
    "total_tokens": 10,
    "cost_rub": 2.50,
    "cost": 2.50
  }
}
```

### Таймаут (более 120 сек)

Если генерация не успевает завершиться за 120 секунд, запрос автоматически переходит в асинхронный режим:

```json  theme={null}
{
  "id": "gen_abc123...",
  "status": "pending",
  "model": "dall-e-3",
  "created": 1706123456
}
```

Используйте [`GET /v1/media/{id}`](/api-reference/media/status) для проверки статуса. Рекомендуется polling с интервалом 3-5 секунд.

## Статусы генерации

| Статус       | Описание              |
| ------------ | --------------------- |
| `pending`    | В очереди             |
| `processing` | Генерация выполняется |
| `completed`  | Готово                |
| `failed`     | Ошибка                |


## OpenAPI

````yaml POST /v2/images/generations
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
  /v2/images/generations:
    post:
      tags:
        - Изображения
      summary: Создать генерацию изображения (OpenAI-совместимый API)
      operationId: ImagesController_createGeneration[1]
      parameters: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ImageGenerationRequestDto'
      responses:
        '200':
          description: >-
            Успешная генерация изображения. При таймауте (>120 сек) возвращается
            ImagePendingResponsePresenter с taskId для проверки статуса через
            GET /v2/media/{id}
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageGenerationResponsePresenter'
        '401':
          description: Ошибка авторизации. Проверьте ключ доступа
        '403':
          description: Ошибка доступа. Проверьте права доступа ключа
        '500':
          description: Ошибка сервера. Обратитесь к поставщику услуг
components:
  schemas:
    ImageGenerationRequestDto:
      type: object
      properties:
        model:
          type: string
          description: ID модели для генерации изображений
          example: dall-e-3
        prompt:
          type: string
          description: >-
            Текстовое описание изображения для генерации (до 32000 символов для
            GPT image models, 4000 для dall-e-3)
          example: A white siamese cat sitting on a windowsill
        'n':
          type: number
          description: Количество генерируемых изображений (1-10, для dall-e-3 только 1)
          example: 1
          default: 1
          minimum: 1
          maximum: 10
        size:
          type: string
          description: Размер генерируемого изображения. auto для GPT image models
          enum:
            - auto
            - 256x256
            - 512x512
            - 1024x1024
            - 1536x1024
            - 1024x1536
            - 1792x1024
            - 1024x1792
          example: auto
          default: auto
        quality:
          type: string
          description: >-
            Качество изображения. auto/high/medium/low для GPT image models,
            hd/standard для DALL-E
          enum:
            - auto
            - low
            - medium
            - high
            - standard
            - hd
          example: auto
          default: auto
        response_format:
          type: string
          description: Формат ответа - URL или base64-encoded JSON
          enum:
            - url
            - b64_json
          example: url
          default: url
        style:
          type: string
          description: Стиль изображения (только для dall-e-3)
          enum:
            - vivid
            - natural
          example: vivid
          default: vivid
        user:
          type: string
          description: >-
            Уникальный идентификатор конечного пользователя для отслеживания и
            предотвращения злоупотреблений
          example: user-123
      required:
        - model
        - prompt
    ImageGenerationResponsePresenter:
      type: object
      properties:
        created:
          type: number
          description: Unix timestamp времени создания
          example: 1589478378
        data:
          description: Массив сгенерированных изображений
          type: array
          items:
            $ref: '#/components/schemas/ImageDataPresenter'
        usage:
          description: Информация об использовании ресурсов
          allOf:
            - $ref: '#/components/schemas/MediaUsagePresenter'
      required:
        - created
        - data
    ImageDataPresenter:
      type: object
      properties:
        url:
          type: string
          description: URL сгенерированного изображения (если response_format=url)
          example: https://oaidalleapiprodscus.blob.core.windows.net/...
        b64_json:
          type: string
          description: Base64-encoded изображение (если response_format=b64_json)
          example: iVBORw0KGgoAAAANSUhEUgAAAAUA...
        revised_prompt:
          type: string
          description: Пересмотренный промпт (для dall-e-3)
          example: >-
            A fluffy white siamese cat with blue eyes sitting peacefully on a
            wooden windowsill...
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

````