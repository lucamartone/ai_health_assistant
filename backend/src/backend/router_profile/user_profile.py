from fastapi import APIRouter, HTTPException, Response, Depends, Query
from typing import Optional
from datetime import datetime, timedelta
from backend.connection import execute_query
from pydantic import EmailStr, constr
from backend.router_profile.pydantic.profile_requests import LoginRequest, RegisterRequest
from backend.router_profile.cookies_login import create_access_token, get_current_user
from passlib.context import CryptContext
import re

router_user_profile = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def validate_password(password: str) -> bool:
    """Verifica la robustezza della password."""
    if len(password) < 8:
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[a-z]", password):
        return False
    if not re.search(r"\d", password):
        return False
    return True

@router_user_profile.post("/login")
async def login(data: LoginRequest, response: Response):
    """Endpoint per autenticare un utente e creare una sessione."""
    try:
        # Check for too many failed attempts (implement rate limiting)
        query = """
        SELECT id, name, surname, email, password, last_login_attempt, failed_attempts 
        FROM user 
        WHERE email = %s
        """
        results = execute_query(query, (data.email,))

        if not results:
            raise HTTPException(status_code=401, detail="Email non registrata")

        user = results[0]
        db_password = user[4]
        last_attempt = user[5]
        failed_attempts = user[6] or 0

        # Check if account is temporarily locked
        if failed_attempts >= 5 and last_attempt:
            lockout_time = last_attempt + timedelta(minutes=15)
            if datetime.now() < lockout_time:
                raise HTTPException(
                    status_code=429,
                    detail=f"Account temporaneamente bloccato. Riprova dopo {lockout_time}"
                )

        if not pwd_context.verify(data.password, db_password):
            # Update failed attempts
            update_attempts = """
            UPDATE user 
            SET failed_attempts = failed_attempts + 1,
                last_login_attempt = CURRENT_TIMESTAMP
            WHERE email = %s
            """
            execute_query(update_attempts, (data.email,), commit=True)
            raise HTTPException(status_code=401, detail="Password errata")

        # Reset failed attempts on successful login
        reset_attempts = """
        UPDATE user 
        SET failed_attempts = 0,
            last_login_attempt = CURRENT_TIMESTAMP
        WHERE email = %s
        """
        execute_query(reset_attempts, (data.email,), commit=True)
        
        token = create_access_token({
            "sub": user[3],
            "id": user[0],
            "name": user[1],
            "surname": user[2]
        })

        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            max_age=60 * 60,  # 1 ora
            samesite="Lax",
            secure=True,  # True per HTTPS
            path="/"
        )

        return {
            "message": "Login riuscito",
            "user": {
                "id": user[0],
                "name": user[1],
                "surname": user[2],
                "email": user[3],
            }
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore server: {str(e)}")

@router_user_profile.post("/register") 
async def register(data: RegisterRequest):
    """Endpoint per registrare un nuovo utente."""
    try:
        # Validate password strength
        if not validate_password(data.password):
            raise HTTPException(
                status_code=400,
                detail="La password deve contenere almeno 8 caratteri, una lettera maiuscola, una minuscola e un numero"
            )

        # Check if email already exists
        check_email = "SELECT id FROM user WHERE email = %s"
        if execute_query(check_email, (data.email,)):
            raise HTTPException(status_code=400, detail="Email già registrata")

        # Hash password
        hashed_password = pwd_context.hash(data.password)

        reg_query = """
        INSERT INTO user (
            name, surname, email, password, sex,
            created_at, last_login_attempt, failed_attempts
        ) VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP, NULL, 0)
        RETURNING id
        """
        
        params = (data.name, data.surname, data.email, hashed_password, data.sex)
        result = execute_query(reg_query, params, commit=True)

        return {
            "message": "Registrazione completata con successo",
            "user_id": result[0][0] if result else None
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Errore nella registrazione: {str(e)}")

@router_user_profile.delete("/delete_account") 
async def delete_account(
    email: EmailStr = Query(..., description="Email dell'account da eliminare"),
    password: str = Query(..., description="Password attuale per la verifica"),
    current_user: dict = Depends(get_current_user)
):
    """Endpoint per eliminare un account utente."""
    try:
        # Verify user is deleting their own account
        if current_user["email"] != email:
            raise HTTPException(status_code=403, detail="Non autorizzato a eliminare questo account")

        # Verify password
        query = "SELECT password FROM user WHERE email = %s"
        result = execute_query(query, (email,))
        
        if not result:
            raise HTTPException(status_code=404, detail="Utente non trovato")
            
        if not pwd_context.verify(password, result[0][0]):
            raise HTTPException(status_code=401, detail="Password non valida")

        # Get user ID
        select_id_user = "SELECT id FROM user WHERE email = %s"
        res = execute_query(select_id_user, (email,))
        user_id = res[0][0]

        # Delete in correct order to maintain referential integrity
        delete_patient = "DELETE FROM patient WHERE id_patient = %s"
        delete_doctor = "DELETE FROM doctor WHERE id_doctor = %s"
        delete_user = "DELETE FROM user WHERE id = %s"

        execute_query(delete_patient, (user_id,), commit=True)
        execute_query(delete_doctor, (user_id,), commit=True)
        execute_query(delete_user, (user_id,), commit=True)

        return {"message": "Account eliminato con successo"}

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Errore durante l'eliminazione dell'account: {str(e)}")

@router_user_profile.post("/logout")
async def logout(response: Response):
    """Endpoint per effettuare il logout di un utente eliminando il cookie di accesso."""
    response.delete_cookie(
        key="access_token",
        path="/",
        secure=True,
        httponly=True,
        samesite="Lax"
    )
    return {"message": "Logout effettuato con successo"}

@router_user_profile.post("/change_password")
async def change_password(
    current_password: str = Query(..., description="Password attuale"),
    new_password: str = Query(..., description="Nuova password"),
    current_user: dict = Depends(get_current_user)
):
    """Endpoint per modificare la password di un utente."""
    try:
        # Validate new password strength
        if not validate_password(new_password):
            raise HTTPException(
                status_code=400,
                detail="La nuova password deve contenere almeno 8 caratteri, una lettera maiuscola, una minuscola e un numero"
            )

        # Verify current password
        query = "SELECT password FROM user WHERE email = %s"
        result = execute_query(query, (current_user["email"],))
        
        if not result:
            raise HTTPException(status_code=404, detail="Utente non trovato")
            
        if not pwd_context.verify(current_password, result[0][0]):
            raise HTTPException(status_code=401, detail="Password attuale non valida")

        # Hash and update new password
        hashed_password = pwd_context.hash(new_password)
        update_query = """
        UPDATE user 
        SET password = %s,
            password_changed_at = CURRENT_TIMESTAMP
        WHERE email = %s
        """
        execute_query(update_query, (hashed_password, current_user["email"]), commit=True)

        return {"message": "Password modificata con successo"}

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Errore durante il cambio password: {str(e)}")