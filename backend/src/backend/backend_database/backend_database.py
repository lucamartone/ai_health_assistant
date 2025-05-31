from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any

router_database = APIRouter()

@router_database.get("/doctors_by_location")
async def get_doctors_by_location(latitude: float, longitude: float) -> list:
    """Endpoint to get doctors ordered by location."""
    # Implement logic to retrieve and order doctors by geolocation


    # This is a placeholder implementation
    if latitude and longitude:
        return [{"doctor_id": "1", "name": "Dr. Smith", "location": (latitude, longitude)}]
    else:
        raise HTTPException(status_code=400, detail="Invalid location data")

@router_database.get("/doctors_by_price")
async def get_doctors_by_price(price: float) -> list:
    """Endpoint to get doctors ordered by price."""
    # Implement logic to retrieve and order doctors by price


    # This is a placeholder implementation
    if price >= 0:
        return [{"doctor_id": "1", "name": "Dr. Smith", "price": price}]
    else:
        raise HTTPException(status_code=400, detail="Invalid price data")