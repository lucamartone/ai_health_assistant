from jose import jwt
from datetime import datetime, timedelta
import secrets
import base64

SECRET_KEY = "WHvFng4p5u6ULkAmWZKXoXdb2D8kZqDqAcDwKncnZ5s="
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def create_access_token(data: dict):
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    data.update({"exp": expire})
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)
