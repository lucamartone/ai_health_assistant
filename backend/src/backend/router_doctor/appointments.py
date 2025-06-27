from fastapi import APIRouter, HTTPException, Query, Body
from typing import Optional
from datetime import datetime
from backend.connection import execute_query

router_appointments = APIRouter()

@router_appointments.get("/get_appointments")
def get_appointments(doctor_id: int = Query(..., gt=0, description="ID of the doctor")):
    """Recupera gli appuntamenti futuri di un dottore specifico."""
    try:
        query = """
        SELECT id, doctor_id, patient_id, location_id, date_time, price, state
        FROM appointment
        WHERE doctor_id = %s AND date_time >= NOW()
        ORDER BY date_time ASC
        """
        params = (doctor_id,)
        raw_result = execute_query(query, params)

        # Colonne da associare ai valori di ogni riga
        columns = ["id", "doctor_id", "patient_id", "location_id", "date_time", "price", "state"]
        appointments = [dict(zip(columns, row)) for row in raw_result]

        return {"appointments": appointments}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving appointments: {str(e)}")

