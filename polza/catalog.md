> ## Documentation Index
> Fetch the complete documentation index at: https://polza.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# GET Models Catalog

> Каталог моделей с фильтрацией и пагинацией

## О каталоге моделей

Расширенный эндпоинт для получения каталога моделей с поддержкой поиска, фильтрации и пагинации.

## Параметры запроса

| Параметр           | Тип       | По умолчанию | Описание                                  |
| ------------------ | --------- | ------------ | ----------------------------------------- |
| `search`           | string    | —            | Поиск по названию модели                  |
| `type`             | string    | —            | Тип: chat, image, embedding, video, audio |
| `inputModalities`  | string\[] | —            | Входные модальности: text, image          |
| `outputModalities` | string\[] | —            | Выходные модальности: text, image         |
| `providers`        | string\[] | —            | Фильтр по провайдерам                     |
| `contextLengthMin` | number    | —            | Минимальная длина контекста               |
| `contextLengthMax` | number    | —            | Максимальная длина контекста              |
| `page`             | number    | 1            | Номер страницы                            |
| `limit`            | number    | 20           | Количество на странице                    |
| `sortBy`           | string    | —            | Сортировка: price, name, created\_at      |
| `sortOrder`        | string    | desc         | Порядок: asc, desc                        |

## Примеры

<CodeGroup>
  ```bash Поиск по названию theme={null}
  curl "https://polza.ai/api/v1/models/catalog?search=claude&type=chat"
  ```

  ```bash Мультимодальные модели theme={null}
  curl "https://polza.ai/api/v1/models/catalog?inputModalities=image&type=chat&sortBy=price&sortOrder=asc"
  ```

  ```bash С пагинацией theme={null}
  curl "https://polza.ai/api/v1/models/catalog?type=chat&page=2&limit=10"
  ```
</CodeGroup>

## Ответ (200)

```json  theme={null}
{
  "data": [
    {
      "id": "anthropic/claude-3-5-sonnet",
      "name": "Claude 3.5 Sonnet",
      "type": "chat",
      "created": 1677652288,
      "architecture": {
        "input_modalities": ["text", "image"],
        "output_modalities": ["text"]
      },
      "top_provider": {
        "context_length": 200000,
        "max_completion_tokens": 8192,
        "pricing": {
          "prompt_per_million": "0.27",
          "completion_per_million": "1.35",
          "currency": "RUB"
        }
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```


## OpenAPI

````yaml GET /v1/models/catalog
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
  /v1/models/catalog:
    get:
      tags:
        - Модели
      summary: Получить каталог моделей с фильтрацией
      operationId: ModelsController_getModelsCatalog[1]
      parameters:
        - name: page
          required: false
          in: query
          description: Номер страницы
          schema:
            default: 1
            example: 1
            type: number
        - name: limit
          required: false
          in: query
          description: Количество на странице
          schema:
            default: 20
            example: 20
            type: number
        - name: search
          required: false
          in: query
          description: Поиск по названию и ID модели
          schema:
            example: gpt-4
            type: string
        - name: type
          required: false
          in: query
          description: Тип модели (через запятую)
          schema:
            type: array
            items:
              type: string
        - name: inputModalities
          required: false
          in: query
          description: Способы ввода (через запятую)
          schema:
            type: array
            items:
              type: string
        - name: outputModalities
          required: false
          in: query
          description: Способы вывода (через запятую)
          schema:
            type: array
            items:
              type: string
        - name: providers
          required: false
          in: query
          description: Провайдеры (через запятую)
          schema:
            type: array
            items:
              type: string
        - name: contextLengthMin
          required: false
          in: query
          description: Минимальная длина контекста
          schema:
            example: 8000
            type: number
        - name: contextLengthMax
          required: false
          in: query
          description: Максимальная длина контекста
          schema:
            example: 128000
            type: number
        - name: sortBy
          required: false
          in: query
          description: Поле сортировки
          schema:
            default: name
            example: name
            type: string
            enum:
              - name
              - price
              - createdAt
        - name: sortOrder
          required: false
          in: query
          description: Направление сортировки
          schema:
            default: asc
            example: asc
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
                $ref: '#/components/schemas/ModelsCatalogPresenter'
        '401':
          description: Ошибка авторизации. Проверьте ключ доступа
        '403':
          description: Ошибка доступа. Проверьте права доступа ключа
        '500':
          description: Ошибка сервера. Обратитесь к поставщику услуг
