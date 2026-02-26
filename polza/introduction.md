> ## Documentation Index
> Fetch the complete documentation index at: https://polza.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Введение в API

> Обзор Polza.ai API и способы аутентификации

Polza.ai предоставляет REST API, совместимый со стандартом OpenAI, для доступа к сотням AI-моделей.

## Базовый URL

```
https://polza.ai/api
```

## Аутентификация

Все запросы требуют API-ключ в заголовке `Authorization`:

```bash  theme={null}
Authorization: Bearer YOUR_API_KEY
```

<Note>
  Получите API-ключ в [консоли](https://polza.ai/dashboard/api-keys).
</Note>

## Совместимость с OpenAI

Polza.ai полностью совместим с OpenAI SDK. Просто измените `base_url`:

<CodeGroup>
  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      base_url="https://polza.ai/api/v1",
      api_key="<POLZA_AI_API_KEY>"
  )
  ```

  ```typescript TypeScript theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
      baseURL: 'https://polza.ai/api/v1',
      apiKey: '<POLZA_AI_API_KEY>'
  });
  ```
</CodeGroup>

## Коды ответов

| Код | Описание                                  |
| --- | ----------------------------------------- |
| 200 | Успешный запрос                           |
| 201 | Задача создана (для асинхронных операций) |
| 400 | Неверный запрос                           |
| 401 | Ошибка аутентификации                     |
| 402 | Недостаточно средств                      |
| 403 | Доступ запрещён                           |
| 404 | Ресурс не найден                          |
| 408 | Таймаут запроса                           |
| 429 | Превышен лимит запросов                   |
| 500 | Ошибка сервера                            |
| 502 | Провайдер недоступен                      |
| 503 | Нет доступных провайдеров                 |

## Формат ошибок

```json  theme={null}
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Ресурс не найден"
  }
}
```

## Лимиты

| Параметр                             | Значение   |
| ------------------------------------ | ---------- |
| Макс. размер файла                   | 50 MB      |
| Макс. размер изображения (хранилище) | 10 MB      |
| Таймаут                              | 600 секунд |
