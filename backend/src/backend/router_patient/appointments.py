from fastapi import APIRouter, HTTPException, Query
from backend.connection import execute_query

router_appointments = APIRouter()

@router_appointments.post("/book_appointment")
async def book_appointment(appointment_id: int, patient_id: int):
    """Endpoint to book an appointment."""
    try:
        update_query = """
        UPDATE appointment
        SET id_user = %s, state = 'booked'
        WHERE id = %s
        """
        execute_query(update_query, (patient_id, appointment_id), commit=True)

        return {"message": "Appointment booked successfully", "appointment_id": appointment_id}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error booking appointment: {str(e)}")
    
@router_appointments.post("/cancel_appointment")
async def cancel_appointment(appointment_id: int, patient_id: int):
    """Endpoint to cancel an existing booked appointment (reset to available)."""
    try:
        update_query = """
        UPDATE appointment
        SET id_user = NULL, state = 'waiting'
        WHERE id = %s AND id_user = %s
        """
        execute_query(update_query, (appointment_id, patient_id), commit=True)

        return {"message": "Appointment canceled successfully", "appointment_id": appointment_id}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error canceling appointment: {str(e)}")

    
@router_appointments.get("/get_free_slots")
async def get_free_slots(doctor_id: int = Query(...), lat: float = Query(...), long: float = Query(...)):
    """Endpoint to view free (not yet booked) appointments for a specific doctor at a specific location."""
    try:
        query = """
        SELECT a.id, a.date_time
        FROM appointment a
        JOIN location l ON a.id_loc = l.id 
        WHERE a.id_doctor = %s
          AND a.id_user IS NULL
          AND a.state = 'waiting'
          AND l.latitude = %s
          AND l.longitude = %s
        ORDER BY a.date_time ASC
        """
        raw_result = execute_query(query, (doctor_id, lat, long))
        columns = ["appointment_id", "date_time"]
        result = [dict(zip(columns, row)) for row in raw_result]
        return result

    except Exception as e:
        raise HTTPException(status_code=400, detail="Error retrieving free appointments")
