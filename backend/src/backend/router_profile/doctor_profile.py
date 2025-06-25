from fastapi import APIRouter, HTTPException, Query
from backend.router_profile.pydantic.profile_requests import RegisterDoctorRequest
from backend.router_profile.account_profile import validate_password
from backend.connection import execute_query
from passlib.context import CryptContext

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