from fastapi import APIRouter, HTTPException
import requests
from typing import List, Dict, Any
from os import getenv

router_generic_profile = APIRouter()
BACKEND_URL = getenv("BACKEND_URL", "http://localhost:8001")

@router_generic_profile.post("/login")
async def login(username: str, password: str):
    """Endpoint to log in a user."""
    # Implement login logic here
    response = requests.post(
        f"{BACKEND_URL}/generic/login",
        params={"username": username, "password": password}
    )

    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@router_generic_profile.post("/register")
async def register(username: str, password: str):
    """Endpoint to register a new user."""
    # Implement registration logic here
    response = requests.post(
        f"{BACKEND_URL}/generic/register",
        params={"username": username, "password": password}
    )
    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=400, detail="Invalid input")

@router_generic_profile.post("/logout")
async def logout():
    """Endpoint to log out a user."""
    # Implement logout logic here
    response = requests.post(f"{BACKEND_URL}/generic/logout")
    if response.status_code == 200:
        return {"message": "Logout successful"}
    else:
        raise HTTPException(status_code=500, detail="Logout failed")

@router_generic_profile.post("/delete_account")
async def delete_account(username: str):
    """Endpoint to delete a user account."""
    # Implement account deletion logic here
    response = requests.post(
        f"{BACKEND_URL}/generic/delete_account",
        params={"username": username}
    )
    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=400, detail="Invalid username")

@router_generic_profile.post("/change_password")
async def change_password(username: str, old_password: str, new_password: str):
    """Endpoint to change a user's password."""
    # Implement password change logic here
    response = requests.post(
        f"{BACKEND_URL}/generic/change_password",
        params={
            "username": username,
            "old_password": old_password,
            "new_password": new_password
        }
    )
    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=400, detail="Invalid input")
