"""
Gestione completa degli account utente e delle preferenze.

Questo modulo fornisce tutte le funzionalità necessarie per:
- Eliminazione sicura degli account
- Gestione delle password (cambio, reset, validazione)
- Gestione delle preferenze utente (notifiche, privacy)
- Logout con pulizia dei cookie
- Invio email di reset password
- Validazione della robustezza delle password

Il sistema implementa misure di sicurezza avanzate
e gestisce l'integrità referenziale durante le operazioni.
"""

from fastapi import APIRouter, HTTPException, Response, Depends, Query
from datetime import datetime, timedelta
from backend.connection import execute_query
from pydantic import EmailStr
from backend.router_profile.pydantic.schemas import AccountInfo, ChangePasswordRequest, PreResetRequest, ResetPasswordRequest, PreferencesPayload, DeleteRequest
from backend.router_profile.cookies_login import create_access_token, create_refresh_token, get_current_account
from backend.utils.email_service import send_password_reset_email
from passlib.context import CryptContext
import re

# Router per la gestione degli account e preferenze
router_account_profile = APIRouter()

# Contesto per la gestione delle password con bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def validate_password(password: str) -> bool:
    """
    Verifica la robustezza della password secondo standard di sicurezza.
    
    La password deve contenere:
    - Almeno 8 caratteri
    - Almeno una lettera maiuscola
    - Almeno una lettera minuscola
    - Almeno un numero
    
    Args:
        password: Password da validare
        
    Returns:
        bool: True se la password è valida, False altrimenti
    """
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
async def delete_account(data: DeleteRequest):
    """
    Endpoint per eliminare un account utente in modo sicuro.
    
    Questa funzione permette agli utenti di eliminare il proprio account
    dopo aver verificato la password. L'eliminazione avviene in ordine
    corretto per mantenere l'integrità referenziale del database.
    
    Args:
        email: Email dell'account da eliminare
        password: Password attuale per la verifica
        current_account: Account corrente autenticato
        
    Returns:
        dict: Messaggio di conferma dell'eliminazione
        
    Raises:
        HTTPException: In caso di autorizzazione insufficiente, password errata o errori
    """
    try:
        # Verifica che l'utente stia eliminando il proprio account
        if data.current_account["email"] != data.email:
            raise HTTPException(status_code=403, detail="Non autorizzato a eliminare questo account")

        # Verifica della password per confermare l'identità
        query = """SELECT password FROM "account" WHERE email = %s"""
        result = execute_query(query, (data.email,))
        
        if not result:
            raise HTTPException(status_code=404, detail="Utente non trovato")
            
        if not pwd_context.verify(data.password, result[0][0]):
            raise HTTPException(status_code=401, detail="Password non valida")

        # Recupero dell'ID dell'account per le operazioni di eliminazione
        select_id_account = """SELECT id FROM "account" WHERE email = %s"""
        res = execute_query(select_id_account, (data.email,))
        account_id = res[0][0]

        # Eliminazione in ordine corretto per mantenere l'integrità referenziale
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
    """
    Endpoint per effettuare il logout di un utente eliminando i cookie di accesso.
    
    Questa funzione rimuove in modo sicuro tutti i cookie di autenticazione
    (access_token e refresh_token) per terminare la sessione dell'utente.
    
    Args:
        response: Oggetto Response per rimuovere i cookie
        
    Returns:
        dict: Messaggio di conferma del logout
    """
    # Elimina il cookie del token di accesso
    response.delete_cookie(
        key="access_token",
        path="/",
        secure=True,
        httponly=True,
        samesite="Strict"
    )
    # Elimina il cookie del token di refresh
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
    """
    Endpoint per modificare la password di un utente.
    
    Questa funzione permette agli utenti di cambiare la propria password
    dopo aver verificato la password attuale. La nuova password viene
    validata per robustezza e poi hashata con bcrypt.
    
    Args:
        data: Oggetto ChangePasswordRequest con password attuale e nuova
        
    Returns:
        dict: Messaggio di conferma del cambio password
        
    Raises:
        HTTPException: In caso di password non valida, utente non trovato o errori
    """
    try:
        # Validazione della robustezza della nuova password
        if not validate_password(data.new_password):
            raise HTTPException(
                status_code=400,
                detail="La nuova password deve contenere almeno 8 caratteri, una lettera maiuscola, una minuscola e un numero"
            )

        # Verifica della password attuale
        query = "SELECT password FROM account WHERE email = %s"
        result = execute_query(query, (data.account_email,))
        
        if not result:
            raise HTTPException(status_code=405, detail="Utente non trovato")
            
        if not pwd_context.verify(data.old_password, result[0][0]):
            raise HTTPException(status_code=401, detail="Password attuale non valida, reinseriscila")

        # Hash e aggiornamento della nuova password
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
async def request_password_reset(data: PreResetRequest):
    """
    Endpoint per richiedere il reset della password.
    
    Questa funzione genera un token di reset temporaneo e invia
    un'email all'utente con le istruzioni per reimpostare la password.
    Per motivi di sicurezza, non rivela se l'email esiste o meno.
    
    Args:
        email: Email dell'account per cui richiedere il reset
        
    Returns:
        dict: Messaggio di conferma dell'invio dell'email
        
    Raises:
        HTTPException: In caso di errori nell'invio dell'email
    """
    try:
        # Verifica dell'esistenza dell'account
        query = "SELECT id FROM account WHERE email = %s"
        result = execute_query(query, (data.email,))
        
        if not result:
            # Non rivelare se l'email esiste o meno per motivi di sicurezza
            return {"message": "Se l'email è registrata, riceverai un link di reimpostazione."}

        # Generazione del token di reset valido per 1 ora
        reset_token = create_access_token(data={"email": data.email}, expires_delta=timedelta(hours=1))

        # Invio dell'email di reset
        email_sent = await send_password_reset_email(data.email, reset_token)

        if email_sent:
            return {"message": "Email di reset inviata con successo"}
        else:
            raise HTTPException(status_code=500, detail="Errore nell'invio dell'email")

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Errore durante la richiesta di reset password: {str(e)}")

