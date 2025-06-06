from fastapi import APIRouter, HTTPException
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

    
@router_appointments.post("/get_free_appointment")
async def get_free_appointments(doctor_id: int):
    """Endpoint to view free (not yet booked) appointments for a specific doctor."""
    try:
        query = """
        SELECT id, date_time
        FROM appointment
        WHERE id_doctor = %s AND id_user IS NULL AND state = 'waiting'
        ORDER BY date_time ASC
        """
        result = execute_query(query, (doctor_id,))
        return result

    except Exception as e:
        raise HTTPException(status_code=400, detail="Error retrieving free appointments")