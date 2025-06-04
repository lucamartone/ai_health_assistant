from fastapi import APIRouter, HTTPException
import requests
from typing import List, Dict, Any
from os import getenv

BACKEND_URL = getenv("BACKEND_URL", "http://localhost:8001")
router_database = APIRouter()

router_database.get("/doctors_by_location")
async def get_doctors_by_location(latitude: float, longitude: float) -> List[Dict[str, Any]]:
    """Endpoint to get doctors ordered by location."""
    response = requests.get(
        f"{BACKEND_URL}/database/doctors_by_location",
        params={"latitude": latitude, "longitude": longitude}
    )
    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail=response.text)

router_database.get("/doctors_by_prezzo")
async def get_doctors_by_prezzo(prezzo: float) -> List[Dict[str, Any]]:
    """Endpoint to get doctors ordered by price."""
    response = requests.get(
        f"{BACKEND_URL}/database/doctors_by_price",
        params={"price": prezzo}
    )
    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail=response.text)
    
router_database.get("/doctors_by_availability")
async def get_doctors_by_availability(date: str) -> List[Dict[str, Any]]:
    """Endpoint to get doctors ordered by availability."""
    response = requests.get(
        f"{BACKEND_URL}/database/doctors_by_availability",
        params={"date": date}
    )
    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail=response.text)