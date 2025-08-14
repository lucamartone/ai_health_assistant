from fastapi import APIRouter, HTTPException, Response
from backend.router_profile.pydantic.schemas import LoginRequest
from backend.connection import execute_query
from backend.router_profile.cookies_login import create_access_token, create_refresh_token
from passlib.context import CryptContext
from datetime import datetime, timedelta
import base64

router_auth = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router_auth.post("/login")
async def login(data: LoginRequest, response: Response):
    try:
        # 1) Account base
        query_account = """
        SELECT id, name, surname, email, password, profile_img,
               last_login_attempt, failed_attempts, phone, role
        FROM account
        WHERE email = %s
        """
        results = execute_query(query_account, (data.email,))
        if not results:
            raise HTTPException(status_code=404, detail="Account non registrato")

        account = results[0]
        account_id = account[0]
        name = account[1]
        surname = account[2]
        email = account[3]
        db_password = account[4]
        profile_img = account[5]
        last_attempt = account[6]
        failed_attempts = account[7] or 0
        phone = account[8]
        role = account[9]

        # 2) Controllo lockout
        if failed_attempts >= 5 and last_attempt:
            lockout_time = last_attempt + timedelta(minutes=15)
            if datetime.now() < lockout_time:
                raise HTTPException(
                    status_code=429,
                    detail=f"Account temporaneamente bloccato. Riprova dopo {lockout_time}"
                )

        # 3) Verifica password
        if not pwd_context.verify(data.password, db_password):
            execute_query(
                "UPDATE account SET failed_attempts = failed_attempts + 1, last_login_attempt = CURRENT_TIMESTAMP WHERE email = %s",
                (data.email,), commit=True
            )
            raise HTTPException(status_code=401, detail="Password errata")

        # Reset tentativi falliti
        execute_query(
            "UPDATE account SET failed_attempts = 0, last_login_attempt = CURRENT_TIMESTAMP WHERE email = %s",
            (data.email,), commit=True
        )

        # 4) Specialization e addresses (solo per doctor)
        specialization = None
        addresses = []
        if role == "doctor":
            res_doc = execute_query("SELECT specialization FROM doctor WHERE id = %s", (account_id,))
            specialization = res_doc[0][0] if res_doc else None

            res_loc = execute_query("""
                SELECT address, latitude, longitude
                FROM location
                WHERE doctor_id = %s
                ORDER BY id
            """, (account_id,))
            addresses = [
                {
                    "address": r[0],
                    "latitude": float(r[1]) if r[1] else None,
                    "longitude": float(r[2]) if r[2] else None
                }
                for r in res_loc or []
            ]

        # 5) Immagine profilo in base64
        profile_img_base64 = (
            f"data:image/png;base64,{base64.b64encode(profile_img).decode()}"
            if profile_img else None
        )

        # 6) Payload per i token
        token_payload = {
            "sub": email,
            "id": account_id,
            "name": name,
            "surname": surname,
            "email": email,
            "role": role,
            "phone": phone,
            "specialization": specialization,
            "addresses": addresses
        }

        # 7) Crea i token
        access_token = create_access_token(token_payload.copy())
        refresh_token = create_refresh_token(token_payload.copy())

        # 8) Imposta i cookie
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            max_age=3600,
            samesite="Strict",
            secure=False,  # Cambiare a True in produzione
            path="/"
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            max_age=7 * 24 * 3600,
            samesite="Strict",
            secure=False,  # Cambiare a True in produzione
            path="/"
        )

        # 9) Risposta JSON identica a /me
        return {
            "message": "Login riuscito",
            "account": {
                "id": account_id,
                "name": name,
                "surname": surname,
                "email": email,
                "phone": phone,
                "role": role,
                "specialization": specialization,
                "addresses": addresses,
                "profile_img": profile_img_base64
            }
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore interno: {str(e)}")


@router_auth.post("/logout")
async def logout(response: Response):
    """Endpoint per il logout."""
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logout effettuato con successo"}