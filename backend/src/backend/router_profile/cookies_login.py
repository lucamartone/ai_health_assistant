from jose import jwt, JWTError, ExpiredSignatureError
from datetime import datetime, timedelta
from fastapi import Depends, Cookie, APIRouter, HTTPException, Response
import os
from typing import Optional
from dotenv import load_dotenv

# Carica le variabili d'ambiente dal file .env
load_dotenv()

# Carica le chiavi dalle variabili d'ambiente
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
REFRESH_SECRET_KEY = os.getenv("JWT_REFRESH_SECRET_KEY")

# Verifica che le chiavi siano state caricate
if not SECRET_KEY or not REFRESH_SECRET_KEY:
    raise ValueError("Le chiavi JWT_SECRET_KEY e JWT_REFRESH_SECRET_KEY devono essere definite nel file .env")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
REFRESH_TOKEN_EXPIRE_DAYS = 7

def create_access_token(data: dict) -> str:
    """ Crea un token di accesso per l'utente """
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    data.update({"exp": expire})
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict) -> str:
    """ Crea un token di refresh per l'utente """
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    data.update({"exp": expire})
    return jwt.encode(data, REFRESH_SECRET_KEY, algorithm=ALGORITHM)

router_cookies_login = APIRouter()

def get_current_account(access_token: str = Cookie(None)) -> Optional[dict]:
    """ Ottiene l'utente corrente dal token di accesso """
    if not access_token:
        raise HTTPException(status_code=401, detail="Token mancante")
    
    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        return {
            "email": payload.get("sub"),
            "id": payload.get("id"),
            "name": payload.get("name"),
            "surname": payload.get("surname")
        }
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token scaduto")
    except JWTError:
        raise HTTPException(status_code=403, detail="Token non valido")

@router_cookies_login.get("/me")
async def get_me(account=Depends(get_current_account)):
    """
    Ottiene i dati dell'utente corrente
    """
    return {"account": account}

@router_cookies_login.post("/refresh")
async def refresh_token(refresh_token: str = Cookie(None)):
    """
    Rinnova il token di accesso usando il refresh token
    """
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token mancante")
    
    try:
        payload = jwt.decode(refresh_token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        new_access_token = create_access_token({
            "sub": payload.get("sub"),
            "id": payload.get("id"),
            "name": payload.get("name"),
            "surname": payload.get("surname")
        })
        return {"access_token": new_access_token}
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token scaduto")
    except JWTError:
        raise HTTPException(status_code=403, detail="Refresh token non valido")
