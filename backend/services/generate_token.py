import jwt
from datetime import datetime, timedelta

def generate(key, username, result):
    payload = {
        'username': username,
        'id': result[0],
        'rol': result[1],
        'expiration': str(datetime.utcnow() + timedelta(hours=8))
    }
    token = jwt.encode(payload, key, algorithm='HS256')
    return token
