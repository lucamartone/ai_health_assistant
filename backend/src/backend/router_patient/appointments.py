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
    try:
        check_query = """
        SELECT state, patient_id 
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
        SET patient_id = %s, state = 'booked'
        WHERE id = %s AND state = 'waiting' AND patient_id IS NULL
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
    try:
        check_query = """
        SELECT state, patient_id 
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
        SET patient_id = NULL, state = 'waiting'
        WHERE id = %s AND patient_id = %s AND state = 'booked'
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
    try:
        query = """
        SELECT 
            a.id,
            a.date_time,
            a.price,
            l.address,
            l.city
        FROM appointment a
        JOIN location l ON a.location_id = l.id 
        WHERE a.doctor_id = %s
          AND a.patient_id IS NULL
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


@router_appointments.get("/history")
async def get_patient_history(patient_id: int = Query(..., gt=0, description="ID del paziente")):
    try:
        query = """
        SELECT
          a.id AS appointment_id,
          a.date_time,
          a.price,
          a.state,
          l.address,
          l.city,
          d.id AS doctor_id,
          u.name AS doctor_name,
          u.surname AS doctor_surname,
          h.report,
          h.review
        FROM history h
        JOIN appointment a ON h.appointment_id = a.id
        JOIN location l ON a.location_id = l.id
        JOIN doctor d ON a.doctor_id = d.id
        JOIN account u ON d.id = u.id
        WHERE h.patient_id = %s
        ORDER BY a.date_time DESC
        """
        raw_result = execute_query(query, (patient_id,))
        columns = [
            "appointment_id", "date_time", "price", "state", "address", "city",
            "doctor_id", "doctor_name", "doctor_surname", "report", "review"
        ]
        result = [dict(zip(columns, row)) for row in raw_result]
        return {"history": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Errore nel recupero della cronologia: {str(e)}")
    

@router_appointments.get("/booked_appointments")
async def get_booked_appointment(patient_id: int = Query(..., gt=0, description="ID del paziente")):
    try:
        query =  """
            SELECT *
            FROM appointment
            WHERE state = 'booked' AND patient_id = %s
            ORDER BY date_time ASC
        """
        raw_result = execute_query(query, (patient_id,))
        return {"appointments": raw_result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Errore nel recupero dei prossimi appuntamenti: {str(e)}")