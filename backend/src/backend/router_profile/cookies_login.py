"""
Sistema di gestione dei cookie e token JWT per l'autenticazione.

Questo modulo fornisce tutte le funzionalità necessarie per:
- Creazione e gestione di token JWT (access e refresh)
- Autenticazione basata su cookie sicuri
- Recupero informazioni dell'utente corrente
- Refresh automatico dei token di accesso
- Gestione sicura delle sessioni utente

Il sistema utilizza cookie HttpOnly per massima sicurezza
e implementa token con scadenze differenziate per accesso e refresh.
"""

from jose import jwt, JWTError, ExpiredSignatureError
from datetime import datetime, timedelta
from fastapi import Depends, Cookie, APIRouter, HTTPException, Response
import os
import base64
from typing import Optional
from dotenv import load_dotenv
from backend.connection import execute_query

# Carica le variabili d'ambiente dal file .env
load_dotenv()

# Carica le chiavi JWT dalle variabili d'ambiente
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
REFRESH_SECRET_KEY = os.getenv("JWT_REFRESH_SECRET_KEY")

# Verifica che le chiavi JWT siano definite
if not SECRET_KEY or not REFRESH_SECRET_KEY:
    raise ValueError("Le chiavi JWT_SECRET_KEY e JWT_REFRESH_SECRET_KEY devono essere definite nel file .env")

# Configurazione per i token JWT
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60      # Token di accesso valido per 1 ora
REFRESH_TOKEN_EXPIRE_DAYS = 7         # Token di refresh valido per 7 giorni

def create_access_token(data: dict) -> str:
    """
    Crea un token JWT di accesso con scadenza breve.
    
    Args:
        data: Dizionario contenente i dati da includere nel token
        
    Returns:
        str: Token JWT codificato con scadenza di 1 ora
    """
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    data.update({"exp": expire})
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict) -> str:
    """
    Crea un token JWT di refresh con scadenza lunga.
    
    Args:
        data: Dizionario contenente i dati da includere nel token
        
    Returns:
        str: Token JWT codificato con scadenza di 7 giorni
    """
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    data.update({"exp": expire})
    return jwt.encode(data, REFRESH_SECRET_KEY, algorithm=ALGORITHM)

# Router per la gestione dei cookie e token
router_cookies_login = APIRouter()

def get_current_account(access_token: str = Cookie(None)) -> dict:
    """
    Funzione di dipendenza per recuperare l'account corrente dal token JWT.
    
    Questa funzione decodifica il token JWT dal cookie e recupera
    le informazioni complete dell'account dal database, includendo
    specializzazione e indirizzi per i dottori.
    
    Args:
        access_token: Token JWT estratto dal cookie
        
    Returns:
        dict: Dizionario con tutte le informazioni dell'account
        
    Raises:
        HTTPException: In caso di token mancante, scaduto, non valido o account non trovato
    """
    if not access_token:
        raise HTTPException(status_code=401, detail="Token mancante")

    try:
        # Decodifica del token JWT
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("id")
        if not user_id:
            raise HTTPException(status_code=403, detail="Token non valido: id mancante")

        # Recupero informazioni base dell'account
        q_acc = """
            SELECT id, email, name, surname, phone, role, birth_date, sex
            FROM account
            WHERE id = %s
        """
        ra = execute_query(q_acc, (user_id,))
        if not ra:
            raise HTTPException(status_code=404, detail="Account non trovato")

        id_, email, name, surname, phone, role, birth_date, sex = ra[0]

        # Inizializzazione variabili per informazioni specifiche del ruolo
        specialization = None
        addresses = []

        if role == "doctor":
            # Recupero specializzazione per i dottori
            rd = execute_query("SELECT specialization FROM doctor WHERE id = %s", (id_,))
            specialization = rd[0][0] if rd else None

            # Recupero indirizzi delle sedi per i dottori
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

        # Costruzione della risposta completa con tutte le informazioni
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
    Endpoint per ottenere i dati completi dell'utente corrente.
    
    Questa funzione recupera l'immagine del profilo dal database
    e restituisce tutte le informazioni dell'account autenticato,
    inclusa l'immagine convertita in base64.
    
    Args:
        account: Account corrente ottenuto dalla dipendenza get_current_account
        
    Returns:
        dict: Dizionario con informazioni complete dell'account inclusa l'immagine
        
    Raises:
        HTTPException: In caso di errori durante la lettura del profilo
    """
    try:
        # Recupero dell'immagine del profilo dal database
        query = "SELECT profile_img FROM account WHERE id = %s"
        result = execute_query(query, (account["id"],))

        # Conversione dell'immagine in base64 se presente
        profile_img_base64 = None
        if result and result[0] and result[0][0]:
            raw_img = result[0][0]
            profile_img_base64 = f"data:image/png;base64,{base64.b64encode(raw_img).decode()}"

        # Restituzione dell'account arricchito con l'immagine del profilo
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
    """
    Endpoint per il refresh del token di accesso.
    
    Questa funzione utilizza il refresh token per generare
    un nuovo token di accesso senza richiedere nuovamente
    le credenziali dell'utente.
    
    Args:
        refresh_token: Token di refresh estratto dal cookie
        
    Returns:
        dict: Dizionario contenente il nuovo token di accesso
        
    Raises:
        HTTPException: In caso di refresh token mancante, scaduto o non valido
    """
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token mancante")
    
    try:
        # Decodifica del refresh token
        payload = jwt.decode(refresh_token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        
        # Creazione di un nuovo token di accesso
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
