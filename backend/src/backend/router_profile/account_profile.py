from fastapi import APIRouter, HTTPException, Response, Depends, Query
from datetime import datetime, timedelta
from backend.connection import execute_query
from pydantic import EmailStr
from backend.router_profile.pydantic.schemas import ChangePasswordRequest
from backend.router_profile.cookies_login import create_access_token, create_refresh_token, get_current_account
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
            raise HTTPException(status_code=404, detail="Utente non trovato")
            
        if not pwd_context.verify(data.old_password, result[0][0]):
            raise HTTPException(status_code=401, detail="Password attuale non valida")

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
        raise HTTPException(status_code=400, detail=f"Errore durante il cambio password: {str(e)}")