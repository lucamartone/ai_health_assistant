from fastapi import APIRouter, HTTPException, Query, Response
from backend.router_profile.pydantic.profile_requests import RegisterDoctorRequest, LoginRequest
from backend.router_profile.account_profile import validate_password
from backend.connection import execute_query
from passlib.context import CryptContext
from datetime import datetime, timedelta
from backend.router_profile.cookies_login import create_access_token, create_refresh_token

router_doctor_profile = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router_doctor_profile.post("/set_id_card") #not implemented
async def set_id_card(doctor_id: str, id_card_data: str):
    """Endpoint to set the ID card for a doctor."""
    # Implement logic to save the ID card data for the doctor

    if doctor_id and id_card_data:
        return {"message": "ID card set successfully"}
    else:
        raise HTTPException(status_code=400, detail="Invalid input")

@router_doctor_profile.post("/set_photo") #not implemented
async def set_photo(doctor_id: str, photo_data: str):
    """Endpoint to set the photo for a doctor."""
    # Implement logic to save the photo data for the doctor


    if doctor_id and photo_data:
        return {"message": "Photo set successfully"}
    else:
        raise HTTPException(status_code=400, detail="Invalid input")

@router_doctor_profile.post("/set_cv") #not implemented
async def set_cv(doctor_id: str, cv_data: str):
    """Endpoint to set the CV for a doctor."""
    # Implement logic to save the CV data for the doctor


    if doctor_id and cv_data:
        return {"message": "CV set successfully"}
    else:
        raise HTTPException(status_code=400, detail="Invalid input")

@router_doctor_profile.post("/register")
async def register(data: RegisterDoctorRequest):
    """Endpoint per registrare un nuovo dottore."""
    try:
        # Validate password strength
        if not validate_password(data.password):
            raise HTTPException(
                status_code=400,
                detail="La password deve contenere almeno 8 caratteri, una lettera maiuscola, una minuscola e un numero"
            )

        # Check if email already exists
        check_email = """SELECT id FROM account WHERE email = %s"""
        if execute_query(check_email, (data.email,)):
            raise HTTPException(status_code=400, detail="Email già registrata")

        # Hash password
        hashed_password = pwd_context.hash(data.password)

        reg_query = """
        INSERT INTO account (
            name, surname, email, password, sex,
            created_at, last_login_attempt, failed_attempts
        ) VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP, NULL, 0)
        RETURNING id
        """
        
        params = (data.name, data.surname, data.email, hashed_password, data.sex)
        result = execute_query(reg_query, params, commit=True)

        if not result or not result[0]:
            raise HTTPException(status_code=500, detail="Errore durante la creazione dell'utente")
        id_doctor = result[0][0]

        reg_query = """
        INSERT INTO doctor (
            id, specialization
        ) VALUES (%s, %s)
        """

        params = (id_doctor, data.specialization)
        execute_query(reg_query, params, commit=True)

        reg_query = """
        INSERT INTO location (
            doctor_id, address, latitude, longitude
        ) VALUES (%s, %s, %s, %s)
        """

        for loc in data.locations:
            params = (id_doctor, loc.address, loc.latitude, loc.longitude)
            execute_query(reg_query, params, commit=True)

    
        return {
            "message": "Registrazione completata con successo",
            "account_id": id_doctor
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Errore nella registrazione: {str(e)}")

@router_doctor_profile.post("/login")
async def login(data: LoginRequest, response: Response):
    """Endpoint per autenticare un utente e creare una sessione con refresh token."""
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
        
        # Create tokens
        access_token = create_access_token({
            "sub": account[3],
            "id": account[0],
            "name": account[1],
            "surname": account[2],
            "role": "doctor"
        })
        
        refresh_token = create_refresh_token({
            "sub": account[3],
            "id": account[0],
            "name": account[1],
            "surname": account[2],
            "role": "doctor"
        })

        # Set access token cookie (short-lived)
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            max_age=60 * 60,  # 1 ora
            samesite="Strict",  # Più sicuro di Lax
            secure=True,  # True per HTTPS
            path="/"
        )

        # Set refresh token cookie (long-lived)
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            max_age=7 * 24 * 60 * 60,  # 7 giorni
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
                "role": "doctor"
            }
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore server: {str(e)}")

@router_doctor_profile.get("/appointments")
async def get_doctor_appointments(doctor_id: int = Query(..., gt=0, description="ID del dottore")):
    """Restituisce tutti gli appuntamenti del dottore (futuri e passati)."""
    try:
        query = """
        SELECT
          a.id AS appointment_id,
          a.date_time,
          a.price,
          a.state,
          l.address,
          l.city,
          p.id AS patient_id,
          u.name AS patient_name,
          u.surname AS patient_surname
        FROM appointment a
        JOIN location l ON a.location_id = l.id
        LEFT JOIN patient p ON a.patient_id = p.id
        LEFT JOIN account u ON p.id = u.id
        WHERE a.doctor_id = %s
        ORDER BY a.date_time DESC
        """
        raw_result = execute_query(query, (doctor_id,))
        columns = [
            "appointment_id", "date_time", "price", "state", "address", "city",
            "patient_id", "patient_name", "patient_surname"
        ]
        result = [dict(zip(columns, row)) for row in raw_result]
        return {"appointments": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Errore nel recupero appuntamenti: {str(e)}")