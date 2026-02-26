> ## Documentation Index
> Fetch the complete documentation index at: https://polza.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# POST Responses

> Responses API — альтернативный формат запросов

## О Responses API

<Warning>
  Responses API находится в **бета-версии**. API может измениться без предварительного уведомления.
</Warning>

Responses API — альтернативный формат, совместимый с OpenAI Responses API.
Автоматически трансформируется в Chat Completions формат внутри.

## Основные параметры

| Параметр       | Тип            | Описание                     |
| -------------- | -------------- | ---------------------------- |
| `model`        | string         | ID модели                    |
| `input`        | string / array | Текст или массив сообщений   |
| `instructions` | string         | Системные инструкции         |
| `stream`       | boolean        | Потоковая передача через SSE |

### Дополнительные параметры

| Параметр               | Тип            | Описание                                                         |
| ---------------------- | -------------- | ---------------------------------------------------------------- |
| `tools`                | array          | Определения инструментов                                         |
| `tool_choice`          | string/object  | Выбор инструмента: none, auto, required                          |
| `reasoning`            | object         | Настройки reasoning (effort: xhigh/high/medium/low/minimal/none) |
| `max_output_tokens`    | integer        | Максимум выходных токенов                                        |
| `temperature`          | float (0-2)    | Температура генерации                                            |
| `top_p`                | float (0-1)    | Nucleus sampling                                                 |
| `top_logprobs`         | integer (0-20) | Количество log probabilities                                     |
| `previous_response_id` | string         | ID предыдущего ответа для продолжения                            |
| `models`               | array          | Массив fallback-моделей                                          |
| `text`                 | object         | Формат текста: text, json\_object, json\_schema                  |
| `metadata`             | object         | Произвольные key-value данные                                    |

