> ## Documentation Index
> Fetch the complete documentation index at: https://polza.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT Image 1.5

> Генерация и редактирование изображений с GPT Image 1.5

Модель генерации и редактирования изображений. Качество medium (сбалансированное) или high (детальнее). До 16 референс-изображений для редактирования.

<Note>
  Полная документация API: [Генерация медиа](/api-reference/media/create)
</Note>

## Обзор

| Характеристика | Значение                          |
| -------------- | --------------------------------- |
| ID модели      | `openai/gpt-image-1.5`            |
| aspect\_ratio  | 1:1, 2:3, 3:2 (обязательный)      |
| quality        | medium, high. По умолчанию medium |
| images         | до 16 изображений на вход         |

## Параметры

| Параметр       | Обязательный | Описание                                  |
| -------------- | ------------ | ----------------------------------------- |
| `model`        | Да           | `openai/gpt-image-1.5`                    |
| `prompt`       | Да           | Текстовое описание                        |
| `aspect_ratio` | Да           | 1:1, 2:3, 3:2                             |
| `images`       | Нет          | URL изображений для редактирования, до 16 |
| `quality`      | Да           | medium или high. По умолчанию medium      |

## Пример запроса (cURL)

```bash  theme={null}
curl -X POST "https://polza.ai/api/v1/media" \
  -H "Authorization: Bearer <POLZA_AI_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-image-1.5",
    "input": {
      "prompt": "Описание изображения",
      "aspect_ratio": "1:1",
      "quality": "medium",
      "images": []
    },
    "async": true
  }'
```
