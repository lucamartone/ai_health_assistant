from fastapi import APIRouter, HTTPException
import requests
from typing import List, Dict, Any
from os import getenv

router_doctor_profile = APIRouter()
BACKEND_URL = getenv("BACKEND_URL", "http://localhost:8001")

@router_doctor_profile.post("/set_id_card")
async def set_id_card(doctor_id: str, id_card_data: str):
    """Endpoint to set the ID card for a doctor."""
    # Implement logic to save the ID card data for the doctor
    response = requests.post(
        f"{BACKEND_URL}/doctor/set_id_card",
        params={"doctor_id": doctor_id, "id_card_data": id_card_data}
    )
    if response.status_code == 200:
        return {"message": "ID card set successfully"}
    else:
        raise HTTPException(status_code=response.status_code, detail=response.text)

@router_doctor_profile.post("/set_photo")
async def set_photo(doctor_id: str, photo_data: str):
    """Endpoint to set the photo for a doctor."""
    response = requests.post(
        f"{BACKEND_URL}/doctor/set_photo",
        params={"doctor_id": doctor_id, "photo_data": photo_data}
    )
    if response.status_code == 200:
        return {"message": "Photo set successfully"}
    else:
        raise HTTPException(status_code=400, detail="Invalid input")

@router_doctor_profile.post("/set_cv")
async def set_cv(doctor_id: str, cv_data: str):
    """Endpoint to set the CV for a doctor."""
    response = requests.post(
        f"{BACKEND_URL}/doctor/set_cv",
        params={"doctor_id": doctor_id, "cv_data": cv_data}
    )
    if response.status_code == 200:
        return {"message": "CV set successfully"}
    else:
        raise HTTPException(status_code=400, detail="Invalid input")