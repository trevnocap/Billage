from django.test import TestCase

# Create your tests here.

import requests
import json

url = 'http://127.0.0.1:8000/api/manage-billage/OG8O9VXW/link-bill'
headers = {'Content-type': 'application/json'}

data = {
    "payment_method_type": "credit_card",
    "credit_card": {
        "userid": 13,
        "account_owner_firstname": "Trever",
        "account_owner_lastname": "Dillon",
        "card_number": "1111111111111111",
        "exp_date": "09/23",
        "cvv": "123"
    }
}

json_data = json.dumps(data)

response = requests.put(url, headers = headers, data=json_data)
print(response.status_code)
print(response.content)