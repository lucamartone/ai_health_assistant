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
    """Endpoint generico per il login di tutti i tipi di utente."""
    try:
        # Query generica per tutti i tipi di account
        query = """
        SELECT id, name, surname, email, password, profile_img, last_login_attempt, failed_attempts, phone, role
        FROM account 
        WHERE email = %s
        """
        results = execute_query(query, (data.email,))

        if not results:
            raise HTTPException(status_code=404, detail="Account non registrato")

        account = results[0]
        db_password = account[4]
        last_attempt = account[6]
        failed_attempts = account[7] or 0
        role = account[9]

        # Controllo tentativi falliti
        if failed_attempts >= 5 and last_attempt:
            lockout_time = last_attempt + timedelta(minutes=15)
            if datetime.now() < lockout_time:
                raise HTTPException(
                    status_code=429,
                    detail=f"Account temporaneamente bloccato. Riprova dopo {lockout_time}"
                )

        # Verifica password
        if not pwd_context.verify(data.password, db_password):
            update_attempts = """
            UPDATE account 
            SET failed_attempts = failed_attempts + 1,
                last_login_attempt = CURRENT_TIMESTAMP
            WHERE email = %s
            """
            execute_query(update_attempts, (data.email,), commit=True)
            raise HTTPException(status_code=401, detail="Password errata")

        # Reset tentativi falliti
        reset_attempts = """
        UPDATE account 
        SET failed_attempts = 0,
            last_login_attempt = CURRENT_TIMESTAMP
        WHERE email = %s
        """
        execute_query(reset_attempts, (data.email,), commit=True)

        # Codifica immagine profilo in base64
        profile_img = account[5]
        profile_img_base64 = f"data:image/png;base64,{base64.b64encode(profile_img).decode()}" if profile_img else None

        # Crea token con ruolo specifico
        access_token = create_access_token({
            "sub": account[2],  # email
            "id": account[0],
            "name": account[1],
            "surname": account[2],
            "email": account[3],
            "role": role,
            "phone": account[8]
        })

        refresh_token = create_refresh_token({
            "sub": account[2],  # email
            "id": account[0],
            "name": account[1],
            "surname": account[2],
            "email": account[3],
            "role": role,
            "phone": account[8]
        })

        # Imposta cookie
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            max_age=3600,
            samesite="Strict",
            secure=False,  # Cambia in True in produzione
            path="/"
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            max_age=7 * 24 * 3600,
            samesite="Strict",
            secure=False,  # Cambia in True in produzione
            path="/"
        )

        return {
            "message": "Login riuscito",
            "account": {
                "id": account[0],
                "name": account[1],
                "surname": account[2],
                "email": account[3],
                "profile_img": profile_img_base64,
                "phone": account[8],
                "role": role
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

@router_auth.get("/me")
async def get_current_user(request):
    """Endpoint per ottenere i dati dell'utente corrente."""
    # TODO: Implementare verifica token
    pass 