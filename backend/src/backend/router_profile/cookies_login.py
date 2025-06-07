from jose import jwt, JWTError
from datetime import datetime, timedelta
from fastapi import Depends, Cookie, APIRouter, HTTPException

SECRET_KEY = "WHvFng4p5u6ULkAmWZKXoXdb2D8kZqDqAcDwKncnZ5s="
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def create_access_token(data: dict):
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    data.update({"exp": expire})
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

router_cookies_login = APIRouter()

def get_current_user(access_token: str = Cookie(None)):
    if not access_token:
        print("❌ Nessun token ricevuto!")
        return None
    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"email": payload.get("sub"), "id": payload.get("id")}
    except JWTError:
        raise HTTPException(status_code=403, detail="Token non valido")

@router_cookies_login.get("/me")
async def get_me(user=Depends(get_current_user)):
    return {"user": user}
