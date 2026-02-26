> ## Documentation Index
> Fetch the complete documentation index at: https://polza.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# GET Balance

> Запрос текущего баланса аккаунта

## Примеры

<CodeGroup>
  ```bash cURL theme={null}
  curl "https://polza.ai/api/v1/balance" \
    -H "Authorization: Bearer YOUR_API_KEY"
  ```

  ```python Python theme={null}
  import requests

  response = requests.get(
      'https://polza.ai/api/v1/balance',
      headers={'Authorization': 'Bearer YOUR_API_KEY'}
  )

  data = response.json()
  print(f"Баланс: {data['amount']} руб.")
  ```

  ```javascript JavaScript theme={null}
  const response = await fetch('https://polza.ai/api/v1/balance', {
    headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
  });

  const data = await response.json();
  console.log(`Баланс: ${data.amount} руб.`);
  ```
</CodeGroup>

## Ответ (200)

```json  theme={null}
{
  "amount": "9.28591714"
}
```

| Поле     | Тип    | Описание                |
| -------- | ------ | ----------------------- |
| `amount` | string | Текущий баланс в рублях |

## Мониторинг баланса

```python  theme={null}
import requests
import time

def check_balance(api_key, min_balance=100):
    response = requests.get(
        'https://polza.ai/api/v1/balance',
        headers={'Authorization': f'Bearer {api_key}'}
    )

    data = response.json()
    balance = float(data['amount'])

    if balance < min_balance:
        print(f"Внимание! Баланс низкий: {balance} руб.")

    return balance

# Проверка каждый час
while True:
    balance = check_balance('YOUR_API_KEY')
    print(f"Текущий баланс: {balance} руб.")
    time.sleep(3600)
```

<Note>
  Пополнить баланс можно в [консоли](https://polza.ai/dashboard) через банковскую карту, СБП или счёт для юридических лиц.
</Note>


## OpenAPI

````yaml GET /v1/balance
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
  /v1/balance:
    get:
      tags:
        - Ai
      operationId: AiController_getUserBalance[1]
      parameters: []
      responses:
        '200':
          description: ''
        '401':
          description: Ошибка авторизации. Проверьте ключ доступа
        '403':
          description: Ошибка доступа. Проверьте права доступа ключа
        '500':
          description: Ошибка сервера. Обратитесь к поставщику услуг

````