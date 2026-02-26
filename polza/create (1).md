> ## Documentation Index
> Fetch the complete documentation index at: https://polza.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# POST Media

> Универсальный API генерации медиа (изображения, видео, аудио)

## О Media API

Универсальный эндпоинт для генерации медиа контента. Поддерживает различные модели и провайдеров через единый интерфейс.

### Общие параметры

| Параметр   | Тип     | Обязательный | Описание                                |
| ---------- | ------- | ------------ | --------------------------------------- |
| `model`    | string  | Да           | ID модели для генерации                 |
| `input`    | object  | Да           | Параметры генерации (зависят от модели) |
| `async`    | boolean | Нет          | Принудительный асинхронный режим        |
| `user`     | string  | Нет          | Идентификатор конечного пользователя    |
| `provider` | object  | Нет          | Конфигурация роутинга по провайдерам    |

### Передача файлов (URL и base64)

Для моделей, поддерживающих image-to-image или video-to-video, медиа файлы передаются в массиве `images` или `videos`. Каждый элемент — объект с полями:

| Поле   | Тип                   | Описание                                         |
| ------ | --------------------- | ------------------------------------------------ |
| `type` | `"url"` \| `"base64"` | Формат данных                                    |
| `data` | string                | URL файла или base64-строка (с data URI или без) |

#### Пример с base64

```bash  theme={null}
curl -X POST "https://polza.ai/api/v1/media" \
  -H "Authorization: Bearer <POLZA_AI_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "seedream-3",
    "input": {
      "prompt": "Сделай изображение ярче и добавь закат на фоне",
      "images": [
        {
          "type": "base64",
          "data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."
        }
      ]
    }
  }'
```

Можно комбинировать URL и base64 в одном запросе:

```json  theme={null}
{
  "model": "gpt-image-1",
  "input": {
    "prompt": "Объедини эти изображения в коллаж",
    "images": [
      { "type": "url", "data": "https://example.com/photo1.png" },
      { "type": "base64", "data": "data:image/jpeg;base64,/9j/4AAQSkZJRg..." }
    ]
  }
}
```

<Note>
  Base64 поддерживается как с data URI (`data:image/png;base64,...`), так и без — просто строка base64.
  Если провайдер не поддерживает base64 напрямую, файл автоматически загружается в хранилище и передаётся как URL.
</Note>

### Типы контента

* Изображения (Nano Banana, Seedream, GPT Image и др.)
* Видео (Veo, Wan, Kling, Seedance, Sora и др.)
* Аудио — синтез речи (TTS) и распознавание речи (STT)

### Хранение результатов

При генерации медиа контента Polza.ai автоматически:

1. **Скачивает результат** у AI провайдера на собственное хранилище
2. **Хранит файлы 7 дней** для повторного доступа
3. **Раздаёт через CDN** для быстрого доступа внутри России

<Note>
  После истечения 7 дней файлы автоматически удаляются.
  Для постоянного хранения используйте [Storage API](/api-reference/storage/upload) с политикой `PERMANENT`.
</Note>

***

## Руководства по моделям

Подробные примеры, параметры и особенности каждой модели — в руководствах:

<CardGroup cols={3}>
  <Card title="Видео" icon="video" href="/gaidy/veo-3-1">
    Veo 3.1, Wan 2.5/2.6, Kling, Seedance, Sora и другие модели видеогенерации
  </Card>

  <Card title="Изображения" icon="image" href="/gaidy/seedream-4-5">
    Seedream, Nano Banana, GPT Image, Flux, Grok Imagine и другие модели генерации изображений
  </Card>

  <Card title="Аудио" icon="volume-high" href="/gaidy/elevenlabs-tts-turbo">
    ElevenLabs TTS и другие модели синтеза и распознавания речи
  </Card>
</CardGroup>

***

## Ответ

Возвращает объект [Media Status](/api-reference/media/status) со статусом `pending`:

```json  theme={null}
{
  "id": "aig_abc123",
  "object": "media.generation",
  "status": "pending",
  "created": 1703001244,
  "model": "google/veo3"
}
```

Используйте [GET /v1/media/{id}](/api-reference/media/status) для проверки статуса и получения результата.


## OpenAPI

