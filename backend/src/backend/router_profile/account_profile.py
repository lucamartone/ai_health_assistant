from fastapi import APIRouter, HTTPException, Response, Depends, Query
from datetime import datetime, timedelta
from backend.connection import execute_query
from pydantic import EmailStr
from backend.router_profile.pydantic.profile_requests import LoginRequest
from backend.router_profile.cookies_login import create_access_token, get_current_account
from passlib.context import CryptContext
import re

router_account_profile = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router_account_profile.get("/profile")
async def get_profile(current_account: dict = Depends(get_current_account)):
    """Restituisce i dati completi dell'account corrente."""
    try:
        query = """
        SELECT id, name, surname, email, sex
        FROM account
        WHERE id = %s
        """
        account_res = execute_query(query, (current_account["id"],))
        if not account_res:
            raise HTTPException(status_code=404, detail="Utente non trovato")

        acc = account_res[0]
        profile = {
            "id": acc[0],
            "name": acc[1],
            "surname": acc[2],
            "email": acc[3],
            "sex": acc[4],
        }

        doc_res = execute_query("SELECT specialization FROM doctor WHERE id = %s", (acc[0],))
        if doc_res:
            profile["role"] = "doctor"
            profile["specialization"] = doc_res[0][0]
            loc_res = execute_query(
                "SELECT id, address, latitude, longitude FROM location WHERE doctor_id = %s",
                (acc[0],),
            )
            profile["locations"] = [
                {
                    "id": l[0],
                    "address": l[1],
                    "latitude": float(l[2]) if l[2] is not None else None,
                    "longitude": float(l[3]) if l[3] is not None else None,
                }
                for l in loc_res
            ]
        else:
            profile["role"] = "patient"

        return {"profile": profile}

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore recupero profilo: {str(e)}")

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

@router_account_profile.post("/login")
async def login(data: LoginRequest, response: Response):
    """Endpoint per autenticare un utente e creare una sessione."""
    try:
        # Check for too many failed attempts (implement rate limiting)
        query = """
        SELECT id, name, surname, email, password, last_login_attempt, failed_attempts 
        FROM account
        WHERE email = %s
        """
        results = execute_query(query, (data.email,))

        if not results:
            raise HTTPException(status_code=401, detail="Email non registrata")

        account = results[0]
        db_password = account[4]
        last_attempt = account[5]
        failed_attempts = account[6] or 0

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
            UPDATE "account" 
            SET failed_attempts = failed_attempts + 1,
                last_login_attempt = CURRENT_TIMESTAMP
            WHERE email = %s
            """
            execute_query(update_attempts, (data.email,), commit=True)
            raise HTTPException(status_code=401, detail="Password errata")

        # Reset failed attempts on successful login
        reset_attempts = """
        UPDATE "account" 
        SET failed_attempts = 0,
            last_login_attempt = CURRENT_TIMESTAMP
        WHERE email = %s
        """
        execute_query(reset_attempts, (data.email,), commit=True)
        
        token = create_access_token({
            "sub": account[3],
            "id": account[0],
            "name": account[1],
            "surname": account[2]
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
            "account": {
                "id": account[0],
                "name": account[1],
                "surname": account[2],
                "email": account[3],
            }
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore server: {str(e)}")

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
        select_id_account = "SELECT id FROM account WHERE email = %s"
        res = execute_query(select_id_account, (email,))
        account_id = res[0][0]

        # Delete in correct order to maintain referential integrity
        delete_patient = "DELETE FROM patient WHERE id = %s"
        delete_doctor = "DELETE FROM doctor WHERE id = %s"
        delete_account = "DELETE FROM account WHERE id = %s"

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
    """Endpoint per effettuare il logout di un utente eliminando il cookie di accesso."""
    response.delete_cookie(
        key="access_token",
        path="/",
        secure=True,
        httponly=True,
        samesite="Lax"
    )
    return {"message": "Logout effettuato con successo"}

@router_account_profile.post("/change_password")
async def change_password(
    current_password: str = Query(..., description="Password attuale"),
    new_password: str = Query(..., description="Nuova password"),
    current_account: dict = Depends(get_current_account)
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
        query = "SELECT password FROM account WHERE email = %s"
        result = execute_query(query, (current_account["email"],))
        
        if not result:
            raise HTTPException(status_code=404, detail="Utente non trovato")
            
        if not pwd_context.verify(current_password, result[0][0]):
            raise HTTPException(status_code=401, detail="Password attuale non valida")

        # Hash and update new password
        hashed_password = pwd_context.hash(new_password)
        update_query = """
        UPDATE account 
        SET password = %s,
            password_changed_at = CURRENT_TIMESTAMP
        WHERE email = %s
        """
        execute_query(update_query, (hashed_password, current_account["email"]), commit=True)

        return {"message": "Password modificata con successo"}

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Errore durante il cambio password: {str(e)}")
