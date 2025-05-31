from fastapi import APIRouter, HTTPException

user_profile_router = APIRouter()

@user_profile_router.post("/login")
async def login(username: str, password: str):
    """Endpoint to log in a user."""
    # Implement login logic here


    if username == "test" and password == "password":
        return {"message": "Login successful"}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@user_profile_router.post("/register")
async def register(username: str, password: str):
    """Endpoint to register a new user."""
    # Implement registration logic here


    if username and password:
        return {"message": "Registration successful"}
    else:
        raise HTTPException(status_code=400, detail="Invalid input")

@user_profile_router.post("/logout")
async def logout():
    """Endpoint to log out a user."""
    # Implement logout logic here
    
    return {"message": "Logout successful"}

@user_profile_router.delete("/delete_account")
async def delete_account(username: str):
    """Endpoint to delete a user account."""
    # Implement account deletion logic here


    if username:
        return {"message": "Account deleted successfully"}
    else:
        raise HTTPException(status_code=400, detail="Invalid username")


@user_profile_router.post("/change_password")
async def change_password(username: str, old_password: str, new_password: str):
    """Endpoint to change a user's password."""
    # Implement password change logic here


    if username and old_password and new_password:
        return {"message": "Password changed successfully"}
    else:
        raise HTTPException(status_code=400, detail="Invalid input")