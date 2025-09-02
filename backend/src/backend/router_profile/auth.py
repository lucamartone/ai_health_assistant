"""
Sistema di autenticazione completo per gli utenti.

Questo modulo gestisce tutto il processo di autenticazione:
- Login con verifica password e gestione tentativi falliti
- Sistema di lockout temporaneo per sicurezza
- Gestione dei token JWT (access e refresh)
- Impostazione dei cookie sicuri
- Logout con pulizia dei cookie
- Recupero informazioni complete del profilo

Il sistema implementa misure di sicurezza avanzate
incluso il blocco temporaneo degli account dopo tentativi falliti.
"""

from fastapi import APIRouter, HTTPException, Response
from backend.router_profile.pydantic.schemas import LoginRequest
from backend.connection import execute_query
from backend.router_profile.cookies_login import create_access_token, create_refresh_token
from passlib.context import CryptContext
from datetime import datetime, timedelta
import base64

# Router per l'autenticazione
router_auth = APIRouter()

# Contesto per la gestione delle password con bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router_auth.post("/login")
async def login(data: LoginRequest, response: Response):
    """
    Endpoint per l'autenticazione degli utenti.
    
    Questa funzione gestisce il processo completo di login:
    1. Verifica dell'esistenza dell'account
    2. Controllo del lockout temporaneo
    3. Verifica della password
    4. Reset dei tentativi falliti
    5. Recupero informazioni specifiche per ruolo
    6. Creazione e impostazione dei token JWT
    7. Impostazione dei cookie sicuri
    
    Args:
        data: Oggetto LoginRequest contenente email e password
        response: Oggetto Response per impostare i cookie
        
    Returns:
        dict: Dizionario con informazioni complete dell'account autenticato
        
    Raises:
        HTTPException: In caso di account non trovato, bloccato, password errata o errori
    """
    try:
        # 1) Recupero informazioni base dell'account
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

        # 2) Controllo del lockout temporaneo (15 minuti dopo 5 tentativi falliti)
        if failed_attempts >= 5 and last_attempt:
            lockout_time = last_attempt + timedelta(minutes=15)
            if datetime.now() < lockout_time:
                raise HTTPException(
                    status_code=429,
                    detail=f"Account temporaneamente bloccato. Riprova dopo {lockout_time}"
                )

        # 3) Verifica della password con bcrypt
        if not pwd_context.verify(data.password, db_password):
            # Incrementa i tentativi falliti e aggiorna il timestamp
            execute_query(
                "UPDATE account SET failed_attempts = failed_attempts + 1, last_login_attempt = CURRENT_TIMESTAMP WHERE email = %s",
                (data.email,), commit=True
            )
            raise HTTPException(status_code=401, detail="Password errata")

        # Reset dei tentativi falliti dopo login riuscito
        execute_query(
            "UPDATE account SET failed_attempts = 0, last_login_attempt = CURRENT_TIMESTAMP WHERE email = %s",
            (data.email,), commit=True
        )

        # 4) Recupero specializzazione e indirizzi (solo per i dottori)
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

        # 5) Conversione dell'immagine profilo in base64 per il frontend
        profile_img_base64 = (
            f"data:image/png;base64,{base64.b64encode(profile_img).decode()}"
            if profile_img else None
        )

        # 6) Preparazione del payload per i token JWT
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

        # 7) Creazione dei token JWT (access e refresh)
        access_token = create_access_token(token_payload.copy())
        refresh_token = create_refresh_token(token_payload.copy())

        # 8) Impostazione dei cookie sicuri per l'autenticazione
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,           # Previene accesso JavaScript
            max_age=3600,            # Scadenza 1 ora
            samesite="Strict",       # Protezione CSRF
            secure=False,             # Cambiare a True in produzione con HTTPS
            path="/"
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,           # Previene accesso JavaScript
            max_age=7 * 24 * 3600,  # Scadenza 7 giorni
            samesite="Strict",       # Protezione CSRF
            secure=False,             # Cambiare a True in produzione con HTTPS
            path="/"
        )

        # 9) Risposta JSON con informazioni complete dell'account
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
    """
    Endpoint per il logout dell'utente.
    
    Questa funzione rimuove i cookie di autenticazione
    (access_token e refresh_token) per terminare la sessione.
    
    Args:
        response: Oggetto Response per rimuovere i cookie
        
    Returns:
        dict: Messaggio di conferma del logout
    """
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logout effettuato con successo"}