## Примеры

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://polza.ai/api/v1/responses" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "openai/gpt-4o",
      "input": "Расскажи о квантовых компьютерах"
    }'
  ```

  ```python Python theme={null}
  import requests

  response = requests.post(
      'https://polza.ai/api/v1/responses',
      headers={'Authorization': 'Bearer YOUR_API_KEY'},
      json={
          'model': 'openai/gpt-4o',
          'input': [
              {"role": "user", "content": "Привет!"}
          ],
          'instructions': 'Отвечай кратко и по делу'
      }
  )

  data = response.json()
  print(data['output'][0]['content'][0]['text'])
  ```
</CodeGroup>

## Streaming

При `stream: true` ответ приходит в формате SSE с типами событий:

| Событие                       | Описание                 |
| ----------------------------- | ------------------------ |
| `response.created`            | Ответ создан             |
| `response.output_item.added`  | Новый элемент вывода     |
| `response.content_part.delta` | Инкрементальный контент  |
| `response.content_part.done`  | Часть контента завершена |
| `response.done`               | Ответ завершён           |


## OpenAPI

````yaml POST /v1/responses
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
  /v1/responses:
    post:
      tags:
        - Responses API
      summary: Создать response (Responses API)
      operationId: ResponsesController_createResponse[1]
      parameters: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ResponseRequestDto'
      responses:
        '200':
          description: ''
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ResponsePresenter'
        '401':
          description: Ошибка авторизации. Проверьте ключ доступа
        '403':
          description: Ошибка доступа. Проверьте права доступа ключа
        '500':
          description: Ошибка сервера. Обратитесь к поставщику услуг
components:
  schemas:
    ResponseRequestDto:
      type: object
      properties:
        input:
          description: Input for response - can be string or array of messages
          oneOf:
            - type: string
              example: Hello, how are you?
            - type: array
              items: 9128bfac-4829-4705-9b66-a209b8daf1fc
        instructions:
          type: string
          description: System instructions
          example: You are a helpful assistant
        metadata:
          type: object
          description: Metadata key-value pairs
        tools:
          type: array
          description: Tools available for the model
          items:
            oneOf:
              - 2936487d-a905-44b8-9c48-6a9de96ebb74
              - ec535585-7a6b-4374-a6c3-161e09275ef8
              - 5eb199fb-73b4-49de-99fe-b9ba5c5aac50
              - 1af8b9d5-8652-47b0-a365-dd917c7edafa
        tool_choice:
          description: Tool choice strategy
          oneOf:
            - type: string
              enum:
                - none
                - auto
                - required
            - cecd498c-afe5-4725-bc30-481b8bbfc60c
          example: auto
        parallel_tool_calls:
          type: boolean
          description: Enable parallel tool calls
          default: false
        model:
          type: string
          description: Model to use
          example: openai/gpt-4
        models:
          description: Alternative models to try
          type: array
          items:
            type: string
        text:
          description: Text output configuration
          allOf:
            - $ref: '#/components/schemas/TextConfigDto'
        reasoning:
          description: Reasoning configuration
          allOf:
            - $ref: '#/components/schemas/ReasoningConfigDto'
        max_output_tokens:
          type: number
          description: Maximum output tokens
          example: 1000
        temperature:
          type: number
          description: Temperature (0-2)
          example: 0.7
          minimum: 0
          maximum: 2
        top_p:
          type: number
          description: Top P (nucleus sampling)
          example: 1
          minimum: 0
          maximum: 1
        top_logprobs:
          type: number
          description: Top logprobs
          example: 5
          minimum: 0
          maximum: 20
        max_tool_calls:
          type: number
          description: Maximum tool calls
          example: 5
        presence_penalty:
          type: number
          description: Presence penalty (-2 to 2)
          minimum: -2
          maximum: 2
        frequency_penalty:
          type: number
          description: Frequency penalty (-2 to 2)
          minimum: -2
          maximum: 2
        top_k:
          type: number
          description: Top K sampling
          example: 40
        image_config:
          type: object
          description: Image configuration options
        modalities:
          type: array
          description: Output modalities
          items:
            type: string
            enum:
              - text
              - image
        prompt_cache_key:
          type: string
          description: Prompt cache key
        previous_response_id:
          type: string
          description: Previous response ID
        stream:
          type: boolean
          description: Enable streaming
          default: false
        provider:
          description: Provider preferences
          allOf:
            - $ref: '#/components/schemas/ProviderDto'
        user:
          type: string
          description: >-
            Уникальный идентификатор конечного пользователя для отслеживания и
            предотвращения злоупотреблений
          example: user-123
        session_id:
          type: string
          description: Session identifier (max 128 chars)
      required:
        - input
        - model
    ResponsePresenter:
      type: object
      properties:
        id:
          type: string
          description: Response ID
          example: gen_581761234567890123
        object:
          type: string
          enum:
            - response
          example: response
        created_at:
          type: number
          description: Created timestamp
          example: 1234567890
        completed_at:
          type: object
          description: Completed timestamp
          nullable: true
        model:
          type: string
          description: Model used
          example: openai/gpt-4
        status:
          type: string
          enum:
            - completed
            - in_progress
            - failed
            - cancelled
          example: completed
        error:
          description: Error information
          nullable: true
          allOf:
            - $ref: '#/components/schemas/ResponseErrorPresenter'
        output_text:
          type: string
          description: Full output text (convenience field)
          example: Hello! How can I help you today?
        output:
          type: array
          description: Output items array
        usage:
          description: Usage information
          allOf:
            - $ref: '#/components/schemas/ResponsesUsagePresenter'
        metadata:
          type: object
          description: Metadata key-value pairs
      required:
        - id
        - object
        - created_at
        - model
        - status
        - output_text
        - output
    TextConfigDto:
      type: object
      properties:
        format:
          description: Output format configuration
          oneOf:
            - type: string
              enum:
                - text
                - json_object
            - b9b20568-31b7-422b-acb9-1bf725bec771
            - b3e73963-da88-4e13-9b56-c82e21e9ebe1
            - a1053ae8-67f0-40f0-afed-c04054def8b4
          example: text
        verbosity:
          type: string
          description: Verbosity level
          enum:
            - high
            - medium
            - low
          example: medium
    ReasoningConfigDto:
      type: object
      properties:
        effort:
          type: string
          description: Уровень усилий reasoning
          enum:
            - xhigh
            - high
            - medium
            - low
            - minimal
            - none
          example: medium
        summary:
          type: string
          description: Режим summary для reasoning
          enum:
            - auto
            - concise
            - detailed
          example: auto
        max_tokens:
          type: number
          description: Максимальное количество токенов для reasoning
          example: 5000
        enabled:
          type: boolean
          description: Включить/выключить reasoning явно
          example: true
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
    ResponseErrorPresenter:
      type: object
      properties:
        code:
          type: string
          description: Error code
          example: invalid_request
        message:
          type: string
          description: Error message
          example: Invalid input format
        metadata:
          type: object
          description: Error metadata
      required:
        - code
        - message
    ResponsesUsagePresenter:
      type: object
      properties:
        prompt_tokens:
          type: number
          description: Количество токенов в промпте
          example: 10
        completion_tokens:
          type: number
          description: Количество токенов в ответе
          example: 20
        total_tokens:
          type: number
          description: Общее количество токенов (prompt + completion)
          example: 30
        prompt_tokens_details:
          description: Детализация токенов промпта
          nullable: true
          allOf:
            - $ref: '#/components/schemas/PromptTokensDetailsPresenter'
        completion_tokens_details:
          description: Детализация токенов completion
          nullable: true
          allOf:
            - $ref: '#/components/schemas/CompletionTokensDetailsPresenter'
        cost_rub:
          type: object
          description: Стоимость запроса в рублях (списано с баланса клиента)
          example: 0.04131306
          nullable: true
        cost:
          type: object
          description: Стоимость запроса в рублях (alias для cost_rub)
          example: 0.04131306
          nullable: true
      required:
        - prompt_tokens
        - completion_tokens
        - total_tokens
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
    PromptTokensDetailsPresenter:
      type: object
      properties:
        cached_tokens:
          type: number
          description: Кэшированные токены
          example: 0
        audio_tokens:
          type: number
          description: Аудио токены в промпте
          example: 0
        video_tokens:
          type: number
          description: Видео токены в промпте
          example: 0
    CompletionTokensDetailsPresenter:
      type: object
      properties:
        reasoning_tokens:
          type: object
          description: Токены reasoning (для reasoning моделей)
          example: 100
          nullable: true
        audio_tokens:
          type: object
          description: Аудио токены в ответе
          example: 0
          nullable: true
        image_tokens:
          type: object
          description: Токены изображений в ответе
          example: 0
          nullable: true
        accepted_prediction_tokens:
          type: object
          description: Принятые токены предсказаний
          example: 0
          nullable: true
        rejected_prediction_tokens:
          type: object
          description: Отклоненные токены предсказаний
          example: 0
          nullable: true

````