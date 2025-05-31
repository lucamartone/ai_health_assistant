from fastapi import APIRouter, HTTPException
import requests
from typing import List, Dict, Any
from os import getenv

router_patient_profile = APIRouter()
BACKEND_URL = getenv("BACKEND_URL", "http://localhost:8001")

@router_patient_profile.get("/appointments_todo")
async def get_appointments_todo(patient_id: int):
    """Endpoint to get appointments that have to be done for a patient."""
    # Implement logic to retrieve appointments for the patient
    response = requests.get(
        f"{BACKEND_URL}/patient/appointments_todo",
        params={"patient_id": patient_id}
    )
    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail=response.text)

@router_patient_profile.post("/appointments_history")
async def get_appointments_history(patient_id: int):
    """Endpoint to get appointment history for a patient."""
    # Implement logic to retrieve appointment history for the patient
    response = requests.post(
        f"{BACKEND_URL}/patient/appointments_history",
        params={"patient_id": patient_id}
    )
    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail=response.text)

@router_patient_profile.post("/cancel_appointment")
async def cancel_appointment(appointment_id: int):
    """Endpoint to cancel an appointment."""
    # Implement logic to cancel the appointment
    response = requests.post(
        f"{BACKEND_URL}/patient/cancel_appointment",
        params={"appointment_id": appointment_id}
    )
    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail=response.text)
    
@router_patient_profile.post("/book_appointment")
async def book_appointment(doctor_id: int, date: str, time: str):
    """Endpoint to book an appointment with a doctor."""
    # Implement logic to book the appointment
    response = requests.post(
        f"{BACKEND_URL}/patient/book_appointment",
        params={"doctor_id": doctor_id, "date": date, "time": time}
    )
    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail=response.text)