````yaml POST /v1/media
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
  /v1/media:
    post:
      tags:
        - Медиа
      summary: Создать генерацию медиа
      operationId: MediaController_createGeneration[1]
      parameters: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/MediaRequestDto'
            example:
              model: topaz/image-upscale
              input:
                prompt: а
                upscale_factor: '8'
                images:
                  - type: url
                    data: >-
                      https://polza-s3.devd.pro/f/212452/2026/02/t_f122d0d823faf2fb.jpg
              async: true
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
    MediaRequestDto:
      type: object
      properties:
        model:
          type: string
          description: ID модели для генерации
          example: topaz/image-upscale
        input:
          type: object
          description: >-
            Входные параметры генерации. Поля зависят от модели (см.
            документацию по моделям).
          properties:
            prompt:
              type: string
              description: Текстовое описание для генерации или редактирования
            upscale_factor:
              type: string
              enum:
                - '1'
                - '2'
                - '4'
                - '8'
              description: Коэффициент апскейла (topaz/image-upscale). По умолчанию 2
            aspect_ratio:
              type: string
              description: >-
                Соотношение сторон. Изображения: 1:1, 4:3, 3:4, 16:9, 9:16, 21:9
                и др. Видео: 1:1, 16:9, 9:16 и др.
            image_resolution:
              type: string
              enum:
                - 1K
                - 2K
                - 4K
              description: Разрешение изображения (Seedream, Flux, Nano Banana Pro)
            quality:
              type: string
              enum:
                - medium
                - high
                - basic
              description: >-
                Качество: medium/high (openai/gpt-image-1.5), basic/high
                (Seedream 4.5)
            images:
              type: array
              description: >-
                Референс-изображения: массив объектов { type: url|base64, data:
                string }
              items:
                type: object
                required:
                  - type
                  - data
                properties:
                  type:
                    type: string
                    enum:
                      - url
                      - base64
                  data:
                    type: string
                    description: URL или base64
            seed:
              type: integer
              description: >-
                Seed для воспроизводимости (Seedream: 1–4294967295, Wan 2.5:
                -1–2147483647)
            guidance_scale:
              type: number
              minimum: 0
              maximum: 20
              description: Guidance scale (Seedream 3.0). По умолчанию 2.5
            enable_safety_checker:
              type: string
              enum:
                - 'true'
                - 'false'
              description: Включить проверку контента (Seedream 3.0). По умолчанию true
            resolution:
              type: string
              enum:
                - 480p
                - 720p
                - 1080p
              description: Разрешение видео (Seedance, Wan, Kling)
            duration:
              type: string
              description: >-
                Длительность видео в секундах. Значения зависят от модели:
                4/8/12, 5/10/15, 10/15 и др.
            fixed_lens:
              type: string
              enum:
                - 'true'
                - 'false'
              description: Статичная камера без движения (Seedance). По умолчанию false
            generate_audio:
              type: string
              enum:
                - 'true'
                - 'false'
              description: Генерация звука (Seedance, Kling). По умолчанию false
            mode:
              type: string
              enum:
                - std
                - pro
              description: 'Режим: std — стандартное разрешение, pro — высокое (Kling 3.0)'
            sound:
              type: string
              enum:
                - 'true'
                - 'false'
              description: Генерация звука (Kling 3.0). При multi_shots обязательно true
            multi_shots:
              type: string
              enum:
                - 'true'
                - 'false'
              description: Мульти-шотовая композиция (Wan 2.6). По умолчанию false
            negative_prompt:
              type: string
              description: Описание того, что исключить (Wan 2.5, Kling 2.5)
            enable_prompt_expansion:
              type: string
              enum:
                - 'true'
                - 'false'
              description: Улучшить промпт с помощью LLM (Wan 2.5). По умолчанию false
            size:
              type: string
              enum:
                - standard
                - high
              description: Standard — 720p, High — 1080p (Sora 2 Pro)
            seeds:
              type: integer
              minimum: 10000
              maximum: 99999
              description: Seed для воспроизводимости (Veo 3.1)
            watermark:
              type: string
              maxLength: 50
              description: Текст водяного знака (Veo 3.1)
            generationType:
              type: string
              enum:
                - TEXT_2_VIDEO
                - FIRST_AND_LAST_FRAMES_2_VIDEO
                - REFERENCE_2_VIDEO
              description: >-
                Режим генерации (Veo 3.1). Авто по наличию images, если не
                указан
            enableTranslation:
              type: string
              enum:
                - 'true'
                - 'false'
              description: Автоперевод промпта на английский (Veo 3.1). По умолчанию true
            cfg_scale:
              type: number
              minimum: 0
              maximum: 1
              description: CFG scale (Kling 2.5 Turbo)
            tail_image_url:
              type: string
              description: URL изображения для конца видео — image-to-video (Kling 2.5)
            voice:
              type: string
              description: Голос для синтеза речи (ElevenLabs TTS). По умолчанию Rachel
              enum:
                - Rachel
                - Aria
                - Roger
                - Sarah
                - Laura
                - Charlie
                - George
                - Callum
                - River
                - Liam
                - Charlotte
                - Alice
                - Matilda
                - Will
                - Jessica
                - Eric
                - Chris
                - Brian
                - Daniel
                - Lily
                - Bill
            speed:
              type: number
              minimum: 0.7
              maximum: 1.2
              description: Скорость речи (ElevenLabs TTS). По умолчанию 1
            stability:
              type: number
              minimum: 0
              maximum: 1
              description: Стабильность голоса (ElevenLabs TTS)
            similarity_boost:
              type: number
              minimum: 0
              maximum: 1
              description: Усиление схожести с голосом (ElevenLabs TTS)
            style:
              type: number
              minimum: 0
              maximum: 1
              description: Экспрессия стиля (ElevenLabs TTS)
            timestamps:
              type: string
              enum:
                - 'true'
                - 'false'
              description: Возвращать временные метки слов (ElevenLabs TTS)
            previous_text:
              type: string
              maxLength: 5000
              description: Предшествующий текст для контекста (ElevenLabs TTS)
            next_text:
              type: string
              maxLength: 5000
              description: Последующий текст для контекста (ElevenLabs TTS)
            language_code:
              type: string
              description: 'Код языка ISO 639-1 (TTS/STT): ru, en, de, fr, es и др.'
            diarize:
              type: string
              enum:
                - 'true'
                - 'false'
              description: Диаризация — аннотировать кто говорит (ElevenLabs STT)
            tag_audio_events:
              type: string
              enum:
                - 'true'
                - 'false'
              description: 'Маркировать аудио-события: смех, аплодисменты (ElevenLabs STT)'
          example:
            prompt: а
            upscale_factor: '8'
            images:
              - type: url
                data: >-
                  https://polza-s3.devd.pro/f/212452/2026/02/t_f122d0d823faf2fb.jpg
        provider:
          description: Настройки роутинга провайдеров
          allOf:
            - $ref: '#/components/schemas/ProviderDto'
        async:
          type: boolean
          description: >-
            Асинхронный режим генерации. При true возвращается taskId для опроса
            статуса
          example: true
          default: false
        user:
          type: string
          description: >-
            Уникальный идентификатор конечного пользователя для отслеживания и
            предотвращения злоупотреблений
      required:
        - model
        - input
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
    ProviderDto:
      type: object
      properties:
        allow_fallbacks:
          type: boolean
          description: Разрешить использование резервных провайдеров
          example: true
        order:
          description: Упорядоченный список slug провайдеров для использования
          example:
            - OpenAI
            - Anthropic
          type: array
          items:
            type: string
        only:
          description: Список разрешенных slug провайдеров
          example:
            - OpenAI
            - Google
          type: array
          items:
            type: string
        ignore:
          description: Список игнорируемых slug провайдеров
          example:
            - DeepInfra
          type: array
          items:
            type: string
        sort:
          type: string
          description: Критерий сортировки провайдеров
          enum:
            - price
            - throughput
            - latency
          example: price
        max_price:
          description: Максимальные цены для запроса
          allOf:
            - $ref: '#/components/schemas/ProviderMaxPriceDto'
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
    ProviderMaxPriceDto:
      type: object
      properties:
        prompt:
          type: number
          description: Максимальная цена за промпт токены (RUB за миллион токенов)
          example: 10
        completion:
          type: number
          description: Максимальная цена за completion токены (RUB за миллион токенов)
          example: 20
        image:
          type: number
          description: Максимальная цена за изображение (RUB за штуку)
          example: 5
        audio:
          type: number
          description: Максимальная цена за аудио (RUB за миллион токенов)
          example: 15
        request:
          type: number
          description: Максимальная цена за запрос (RUB за запрос)
          example: 1
  securitySchemes:
    bearer:
      type: http
      scheme: bearer
      bearerFormat: API Key
      description: >-
        API ключ передаётся в заголовке: Authorization: Bearer
        <POLZA_AI_API_KEY>

````