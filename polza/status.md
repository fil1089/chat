> ## Documentation Index
> Fetch the complete documentation index at: https://polza.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# GET Media Status

> Получение статуса генерации медиа

## Polling

Рекомендуется проверять статус с интервалом 3-5 секунд для изображений и 5-10 секунд для видео.

## Статусы

| Статус       | Описание                            |
| ------------ | ----------------------------------- |
| `pending`    | В очереди                           |
| `processing` | Генерация выполняется               |
| `completed`  | Готово — результат в поле `data`    |
| `failed`     | Ошибка — подробности в поле `error` |

## Ответ (completed)

```json  theme={null}
{
  "id": "aig_abc123",
  "object": "media.generation",
  "status": "completed",
  "created": 1703001244,
  "model": "veo3.1",
  "data": {
    "url": "https://cdn.polza.ai/video.mp4"
  },
  "usage": {
    "cost_rub": 5.00,
    "cost": 5.00
  }
}
```

## Примеры polling

<CodeGroup>
  ```python Python theme={null}
  import requests
  import time

  def wait_for_media(api_key, media_id, interval=5, max_wait=300):
      url = f'https://polza.ai/api/v1/media/{media_id}'
      headers = {'Authorization': f'Bearer {api_key}'}
      elapsed = 0

      while elapsed < max_wait:
          response = requests.get(url, headers=headers)
          data = response.json()

          if data['status'] == 'completed':
              return data
          elif data['status'] == 'failed':
              raise Exception(f"Генерация не удалась: {data.get('error')}")

          time.sleep(interval)
          elapsed += interval

      raise TimeoutError("Превышено время ожидания")

  result = wait_for_media('YOUR_API_KEY', 'aig_abc123')
  print(f"Результат: {result['data']['url']}")
  ```

  ```javascript JavaScript theme={null}
  async function waitForMedia(apiKey, mediaId, interval = 5000, maxWait = 300000) {
    const url = `https://polza.ai/api/v1/media/${mediaId}`;
    let elapsed = 0;

    while (elapsed < maxWait) {
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      const data = await response.json();

      if (data.status === 'completed') return data;
      if (data.status === 'failed') throw new Error(`Ошибка: ${data.error}`);

      await new Promise(resolve => setTimeout(resolve, interval));
      elapsed += interval;
    }

    throw new Error('Превышено время ожидания');
  }
  ```
</CodeGroup>

<Note>
  Результаты хранятся 7 дней на CDN. Для постоянного хранения используйте [Storage API](/api-reference/storage/upload).
</Note>


## OpenAPI

````yaml GET /v1/media/{id}
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
  /v1/media/{id}:
    get:
      tags:
        - Медиа
      summary: Получить статус генерации
      operationId: MediaController_getGenerationStatus[1]
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