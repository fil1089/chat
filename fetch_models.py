import requests
import json

url = "https://polza.ai/api/v1/models"
headers = {
    "Authorization": "Bearer polza_sk_7815f97334814d2ca7ea036495beea7b"
}

try:
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    data = response.json()
    with open("polza_models_v2.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("Successfully saved to polza_models_v2.json")
except Exception as e:
    print(f"Error: {e}")
