from fastapi import APIRouter, HTTPException, Query, Body
from typing import Optional
from datetime import datetime
from backend.connection import execute_query

router_appointments = APIRouter()

@router_appointments.post("/get_appointments")
def get_appointments(doctor_id: int = Query(..., gt=0, description="ID of the patient booking the appointment")):
    try:
        query = """
        SELECT id, doctor_id, patient_id, date_time, state
        FROM appointment
        WHERE doctor_id = %s AND date_time >= NOW()
        ORDER BY date_time ASC
        """
        params = (doctor_id,)
        appointments = execute_query(query, params)
        
        if not appointments:
            return {"message": "No appointments found"}

        return {"appointments": appointments}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving appointments: {str(e)}")