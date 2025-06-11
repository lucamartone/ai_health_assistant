from fastapi import APIRouter, HTTPException, Query, Body
from typing import Optional
from datetime import datetime
from backend.connection import execute_query

router_appointments = APIRouter()

@router_appointments.post("/book_appointment")
async def book_appointment(
    appointment_id: int = Query(..., gt=0, description="ID of the appointment to book"),
    patient_id: int = Query(..., gt=0, description="ID of the patient booking the appointment")
):
    """Endpoint to book an appointment."""
    try:
        # First check if the appointment is still available
        check_query = """
        SELECT state, id_user 
        FROM appointment 
        WHERE id = %s
        """
        check_result = execute_query(check_query, (appointment_id,))
        
        if not check_result:
            raise HTTPException(status_code=404, detail="Appointment not found")
            
        current_state, current_user = check_result[0]
        
        if current_state != 'waiting' or current_user is not None:
            raise HTTPException(status_code=400, detail="Appointment is no longer available")

        update_query = """
        UPDATE appointment
        SET id_user = %s, state = 'booked'
        WHERE id = %s AND state = 'waiting' AND id_user IS NULL
        RETURNING id
        """
        result = execute_query(update_query, (patient_id, appointment_id), commit=True)
        
        if not result:
            raise HTTPException(status_code=400, detail="Failed to book appointment - it may have been booked by someone else")

        return {
            "message": "Appointment booked successfully",
            "appointment_id": appointment_id,
            "patient_id": patient_id,
            "status": "booked"
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error booking appointment: {str(e)}")
    
@router_appointments.post("/cancel_appointment")
async def cancel_appointment(
    appointment_id: int = Query(..., gt=0, description="ID of the appointment to cancel"),
    patient_id: int = Query(..., gt=0, description="ID of the patient who booked the appointment"),
    reason: Optional[str] = Query(None, min_length=3, max_length=500, description="Optional reason for cancellation")
):
    """Endpoint to cancel an existing booked appointment (reset to available)."""
    try:
        # First verify the appointment exists and belongs to the patient
        check_query = """
        SELECT state, id_user 
        FROM appointment 
        WHERE id = %s
        """
        check_result = execute_query(check_query, (appointment_id,))
        
        if not check_result:
            raise HTTPException(status_code=404, detail="Appointment not found")
            
        current_state, current_user = check_result[0]
        
        if current_state != 'booked' or current_user != patient_id:
            raise HTTPException(status_code=400, detail="Cannot cancel this appointment - it may not exist or you may not have permission")

        update_query = """
        UPDATE appointment
        SET id_user = NULL, state = 'waiting'
        WHERE id = %s AND id_user = %s AND state = 'booked'
        RETURNING id
        """
        result = execute_query(update_query, (appointment_id, patient_id), commit=True)
        
        if not result:
            raise HTTPException(status_code=400, detail="Failed to cancel appointment")

        return {
            "message": "Appointment canceled successfully",
            "appointment_id": appointment_id,
            "patient_id": patient_id,
            "status": "cancelled",
            "reason": reason
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error canceling appointment: {str(e)}")

@router_appointments.get("/get_free_slots")
async def get_free_slots(
    doctor_id: int = Query(..., gt=0, description="ID of the doctor"),
    lat: float = Query(..., ge=-90, le=90, description="Latitude coordinate"),
    long: float = Query(..., ge=-180, le=180, description="Longitude coordinate"),
    start_date: Optional[datetime] = Query(None, description="Start date for filtering slots (inclusive)"),
    end_date: Optional[datetime] = Query(None, description="End date for filtering slots (inclusive)"),
    limit: Optional[int] = Query(50, ge=1, le=100, description="Maximum number of slots to return")
):
    """Endpoint to view free (not yet booked) appointments for a specific doctor at a specific location."""
    try:
        query = """
        SELECT 
            a.id,
            a.date_time,
            a.price,
            l.address,
            l.city
        FROM appointment a
        JOIN location l ON a.id_loc = l.id 
        WHERE a.id_doctor = %s
          AND a.id_user IS NULL
          AND a.state = 'waiting'
          AND l.latitude = %s
          AND l.longitude = %s
        """
        params = [doctor_id, lat, long]

        if start_date:
            query += " AND a.date_time >= %s"
            params.append(start_date)
        
        if end_date:
            query += " AND a.date_time <= %s"
            params.append(end_date)

        query += """
        ORDER BY a.date_time ASC
        LIMIT %s
        """
        params.append(limit)

        raw_result = execute_query(query, tuple(params))
        columns = ["appointment_id", "date_time", "price", "address", "city"]
        result = [dict(zip(columns, row)) for row in raw_result]
        
        if not result:
            return {"message": "No free slots found for the specified criteria", "slots": []}
            
        return {
            "message": "Free slots retrieved successfully",
            "slots": result,
            "total_slots": len(result)
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error retrieving free appointments: {str(e)}")