components:
  schemas:
    ModelsCatalogPresenter:
      type: object
      properties:
        data:
          description: Список моделей
          type: array
          items:
            $ref: '#/components/schemas/PublicModelPresenter'
        meta:
          description: Информация о пагинации
          allOf:
            - $ref: '#/components/schemas/CatalogPaginationPresenter'
      required:
        - data
        - meta
    PublicModelPresenter:
      type: object
      properties:
        id:
          type: string
          description: ID модели (slug)
          example: deepseek-r1
        name:
          type: string
          description: Название модели
          example: DeepSeek R1
        type:
          type: string
          description: Тип модели
          example: chat
          enum:
            - chat
            - embedding
            - image
            - audio
            - video
            - moderation
            - stt
            - tts
            - document
        short_description:
          type: object
          description: Краткое описание модели
          example: Мощная модель для генерации текста
        created:
          type: number
          description: Timestamp создания
          example: 1765987078
        architecture:
          description: Архитектура модели
          allOf:
            - $ref: '#/components/schemas/ModelArchitecturePresenter'
        top_provider:
          description: Информация о топ провайдере
          allOf:
            - $ref: '#/components/schemas/TopProviderPresenter'
        providers:
          description: Список провайдеров
          type: array
          items:
            $ref: '#/components/schemas/ModelProviderPresenter'
        endpoints:
          description: Поддерживаемые endpoints
          example:
            - /v1/chat/completions
          type: array
          items:
            type: string
        parameters:
          description: Параметры модели (для медиа)
          allOf:
            - $ref: '#/components/schemas/ModelParametersPresenter'
        operations:
          description: Операции над результатом (для медиа)
          type: array
          items:
            $ref: '#/components/schemas/ModelOperationPresenter'
      required:
        - id
        - name
        - type
        - created
        - architecture
        - top_provider
        - endpoints
    CatalogPaginationPresenter:
      type: object
      properties:
        page:
          type: number
          description: Текущая страница
          example: 1
        limit:
          type: number
          description: Количество на странице
          example: 20
        total:
          type: number
          description: Общее количество моделей
          example: 288
        totalPages:
          type: number
          description: Всего страниц
          example: 15
      required:
        - page
        - limit
        - total
        - totalPages
    ModelArchitecturePresenter:
      type: object
      properties:
        modality:
          type: object
          description: Основная модальность
          example: text+image->text
        input_modalities:
          description: Входные модальности
          example:
            - text
            - image
          type: array
          items:
            type: string
        output_modalities:
          description: Выходные модальности
          example:
            - text
          type: array
          items:
            type: string
        tokenizer:
          type: object
          description: Токенизатор
          example: GPT
        instruct_type:
          type: object
          description: Тип инструкций
          example: chatml
      required:
        - input_modalities
        - output_modalities
    TopProviderPresenter:
      type: object
      properties:
        is_moderated:
          type: boolean
          description: Модерируется ли контент
        context_length:
          type: object
          description: Длина контекста от провайдера
        max_completion_tokens:
          type: object
          description: Максимум токенов completion от провайдера
        pricing:
          description: Ценообразование
          allOf:
            - $ref: '#/components/schemas/ModelPricingPresenter'
        supported_parameters:
          description: Поддерживаемые параметры
          type: array
          items:
            type: string
        default_parameters:
          description: Параметры по умолчанию
          allOf:
            - $ref: '#/components/schemas/DefaultParametersPresenter'
        per_request_limits:
          description: Лимиты на запрос
          allOf:
            - $ref: '#/components/schemas/PerRequestLimitsPresenter'
        parameters:
          description: Параметры медиа-модели
          allOf:
            - $ref: '#/components/schemas/ModelParametersPresenter'
      required:
        - is_moderated
        - pricing
    ModelProviderPresenter:
      type: object
      properties:
        name:
          type: string
          description: Название провайдера
          example: OpenRouter
        context_length:
          type: object
          description: Длина контекста от провайдера
        max_completion_tokens:
          type: object
          description: Максимум токенов completion от провайдера
        is_moderated:
          type: boolean
          description: Модерируется ли контент
        pricing:
          description: Ценообразование
          allOf:
            - $ref: '#/components/schemas/ModelPricingPresenter'
        supported_parameters:
          description: Поддерживаемые параметры
          type: array
          items:
            type: string
        default_parameters:
          description: Параметры по умолчанию
          allOf:
            - $ref: '#/components/schemas/DefaultParametersPresenter'
        per_request_limits:
          description: Лимиты на запрос
          allOf:
            - $ref: '#/components/schemas/PerRequestLimitsPresenter'
        parameters:
          description: Параметры медиа-модели
          allOf:
            - $ref: '#/components/schemas/ModelParametersPresenter'
      required:
        - name
        - is_moderated
        - pricing
    ModelParametersPresenter:
      type: object
      properties:
        prompt:
          $ref: '#/components/schemas/ModelParameterConstraintPresenter'
        aspect_ratio:
          $ref: '#/components/schemas/ModelParameterConstraintPresenter'
        resolution:
          $ref: '#/components/schemas/ModelParameterConstraintPresenter'
        image_resolution:
          $ref: '#/components/schemas/ModelParameterConstraintPresenter'
        duration:
          $ref: '#/components/schemas/ModelParameterConstraintPresenter'
        output_format:
          $ref: '#/components/schemas/ModelParameterConstraintPresenter'
        seeds:
          $ref: '#/components/schemas/ModelParameterConstraintPresenter'
        watermark:
          $ref: '#/components/schemas/ModelParameterConstraintPresenter'
        images:
          $ref: '#/components/schemas/ModelParameterConstraintPresenter'
        videos:
          $ref: '#/components/schemas/ModelParameterConstraintPresenter'
        quality:
          $ref: '#/components/schemas/ModelParameterConstraintPresenter'
        voice:
          $ref: '#/components/schemas/ModelParameterConstraintPresenter'
        speed:
          $ref: '#/components/schemas/ModelParameterConstraintPresenter'
        stability:
          $ref: '#/components/schemas/ModelParameterConstraintPresenter'
        similarity_boost:
          $ref: '#/components/schemas/ModelParameterConstraintPresenter'
        style:
          $ref: '#/components/schemas/ModelParameterConstraintPresenter'
        timestamps:
          $ref: '#/components/schemas/ModelParameterConstraintPresenter'
        previous_text:
          $ref: '#/components/schemas/ModelParameterConstraintPresenter'
        next_text:
          $ref: '#/components/schemas/ModelParameterConstraintPresenter'
        language_code:
          $ref: '#/components/schemas/ModelParameterConstraintPresenter'
    ModelOperationPresenter:
      type: object
      properties:
        id:
          type: string
          description: ID операции
          example: extend
        name:
          type: string
          description: Название операции
          example: Продление видео
        description:
          type: string
          description: Описание операции
        async:
          type: boolean
          description: Асинхронная операция (требует polling)
        pricing:
          description: Стоимость операции
          allOf:
            - $ref: '#/components/schemas/ModelPricingPresenter'
        parameters:
          description: Параметры операции
          allOf:
            - $ref: '#/components/schemas/ModelParametersPresenter'
      required:
        - id
        - name
        - async
    ModelPricingPresenter:
      type: object
      properties:
        prompt_per_million:
          type: object
          description: Цена за 1M prompt токенов (RUB)
          example: '15.50'
        completion_per_million:
          type: object
          description: Цена за 1M completion токенов (RUB)
          example: '62.00'
        request_per_thousand:
          type: object
          description: Цена за 1K запросов (RUB)
        image_input_per_million:
          type: object
          description: Цена за 1M входных изображений (RUB)
        image_output_per_million:
          type: object
          description: Цена за 1M токенов сгенерированного изображения (RUB)
        audio_per_million:
          type: object
          description: Цена за 1M токенов аудио (RUB)
        web_search_per_thousand:
          type: object
          description: Цена за 1K web search запросов (RUB)
        internal_reasoning_per_million:
          type: object
          description: Цена за 1M reasoning токенов (RUB)
        input_cache_read_per_million:
          type: object
          description: Цена за 1M токенов чтения из кэша (RUB)
        input_cache_write_per_million:
          type: object
          description: Цена за 1M токенов записи в кэш (RUB)
        input_audio_cache_per_million:
          type: object
          description: Цена за 1M токенов кэшированного аудио (RUB)
        stt_per_minute:
          type: object
          description: Цена за 1 минуту Speech-to-Text (RUB)
        tts_per_million_characters:
          type: object
          description: Цена за 1M символов Text-to-Speech (RUB)
          example: '1800.00000000'
        video_per_second:
          type: object
          description: Цена за 1 секунду видео (RUB)
        per_request:
          type: object
          description: Цена за 1 запрос (RUB)
        tiers:
          description: Уровни цен для моделей с динамическим ценообразованием
          type: array
          items:
            $ref: '#/components/schemas/ClientTierPresenter'
        unitParam:
          type: object
          description: >-
            Параметр-множитель для tiers (например, duration). Если задан,
            costRub в tiers — ставка за единицу этого параметра
          example: duration
        currency:
          type: string
          description: Валюта цен
          example: RUB
      required:
        - currency
    DefaultParametersPresenter:
      type: object
      properties:
        temperature:
          type: object
          description: Temperature по умолчанию (0-2)
        top_p:
          type: object
          description: Top P по умолчанию (0-1)
        frequency_penalty:
          type: object
          description: Frequency penalty по умолчанию (-2-2)
    PerRequestLimitsPresenter:
      type: object
      properties:
        prompt_tokens:
          type: object
          description: Максимум prompt токенов на запрос
        completion_tokens:
          type: object
          description: Максимум completion токенов на запрос
    ModelParameterConstraintPresenter:
      type: object
      properties:
        required:
          type: boolean
          description: Обязательный параметр
        description:
          type: string
          description: Описание параметра
        max_length:
          type: number
          description: Максимальная длина строки
        min:
          type: number
          description: Минимальное значение
        max:
          type: number
          description: Максимальное значение
        default:
          type: object
          description: Значение по умолчанию
        values:
          description: Допустимые значения
          type: array
          items:
            type: string
    ClientTierPresenter:
      type: object
      properties:
        conditions:
          description: Условия применения уровня цены
          example:
            - image_resolution=4K
          type: array
          items:
            type: string
        costRub:
          type: string
          description: Цена для клиента в RUB
          example: '8.25'
      required:
        - conditions
        - costRub

````