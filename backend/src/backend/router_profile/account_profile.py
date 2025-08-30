from fastapi import APIRouter, HTTPException, Response, Depends, Query
from datetime import datetime, timedelta
from backend.connection import execute_query
from pydantic import EmailStr
from backend.router_profile.pydantic.schemas import ChangePasswordRequest, ResetPasswordRequest, PreferencesPayload
from backend.router_profile.cookies_login import create_access_token, create_refresh_token, get_current_account
from backend.utils.email_service import send_password_reset_email
from passlib.context import CryptContext
import re

router_account_profile = APIRouter()
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

@router_account_profile.delete("/delete_account") 
async def delete_account(
    email: EmailStr = Query(..., description="Email dell'account da eliminare"),
    password: str = Query(..., description="Password attuale per la verifica"),
    current_account: dict = Depends(get_current_account)
):
    """Endpoint per eliminare un account utente."""
    try:
        # Verify account is deleting their own account
        if current_account["email"] != email:
            raise HTTPException(status_code=403, detail="Non autorizzato a eliminare questo account")

        # Verify password
        query = """SELECT password FROM "account" WHERE email = %s"""
        result = execute_query(query, (email,))
        
        if not result:
            raise HTTPException(status_code=404, detail="Utente non trovato")
            
        if not pwd_context.verify(password, result[0][0]):
            raise HTTPException(status_code=401, detail="Password non valida")

        # Get account ID
        select_id_account = """SELECT id FROM "account"" WHERE email = %s"""
        res = execute_query(select_id_account, (email,))
        account_id = res[0][0]

        # Delete in correct order to maintain referential integrity
        delete_patient = "DELETE FROM patient WHERE id_patient = %s"
        delete_doctor = "DELETE FROM doctor WHERE id_doctor = %s"
        delete_account = """DELETE FROM "account" WHERE id = %s"""

        execute_query(delete_patient, (account_id,), commit=True)
        execute_query(delete_doctor, (account_id,), commit=True)
        execute_query(delete_account, (account_id,), commit=True)

        return {"message": "Account eliminato con successo"}

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Errore durante l'eliminazione dell'account: {str(e)}")

@router_account_profile.post("/logout")
async def logout(response: Response):
    """Endpoint per effettuare il logout di un utente eliminando i cookies di accesso."""
    # Elimina access token cookie
    response.delete_cookie(
        key="access_token",
        path="/",
        secure=True,
        httponly=True,
        samesite="Strict"
    )
    # Elimina refresh token cookie
    response.delete_cookie(
        key="refresh_token",
        path="/",
        secure=True,
        httponly=True,
        samesite="Strict"
    )
    return {"message": "Logout effettuato con successo"}

@router_account_profile.post("/change_password")
async def change_password(data: ChangePasswordRequest):
    """Endpoint per modificare la password di un utente."""
    try:
        # Validate new password strength
        if not validate_password(data.new_password):
            raise HTTPException(
                status_code=400,
                detail="La nuova password deve contenere almeno 8 caratteri, una lettera maiuscola, una minuscola e un numero"
            )

        # Verify current password
        query = "SELECT password FROM account WHERE email = %s"
        result = execute_query(query, (data.account_email,))
        
        if not result:
            raise HTTPException(status_code=405, detail="Utente non trovato")
            
        if not pwd_context.verify(data.old_password, result[0][0]):
            raise HTTPException(status_code=401, detail="Password attuale non valida, reinseriscila")

        # Hash and update new password
        hashed_password = pwd_context.hash(data.new_password)
        update_query = """
        UPDATE account 
        SET password = %s,
            password_changed_at = CURRENT_TIMESTAMP
        WHERE email = %s
        """
        execute_query(update_query, (hashed_password, data.account_email), commit=True)

        return {"message": "Password modificata con successo"}

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Errore durante il cambio password: {str(e)}")
    
@router_account_profile.post("/request_password_reset")
async def request_password_reset(email: EmailStr):
    """Endpoint per richiedere il reset della password."""
    try:
        # Check if the account exists
        query = "SELECT id FROM account WHERE email = %s"
        result = execute_query(query, (email,))
        
        if not result:
            # Don't reveal if email exists or not for security
            return {"message": "Se l'email è registrata, riceverai un link di reimpostazione."}

        # Generate reset token
        reset_token = create_access_token(data={"email": email}, expires_delta=timedelta(hours=1))

        # Send email
        email_sent = await send_password_reset_email(email, reset_token)
        
        if email_sent:
            return {"message": "Email di reset inviata con successo"}
        else:
            raise HTTPException(status_code=500, detail="Errore nell'invio dell'email")

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Errore durante la richiesta di reset password: {str(e)}")

@router_account_profile.post("/reset_password")
async def reset_password(payload: ResetPasswordRequest):
    """Imposta una nuova password usando un token di reset valido."""
    try:
        # Decodifica token
        from jose import jwt
        from backend.router_profile.cookies_login import SECRET_KEY, ALGORITHM
        data = jwt.decode(payload.token, SECRET_KEY, algorithms=[ALGORITHM])
        email = data.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Token non valido")

        if not validate_password(payload.new_password):
            raise HTTPException(status_code=400, detail="La nuova password deve contenere almeno 8 caratteri, una lettera maiuscola, una minuscola e un numero")

        hashed = pwd_context.hash(payload.new_password)
        execute_query("UPDATE account SET password = %s WHERE email = %s", (hashed, email), commit=True)
        return {"message": "Password reimpostata con successo"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Errore durante il reset password: {str(e)}")

@router_account_profile.get('/preferences')
async def get_preferences(account_id: int = Query(..., gt=0)):
    try:
        # Per semplicità, memorizziamo preferenze in una tabella JSON per account
        create_table = """
            CREATE TABLE IF NOT EXISTS account_preferences (
                account_id INT PRIMARY KEY REFERENCES account(id) ON DELETE CASCADE,
                notifications JSONB,
                privacy JSONB,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        execute_query(create_table, commit=True)

        res = execute_query("SELECT notifications, privacy FROM account_preferences WHERE account_id = %s", (account_id,))
        if not res:
            return {"notifications": {"reminders": True, "testResults": True, "newsletter": False}, "privacy": {"shareWithDoctors": True, "publicProfile": False}}
        return {"notifications": res[0][0], "privacy": res[0][1]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Errore nel recupero preferenze: {str(e)}")

@router_account_profile.post('/preferences')
async def save_preferences(account_id: int = Query(..., gt=0), payload: PreferencesPayload = None):
    try:
        create_table = """
            CREATE TABLE IF NOT EXISTS account_preferences (
                account_id INT PRIMARY KEY REFERENCES account(id) ON DELETE CASCADE,
                notifications JSONB,
                privacy JSONB,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        execute_query(create_table, commit=True)

        upsert = """
            INSERT INTO account_preferences(account_id, notifications, privacy, updated_at)
            VALUES (%s, %s, %s, CURRENT_TIMESTAMP)
            ON CONFLICT (account_id) DO UPDATE SET
                notifications = EXCLUDED.notifications,
                privacy = EXCLUDED.privacy,
                updated_at = CURRENT_TIMESTAMP
        """
        execute_query(upsert, (account_id, payload.notifications, payload.privacy), commit=True)
        return {"message": "Preferenze salvate"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Errore nel salvataggio preferenze: {str(e)}")