from jose import jwt, JWTError, ExpiredSignatureError
from datetime import datetime, timedelta
from fastapi import Depends, Cookie, APIRouter, HTTPException, Response
import os
import base64
from typing import Optional
from dotenv import load_dotenv
from backend.connection import execute_query  # o il tuo modulo con execute_query()

# Carica le variabili d'ambiente dal file .env
load_dotenv()

# Carica le chiavi dalle variabili d'ambiente
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
REFRESH_SECRET_KEY = os.getenv("JWT_REFRESH_SECRET_KEY")

if not SECRET_KEY or not REFRESH_SECRET_KEY:
    raise ValueError("Le chiavi JWT_SECRET_KEY e JWT_REFRESH_SECRET_KEY devono essere definite nel file .env")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
REFRESH_TOKEN_EXPIRE_DAYS = 7

def create_access_token(data: dict) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    data.update({"exp": expire})
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict) -> str:
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    data.update({"exp": expire})
    return jwt.encode(data, REFRESH_SECRET_KEY, algorithm=ALGORITHM)

router_cookies_login = APIRouter()

def get_current_account(access_token: str = Cookie(None)) -> dict:
    if not access_token:
        raise HTTPException(status_code=401, detail="Token mancante")

    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("id")
        if not user_id:
            raise HTTPException(status_code=403, detail="Token non valido: id mancante")

        # Account
        q_acc = """
            SELECT id, email, name, surname, phone, role, birth_date, sex
            FROM account
            WHERE id = %s
        """
        ra = execute_query(q_acc, (user_id,))
        if not ra:
            raise HTTPException(status_code=404, detail="Account non trovato")

        id_, email, name, surname, phone, role, birth_date, sex = ra[0]

        specialization = None
        addresses = []

        if role == "doctor":
            # doctor.id = account.id
            rd = execute_query("SELECT specialization FROM doctor WHERE id = %s", (id_,))
            specialization = rd[0][0] if rd else None

            # location.doctor_id = doctor.id = account.id
            rl = execute_query("""
                SELECT address, latitude, longitude
                FROM location
                WHERE doctor_id = %s
                ORDER BY id
            """, (id_,))
            addresses = [
                {
                    "address": r[0],
                    "latitude": float(r[1]) if r[1] is not None else None,
                    "longitude": float(r[2]) if r[2] is not None else None
                }
                for r in (rl or [])
            ]

        return {
            "id": id_,
            "email": email,
            "name": name,
            "surname": surname,
            "phone": phone,
            "role": role,
            "birth_date": birth_date.isoformat() if birth_date else None,
            "sex": sex,
            "specialization": specialization,
            "addresses": addresses
        }

    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token scaduto")
    except JWTError:
        raise HTTPException(status_code=403, detail="Token non valido")



@router_cookies_login.get("/me")
async def get_me(account=Depends(get_current_account)):
    """
    Ottiene i dati dell'utente corrente, inclusa l'immagine (da DB, non da JWT)
    """
    try:
        # Recupera profile_img dal database
        query = "SELECT profile_img FROM account WHERE id = %s"
        result = execute_query(query, (account["id"],))

        profile_img_base64 = None
        if result and result[0] and result[0][0]:
            raw_img = result[0][0]
            profile_img_base64 = f"data:image/png;base64,{base64.b64encode(raw_img).decode()}"

        # Restituisci account arricchito con profile_img
        return {
            "account": {
                **account,
                "profile_img": profile_img_base64
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore durante la lettura del profilo: {str(e)}")

@router_cookies_login.post("/refresh")
async def refresh_token(refresh_token: str = Cookie(None)):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token mancante")
    
    try:
        payload = jwt.decode(refresh_token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        new_access_token = create_access_token({
            "sub": payload.get("sub"),
            "email": payload.get("email"),
            "id": payload.get("id"),
            "name": payload.get("name"),
            "surname": payload.get("surname"),
            "phone": payload.get("phone"),
            "specialization": payload.get("specialization"),
            "addresses": payload.get("addresses"),
            "role": payload.get("role")
        })
        return {"access_token": new_access_token}
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token scaduto")
    except JWTError:
        raise HTTPException(status_code=403, detail="Refresh token non valido")
