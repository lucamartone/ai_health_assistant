from fastapi import APIRouter, HTTPException
from backend.router_profile.pydantic.profile_requests import RegisterRequest
from backend.router_profile.account_profile import validate_password
from backend.connection import execute_query
from passlib.context import CryptContext

router_patient_profile = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router_patient_profile.post("/register") 
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
        check_email = """SELECT id FROM "account" WHERE email = %s"""
        if execute_query(check_email, (data.email,)):
            raise HTTPException(status_code=400, detail="Email già registrata")

        # Hash password
        hashed_password = pwd_context.hash(data.password)

        reg_query = """
        INSERT INTO "account" (
            name, surname, email, password, sex,
            created_at, last_login_attempt, failed_attempts
        ) VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP, NULL, 0)
        RETURNING id
        """
        
        params = (data.name, data.surname, data.email, hashed_password, data.sex)
        result = execute_query(reg_query, params, commit=True)

        if not result or not result[0]:
            raise HTTPException(status_code=500, detail="Errore durante la creazione dell'utente")
        id_patient = result[0][0]

        reg_query = """
        INSERT INTO "patient" (account_id)
        VALUES (%s)
        """
        params = (id_patient,)
        execute_query(reg_query, params, commit=True)

        return {
            "message": "Registrazione completata con successo",
            "account_id": id_patient
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Errore nella registrazione: {str(e)}")


    """Endpoint to book an appointment with a doctor."""
    # Implement logic to book the appointment
    if doctor_id <= 0 or not date or not time:
        raise HTTPException(status_code=400, detail="Invalid input for booking appointment")
    
    # Example response
    return {"message": f"Appointment booked with doctor {doctor_id} on {date} at {time}."}