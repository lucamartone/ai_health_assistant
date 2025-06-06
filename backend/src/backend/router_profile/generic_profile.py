from fastapi import APIRouter, HTTPException
from backend.connection import execute_query
from pydantic import EmailStr
from backend.router_profile.pydantic.profile_requests import LoginRequest, RegisterRequest

router_generic_profile = APIRouter()

@router_generic_profile.post("/login")
async def login(data: LoginRequest):
    try:
        query = "SELECT id, name, surname, email, password FROM user WHERE email = %s"
        results = execute_query(query, (data.email,))

        if not results:
            raise HTTPException(status_code=401, detail="Email non registrata")

        user = results[0]
        db_password = user[4]

        if data.password != db_password:
            raise HTTPException(status_code=401, detail="Password errata")

        return {
            "message": "Login riuscito",
            "user": {
                "id": user[0],
                "name": user[1],
                "surname": user[2],
                "email": user[3],
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore server: {str(e)}")


@router_generic_profile.post("/register") 
async def register(data: RegisterRequest):
  
    try:
        reg_query = (f"INSERT INTO user (name, surname, email, password, sex)"
                     f"VALUES (%s, %s, %s, %s, %s)"
                     )
        
        params = (data.name, data.surname, data.email, data.password, data.sex)

        execute_query(reg_query, params, True)

        return {"message": "Registrazione completata con successo"}

    except Exception as e:
        print("Errore:", e)
        raise HTTPException(status_code=400, detail="Errore nella registrazione")
    


@router_generic_profile.delete("/delete_account") 
async def delete_account(email:EmailStr):
    """Endpoint to delete a user account."""

    try:
        select_id_user = "SELECT id FROM user WHERE email = %s"
        res = execute_query(select_id_user, (email,))
        if not res:
            raise HTTPException(status_code=404, detail="Utente non trovato")
        user_id = res[0][0]

        delete_patient = "DELETE FROM patient WHERE id_patient = %s"
        delete_doctor = "DELETE FROM doctor WHERE id_doctor = %s"
        delete_user = "DELETE FROM user WHERE id = %s"

        execute_query(delete_patient, (user_id,), commit=True)
        execute_query(delete_doctor, (user_id,), commit=True)
        execute_query(delete_user, (user_id,), commit=True)


    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid delete username")
    


    

@router_generic_profile.post("/change_password") #not implemented
async def change_password(username: str, old_password: str, new_password: str):
    """Endpoint to change a user's password."""
    # Implement password change logic here


    if username and old_password and new_password:
        return {"message": "Password changed successfully"}
    else:
        raise HTTPException(status_code=400, detail="Invalid input")