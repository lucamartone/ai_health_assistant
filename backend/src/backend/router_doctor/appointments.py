from fastapi import APIRouter, HTTPException, Query, Body
from typing import Optional
from datetime import datetime
from backend.connection import execute_query

router_appointments = APIRouter()

@router_appointments.get("/get_appointments")
def get_appointments(doctor_id: int = Query(..., gt=0, description="ID of the doctor")):
    try:
        query = """
        SELECT id, doctor_id, patient_id, location_id, date_time, price, state
        FROM appointment
        WHERE doctor_id = %s AND date_time >= NOW()
        ORDER BY date_time ASC
        """
        params = (doctor_id,)
        appointments = execute_query(query, params)

        # Sempre restituisci appointments (anche vuoto)
        return {"appointments": appointments or []}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving appointments: {str(e)}")