@router_account_profile.post("/reset_password")
async def reset_password(data: ResetPasswordRequest):
    """
    Imposta una nuova password usando un token di reset valido.
    
    Questa funzione decodifica il token di reset ricevuto via email
    e permette all'utente di impostare una nuova password senza
    conoscere quella attuale.
    
    Args:
        payload: Oggetto ResetPasswordRequest con token e nuova password
        
    Returns:
        dict: Messaggio di conferma del reset password
        
    Raises:
        HTTPException: In caso di token non valido, password debole o errori
    """
    try:
        # Decodifica del token di reset
        from jose import jwt
        from backend.router_profile.cookies_login import SECRET_KEY, ALGORITHM
        data = jwt.decode(data.token, SECRET_KEY, algorithms=[ALGORITHM])
        email = data.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Token non valido")

        # Validazione della robustezza della nuova password
        if not validate_password(data.new_password):
            raise HTTPException(status_code=400, detail="La nuova password deve contenere almeno 8 caratteri, una lettera maiuscola, una minuscola e un numero")

        # Hash e aggiornamento della nuova password
        hashed = pwd_context.hash(data.new_password)
        execute_query("UPDATE account SET password = %s WHERE email = %s", (hashed, email), commit=True)
        return {"message": "Password reimpostata con successo"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Errore durante il reset password: {str(e)}")
    

@router_account_profile.get('/preferences')
async def get_preferences(data: AccountInfo = Depends()):
    """
    Recupera le preferenze dell'utente per notifiche e privacy.
    
    Questa funzione crea automaticamente la tabella delle preferenze
    se non esiste e restituisce le preferenze salvate o valori di default.
    
    Args:
        account_id: ID dell'account per cui recuperare le preferenze
        
    Returns:
        dict: Dizionario con preferenze per notifiche e privacy
        
    Raises:
        HTTPException: In caso di errori nel recupero delle preferenze
    """

    try:
        # Creazione automatica della tabella delle preferenze se non esiste
        create_table = """
            CREATE TABLE IF NOT EXISTS account_preferences (
                account_id INT PRIMARY KEY REFERENCES account(id) ON DELETE CASCADE,
                notifications JSONB,
                privacy JSONB,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        execute_query(create_table, commit=True)

        # Recupero delle preferenze esistenti o restituzione di valori di default
        res = execute_query("SELECT notifications, privacy FROM account_preferences WHERE account_id = %s", (data.account_id,))
        if not res:
            return {
                "notifications": {"reminders": True, "testResults": True, "newsletter": False}, 
                "privacy": {"shareWithDoctors": True, "publicProfile": False}
            }
        return {"notifications": res[0][0], "privacy": res[0][1]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Errore nel recupero preferenze: {str(e)}")
    

@router_account_profile.post('/preferences')
async def save_preferences(data: PreferencesPayload = None):
    """
    Salva le preferenze dell'utente per notifiche e privacy.
    
    Questa funzione crea automaticamente la tabella delle preferenze
    se non esiste e salva o aggiorna le preferenze dell'utente.
    
    Args:
        account_id: ID dell'account per cui salvare le preferenze
        payload: Oggetto PreferencesPayload con le preferenze da salvare
        
    Returns:
        dict: Messaggio di conferma del salvataggio
        
    Raises:
        HTTPException: In caso di errori nel salvataggio delle preferenze
    """
    try:
        # Creazione automatica della tabella delle preferenze se non esiste
        create_table = """
            CREATE TABLE IF NOT EXISTS account_preferences (
                account_id INT PRIMARY KEY REFERENCES account(id) ON DELETE CASCADE,
                notifications JSONB,
                privacy JSONB,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        execute_query(create_table, commit=True)

        # Upsert delle preferenze (inserimento o aggiornamento)
        upsert = """
            INSERT INTO account_preferences(account_id, notifications, privacy, updated_at)
            VALUES (%s, %s, %s, CURRENT_TIMESTAMP)
            ON CONFLICT (account_id) DO UPDATE SET
                notifications = EXCLUDED.notifications,
                privacy = EXCLUDED.privacy,
                updated_at = CURRENT_TIMESTAMP
        """
        execute_query(upsert, (data.account_id, data.notifications, data.privacy), commit=True)
        return {"message": "Preferenze salvate con successo"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Errore nel salvataggio preferenze: {str(e)}")