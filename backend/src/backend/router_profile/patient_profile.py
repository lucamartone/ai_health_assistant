from fastapi import APIRouter, HTTPException, Response, Query
from backend.router_profile.pydantic.schemas import RegisterRequest, LoginRequest, ModifyProfileRequest, HealthDataInput
from backend.router_profile.account_profile import validate_password
from backend.connection import execute_query
from passlib.context import CryptContext
from datetime import datetime, timedelta
from backend.router_profile.cookies_login import create_access_token, create_refresh_token
import base64

router_patient_profile = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router_patient_profile.post("/register")
async def register(data: RegisterRequest):
    try:
        if not validate_password(data.password):
            raise HTTPException(
                status_code=400,
                detail="La password deve contenere almeno 8 caratteri, una lettera maiuscola, una minuscola e un numero"
            )

        check_email = """SELECT id FROM "account" WHERE email = %s"""
        if execute_query(check_email, (data.email,)):
            raise HTTPException(status_code=400, detail="Email già registrata")

        hashed_password = pwd_context.hash(data.password)

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
    try:
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

        if failed_attempts >= 5 and last_attempt:
            lockout_time = last_attempt + timedelta(minutes=15)
            if datetime.now() < lockout_time:
                raise HTTPException(
                    status_code=429,
                    detail=f"Account temporaneamente bloccato. Riprova dopo {lockout_time}"
                )

        if not pwd_context.verify(data.password, db_password):
            update_attempts = """
            UPDATE "account" 
            SET failed_attempts = failed_attempts + 1,
                last_login_attempt = CURRENT_TIMESTAMP
            WHERE email = %s
            """
            execute_query(update_attempts, (data.email,), commit=True)
            raise HTTPException(status_code=401, detail="Password errata")

        reset_attempts = """
        UPDATE "account" 
        SET failed_attempts = 0,
            last_login_attempt = CURRENT_TIMESTAMP
        WHERE email = %s
        """
        execute_query(reset_attempts, (data.email,), commit=True)

        # Codifica immagine profilo in base64
        profile_img = account[5]
        profile_img_base64 = f"data:image/png;base64,{base64.b64encode(profile_img).decode()}" if profile_img else None

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

        refresh_token = create_refresh_token({
            "sub": account[3],
            "id": account[0],
            "name": account[1],
            "surname": account[2],
            "email": account[3],
            "role": "patient",
            "phone": account[8]
        })

        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            max_age=3600,
            samesite="Strict",
            secure=True,
            path="/"
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            max_age=7 * 24 * 3600,
            samesite="Strict",
            secure=True,
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
    try:
        # Aggiorna i dati di base
        query = """
            UPDATE account
            SET name = %s,
                surname = %s,
                phone = %s
            WHERE email = %s
        """
        params = (data.name, data.surname, data.phone, data.email)
        execute_query(query, params, commit=True)

        # Aggiorna l'immagine se presente
        if data.profile_img:
            try:
                img_bytes = base64.b64decode(data.profile_img.split(",")[-1])
                query_img = "UPDATE account SET profile_img = %s WHERE email = %s"
                execute_query(query_img, (img_bytes, data.email), commit=True)
            except Exception as img_err:
                raise HTTPException(status_code=400, detail="Errore durante la decodifica dell'immagine profilo")
        else:
            try:
                query_img = "UPDATE account SET profile_img = NULL WHERE email = %s"
                execute_query(query_img, (data.email,), commit=True)
            except Exception as img_err:
                raise HTTPException(status_code=400, detail="Errore durante la rimozione dell'immagine profilo")


        return {"message": "Dati aggiornati con successo"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore durante l'aggiornamento: {str(e)}")

    try:
        query = """
        SELECT MAX(date_time) FROM appointment
        WHERE patient_id = %s AND status IN ('completed', 'booked', 'cancelled')
        """
        result = execute_query(query, (patient_id,))
        if not result or not result[0][0]:
            return {"last_visit": 'N/A'}
        return {"last_visit": result[0][0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore durante il recupero dell'ultima visita: {str(e)}")
    
@router_patient_profile.post("/update_health_data")
async def update_health_data(data: HealthDataInput):
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
async def get_health_data(patient_id: int = Query(..., gt=0, description="ID del paziente")):
    try:
        query = """
        SELECT blood_type, allergies, chronic_conditions
        FROM patient
        WHERE id = %s
        """
        result = execute_query(query, (patient_id,))
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
async def get_stats(patient_id: int = Query(..., gt=0, description="ID del paziente")):
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
        result = execute_query(query, (patient_id,))
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