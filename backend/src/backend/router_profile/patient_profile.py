"""
Gestione completa dei profili dei pazienti.

Questo modulo fornisce tutte le funzionalità necessarie per:
- Registrazione di nuovi pazienti
- Login e autenticazione dei pazienti
- Modifica del profilo e immagine
- Gestione dei dati sanitari (gruppo sanguigno, allergie, condizioni croniche)
- Recupero statistiche e cronologia visite
- Gestione sicura delle sessioni con token JWT

Il sistema implementa misure di sicurezza avanzate
incluso il blocco temporaneo degli account dopo tentativi falliti.
"""

from fastapi import APIRouter, Depends, HTTPException, Response
from backend.router_profile.pydantic.schemas import RegisterRequest, LoginRequest, ModifyProfileRequest, HealthDataInput, PatientInfoRequest
from backend.router_profile.account_profile import validate_password
from backend.connection import execute_query
from passlib.context import CryptContext
from datetime import datetime, timedelta
from backend.router_profile.cookies_login import create_access_token, create_refresh_token
import base64

# Router per la gestione dei profili paziente
router_patient_profile = APIRouter()

# Contesto per la gestione delle password con bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router_patient_profile.post("/register")
async def register(data: RegisterRequest):
    """
    Endpoint per la registrazione di nuovi pazienti.
    
    Questa funzione crea un nuovo account paziente nel sistema,
    validando la password e verificando l'unicità dell'email.
    Crea sia l'account base che il profilo paziente specifico.
    
    Args:
        data: Oggetto RegisterRequest con i dati del nuovo paziente
        
    Returns:
        dict: Messaggio di conferma e ID dell'account creato
        
    Raises:
        HTTPException: In caso di password debole, email duplicata o errori
    """
    try:
        # Validazione della robustezza della password
        if not validate_password(data.password):
            raise HTTPException(
                status_code=400,
                detail="La password deve contenere almeno 8 caratteri, una lettera maiuscola, una minuscola e un numero"
            )

        # Verifica che l'email non sia già registrata
        check_email = """SELECT id FROM "account" WHERE email = %s"""
        if execute_query(check_email, (data.email,)):
            raise HTTPException(status_code=400, detail="Email già registrata")

        # Hash della password per la sicurezza
        hashed_password = pwd_context.hash(data.password)

        # Inserimento dell'account base
        reg_query = """
        INSERT INTO account (
            name, surname, email, password, sex, birth_date, role,
            created_at, last_login_attempt, failed_attempts
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP, NULL, 0)
        RETURNING id
        """
        params = (data.name, data.surname, data.email, hashed_password, data.sex, data.birth_date, "patient")
        result = execute_query(reg_query, params, commit=True)

        if not result or not result[0]:
            raise HTTPException(status_code=500, detail="Errore durante la creazione dell'utente")
        id_patient = result[0][0]

        # Creazione del profilo paziente specifico
        reg_query = """INSERT INTO patient (id) VALUES (%s)"""
        execute_query(reg_query, (id_patient,), commit=True)

        return {
            "message": "Registrazione completata con successo",
            "account_id": id_patient
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Errore nella registrazione: {str(e)}")

@router_patient_profile.post("/login")
async def login(data: LoginRequest, response: Response):
    """
    Endpoint per il login dei pazienti.
    
    Questa funzione gestisce l'autenticazione completa dei pazienti:
    1. Verifica dell'esistenza dell'account
    2. Controllo del lockout temporaneo
    3. Verifica della password
    4. Reset dei tentativi falliti
    5. Creazione e impostazione dei token JWT
    6. Impostazione dei cookie sicuri
    
    Args:
        data: Oggetto LoginRequest con email e password
        response: Oggetto Response per impostare i cookie
        
    Returns:
        dict: Messaggio di conferma e informazioni complete dell'account
        
    Raises:
        HTTPException: In caso di account non trovato, bloccato, password errata o errori
    """
    try:
        # Recupero informazioni complete dell'account paziente
        query = """
        SELECT account.id, name, surname, email, password, profile_img, last_login_attempt, failed_attempts, phone, birth_date, sex
        FROM account JOIN patient ON account.id = patient.id
        WHERE email = %s
        """
        results = execute_query(query, (data.email,))

        if not results:
            raise HTTPException(status_code=404, detail="Account non registrato")

        account = results[0]
        db_password = account[4]
        last_attempt = account[6]
        failed_attempts = account[7] or 0

        # Controllo del lockout temporaneo (15 minuti dopo 5 tentativi falliti)
        if failed_attempts >= 5 and last_attempt:
            lockout_time = last_attempt + timedelta(minutes=15)
            if datetime.now() < lockout_time:
                raise HTTPException(
                    status_code=429,
                    detail=f"Account temporaneamente bloccato. Riprova dopo {lockout_time}"
                )

        # Verifica della password
        if not pwd_context.verify(data.password, db_password):
            # Incrementa i tentativi falliti e aggiorna il timestamp
            update_attempts = """
            UPDATE "account" 
            SET failed_attempts = failed_attempts + 1,
                last_login_attempt = CURRENT_TIMESTAMP
            WHERE email = %s
            """
            execute_query(update_attempts, (data.email,), commit=True)
            raise HTTPException(status_code=401, detail="Password errata")

        # Reset dei tentativi falliti dopo login riuscito
        reset_attempts = """
        UPDATE "account" 
        SET failed_attempts = 0,
            last_login_attempt = CURRENT_TIMESTAMP
        WHERE email = %s
        """
        execute_query(reset_attempts, (data.email,), commit=True)

        # Conversione dell'immagine profilo in base64 per il frontend
        profile_img = account[5]
        profile_img_base64 = f"data:image/png;base64,{base64.b64encode(profile_img).decode()}" if profile_img else None

        # Creazione del token di accesso con informazioni complete
        access_token = create_access_token({
            "sub": account[3],
            "id": account[0],
            "name": account[1],
            "surname": account[2],
            "email": account[3],
            "role": "patient",
            "phone": account[8],
            "birth_date": account[9].isoformat() if account[9] else None,
            "sex": account[10]
        })

        # Creazione del token di refresh
        refresh_token = create_refresh_token({
            "sub": account[3],
            "id": account[0],
            "name": account[1],
            "surname": account[2],
            "email": account[3],
            "role": "patient",
            "phone": account[8]
        })

        # Impostazione dei cookie sicuri per l'autenticazione
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,           # Previene accesso JavaScript
            max_age=3600,            # Scadenza 1 ora
            samesite="Strict",       # Protezione CSRF
            secure=True,              # Richiede HTTPS
            path="/"
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,           # Previene accesso JavaScript
            max_age=7 * 24 * 3600,  # Scadenza 7 giorni
            samesite="Strict",       # Protezione CSRF
            secure=True,              # Richiede HTTPS
            path="/"
        )

        # Risposta con informazioni complete dell'account
        return {
            "message": "Login riuscito",
            "account": {
                "id": account[0],
                "name": account[1],
                "surname": account[2],
                "email": account[3],
                "profile_img": profile_img_base64,
                "phone": account[8],
                "birth_date": account[9].isoformat() if account[9] else None,
                "sex": account[10],
                "role": "patient"
            }
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore server: {str(e)}")

@router_patient_profile.post("/edit_profile")
async def edit_profile(data: ModifyProfileRequest):
    """
    Endpoint per la modifica del profilo paziente.
    
    Questa funzione permette ai pazienti di aggiornare:
    - Nome e cognome
    - Numero di telefono
    - Immagine del profilo (con conversione base64)
    
    Args:
        data: Oggetto ModifyProfileRequest con i dati da aggiornare
        
    Returns:
        dict: Messaggio di conferma dell'aggiornamento
        
    Raises:
        HTTPException: In caso di errori durante l'aggiornamento
    """
    try:
        # Aggiornamento dei dati di base (nome, cognome, telefono)
        query = """
            UPDATE account
            SET name = %s,
                surname = %s,
                phone = %s
            WHERE email = %s
        """
        params = (data.name, data.surname, data.phone, data.email)
        execute_query(query, params, commit=True)

        # Gestione dell'immagine del profilo se presente
        if data.profile_img:
            try:
                # Decodifica dell'immagine da base64 a bytes
                img_bytes = base64.b64decode(data.profile_img.split(",")[-1])
                query_img = "UPDATE account SET profile_img = %s WHERE email = %s"
                execute_query(query_img, (img_bytes, data.email), commit=True)
            except Exception as img_err:
                raise HTTPException(status_code=400, detail="Errore durante la decodifica dell'immagine profilo")
        else:
            try:
                # Rimozione dell'immagine profilo se non fornita
                query_img = "UPDATE account SET profile_img = NULL WHERE email = %s"
                execute_query(query_img, (data.email,), commit=True)
            except Exception as img_err:
                raise HTTPException(status_code=400, detail="Errore durante la rimozione dell'immagine profilo")

        return {"message": "Dati aggiornati con successo"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore durante l'aggiornamento: {str(e)}")

@router_patient_profile.get("/get_last_visit")
async def get_last_visit(data: PatientInfoRequest = Depends()):
    """
    Recupera la data dell'ultima visita del paziente.
    
    Questa funzione cerca l'ultimo appuntamento completato,
    prenotato o cancellato per determinare quando il paziente
    è stato visto l'ultima volta.
    
    Args:
        patient_id: ID del paziente per cui recuperare l'ultima visita
        
    Returns:
        dict: Dizionario con la data dell'ultima visita o 'N/A'
        
    Raises:
        HTTPException: In caso di errori durante il recupero
    """
    try:
        query = """
        SELECT MAX(date_time) FROM appointment
        WHERE patient_id = %s AND status IN ('completed', 'booked', 'cancelled')
        """
        result = execute_query(query, (data.patient_id,))
        if not result or not result[0][0]:
            return {"last_visit": 'N/A'}
        return {"last_visit": result[0][0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore durante il recupero dell'ultima visita: {str(e)}")
    
    
@router_patient_profile.post("/update_health_data")
async def update_health_data(data: HealthDataInput):
    """
    Aggiorna i dati sanitari di un paziente.
    
    Questa funzione permette di inserire o aggiornare:
    - Gruppo sanguigno
    - Allergie
    - Condizioni croniche
    
    Utilizza UPSERT per gestire sia inserimenti che aggiornamenti.
    
    Args:
        data: Oggetto HealthDataInput con i dati sanitari da aggiornare
        
    Returns:
        dict: Messaggio di conferma dell'aggiornamento
        
    Raises:
        HTTPException: In caso di errori durante l'aggiornamento
    """
    try:
        query = """
        INSERT INTO patient (id, blood_type, allergies, chronic_conditions)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (id) DO UPDATE
        SET blood_type = EXCLUDED.blood_type,
            allergies = EXCLUDED.allergies,
            chronic_conditions = EXCLUDED.chronic_conditions
        """
        execute_query(query, (
            data.patient_id,
            data.blood_type,
            data.allergies,
            data.chronic_conditions
        ), commit=True)

        return {"message": "Dati sanitari aggiornati con successo"}

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Errore durante l'aggiornamento dei dati sanitari: {str(e)}"
        )
    
@router_patient_profile.get("/get_health_data")
async def get_health_data(data: PatientInfoRequest = Depends()):
    """
    Recupera i dati sanitari di un paziente.
    
    Questa funzione restituisce tutte le informazioni sanitarie
    memorizzate per un paziente specifico.
    
    Args:
        patient_id: ID del paziente per cui recuperare i dati sanitari
        
    Returns:
        dict: Dizionario con gruppo sanguigno, allergie e condizioni croniche
        
    Raises:
        HTTPException: In caso di dati non trovati o errori
    """
    try:
        query = """
        SELECT blood_type, allergies, chronic_conditions
        FROM patient
        WHERE id = %s
        """
        result = execute_query(query, (data.patient_id,))
        if not result:
            raise HTTPException(status_code=404, detail="Dati sanitari non trovati")
        
        health_data = result[0]
        return {
            "blood_type": health_data[0],
            "allergies": health_data[1],
            "chronic_conditions": health_data[2]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore durante il recupero dei dati sanitari: {str(e)}")
    


@router_patient_profile.get("/get_stats")
async def get_stats(data: PatientInfoRequest = Depends()):
    """
    Recupera le statistiche complete di un paziente.
    
    Questa funzione fornisce un riepilogo completo dell'attività
    medica del paziente, inclusi conteggi di appuntamenti e
    informazioni sui dottori visitati.
    
    Args:
        patient_id: ID del paziente per cui recuperare le statistiche
        
    Returns:
        dict: Dizionario con tutte le statistiche dell'attività medica
        
    Raises:
        HTTPException: In caso di errori durante il recupero delle statistiche
    """
    try:
        query = """
            SELECT 
                COUNT(*) AS total_appointments,
                COUNT(*) FILTER (WHERE status = 'booked') AS pending_appointments,
                COUNT(*) FILTER (WHERE status = 'completed') AS completed_appointments,
                COUNT(DISTINCT doctor_id) AS doctors_visited,
                MAX(date_time) FILTER (WHERE status = 'completed') AS last_completed_visit
            FROM appointment
            WHERE patient_id = %s;
        """
        result = execute_query(query, (data.patient_id,))
        if not result:
            return {
                "total_appointments": 0,
                "completed_appointments": 0,
                "upcoming_appointments": 0,
                "doctors_visited": 0,
                "last_visit": None
            }
        
        stats = result[0]
        return {
            "total_appointments": stats[0],
            "upcoming_appointments": stats[1],
            "completed_appointments": stats[2],
            "doctors_visited": stats[3],
            "last_visit": stats[4] or "N/A"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore durante il recupero delle statistiche: {str(e)}")