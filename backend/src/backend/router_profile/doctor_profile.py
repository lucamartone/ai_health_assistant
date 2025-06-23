from fastapi import APIRouter, HTTPException
from backend.router_profile.pydantic.profile_requests import RegisterDoctorRequest
from backend.router_profile.user_profile import validate_password
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
async def register_doctor(data: RegisterDoctorRequest):
    """Endpoint per registrare un nuovo utente."""
    try:
        # Validate password strength
        if not validate_password(data.password):
            raise HTTPException(
                status_code=400,
                detail="La password deve contenere almeno 8 caratteri, una lettera maiuscola, una minuscola e un numero"
            )

        # Check if email already exists
        check_email = "SELECT id FROM user WHERE email = %s"
        if execute_query(check_email, (data.email,)):
            raise HTTPException(status_code=400, detail="Email già registrata")

        # Hash password
        hashed_password = pwd_context.hash(data.password)

        reg_query = """
        INSERT INTO user (
            name, surname, email, password, sex,
            created_at, last_login_attempt, failed_attempts
        ) VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP, NULL, 0)
        RETURNING id
        """
        
        params = (data.name, data.surname, data.email, hashed_password, data.sex)
        result = execute_query(reg_query, params, commit=False)
        execute_query("SELECT 1", commit=True)  # forza un commit finto

        if not result or not result[0]:
            raise HTTPException(status_code=500, detail="Errore durante la creazione dell'utente")
        id_doctor = result[0][0]

        reg_query = """
        INSERT INTO doctor (
            id_doctor, specialization
        ) VALUES (%s, %s)
        """

        params = (id_doctor, data.specialization)
        execute_query(reg_query, params, commit=True)

        reg_query = """
        INSERT INTO location (
            id_doctor, address
        ) VALUES (%s, %s)
        """

        for i in range(len(data.location)):
            params = (id_doctor, data.location[i])
            execute_query(reg_query, params, commit=True)
    
        return {
            "message": "Registrazione completata con successo",
            "user_id": id_doctor
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Errore nella registrazione: {str(e)}")