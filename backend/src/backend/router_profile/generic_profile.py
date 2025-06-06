from fastapi import APIRouter, HTTPException
from backend.connection import execute_query
from backend.router_profile.basemodels import LoginRequest

router_generic_profile = APIRouter()

@router_generic_profile.post("/login") #not implemented
async def login(data: LoginRequest):
    """Endpoint to log in a user."""
    try:
        query = "SELECT id, nome, cognome, email, password FROM utente WHERE email = ?"
        results = execute_query(query, (data.email,))

        if not results:
            raise HTTPException(status_code=401, detail="Email non registrata")

        user = results[0]
        db_password = user[4]  # 5° colonna: password

        if data.password != db_password:
            raise HTTPException(status_code=401, detail="Password errata")

        return {
            "message": "Login riuscito",
            "user": {
                "id": user[0],
                "nome": user[1],
                "cognome": user[2],
                "email": user[3],
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore server: {str(e)}")

@router_generic_profile.post("/register") #not implemented
async def register(username: str, password: str):
    """Endpoint to register a new user."""
    # Implement registration logic here


    if username and password:
        return {"message": "Registration successful"}
    else:
        raise HTTPException(status_code=400, detail="Invalid input")

@router_generic_profile.post("/logout") #not implemented
async def logout():
    """Endpoint to log out a user."""
    # Implement logout logic here
    
    return {"message": "Logout successful"}

@router_generic_profile.delete("/delete_account") #not implemented
async def delete_account(username: str):
    """Endpoint to delete a user account."""
    # Implement account deletion logic here


    if username:
        return {"message": "Account deleted successfully"}
    else:
        raise HTTPException(status_code=400, detail="Invalid username")

@router_generic_profile.post("/change_password") #not implemented
async def change_password(username: str, old_password: str, new_password: str):
    """Endpoint to change a user's password."""
    # Implement password change logic here


    if username and old_password and new_password:
        return {"message": "Password changed successfully"}
    else:
        raise HTTPException(status_code=400, detail="Invalid input")