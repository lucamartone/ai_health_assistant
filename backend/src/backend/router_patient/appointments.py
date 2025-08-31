from fastapi import APIRouter, HTTPException, Query, Body
from typing import Optional, List
from datetime import datetime
from backend.connection import execute_query
from backend.router_patient.pydantic.schemas import Appointment, BookAppointmentRequest


router_appointments = APIRouter()

@router_appointments.post("/book_appointment")
async def book_appointment(data: BookAppointmentRequest):
    try:
        check_query = """
        SELECT status, patient_id
        FROM appointment
        WHERE id = %s
        """
        check_result = execute_query(check_query, (data.appointment_id,))

        if not check_result:
            raise HTTPException(status_code=404, detail="Appointment not found")

        current_status, current_user = check_result[0]

        if current_status != 'waiting' or current_user is not None:
            raise HTTPException(status_code=400, detail="Appointment is no longer available")

        update_query = """
        UPDATE appointment
        SET patient_id = %s, status = 'booked'
        WHERE id = %s AND status = 'waiting' AND patient_id IS NULL
        RETURNING id
        """
        result = execute_query(update_query, (data.patient_id, data.appointment_id), commit=True)

        if not result:
            raise HTTPException(status_code=400, detail="Failed to book appointment - it may have been booked by someone else")

        return {
            "message": "Appointment booked successfully",
            "appointment_id": data.appointment_id,
            "patient_id": data.patient_id,
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
        SELECT status, patient_id 
        FROM appointment 
        WHERE id = %s
        """
        check_result = execute_query(check_query, (appointment_id,))

        if not check_result:
            raise HTTPException(status_code=404, detail="Appointment not found")

        current_status, current_user = check_result[0]

        if current_status != 'booked' or current_user != patient_id:
            raise HTTPException(status_code=400, detail="Cannot cancel this appointment - it may not exist or you may not have permission")

        update_query = """
        UPDATE appointment
        SET patient_id = NULL, status = 'waiting'
        WHERE id = %s AND patient_id = %s AND status = 'booked'
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


@router_appointments.get("/upcoming_appointments")
async def get_upcoming_appointments(patient_id: int = Query(..., gt=0, description="ID del paziente")):
    """Ottieni gli appuntamenti prossimi del paziente"""
    try:
        query = """
            SELECT
                a.id,
                a.doctor_id,
                acc.name AS doctor_name,
                acc.surname AS doctor_surname,
                d.specialization,
                l.address,
                l.city,
                a.date_time,
                a.price,
                a.status,
                a.created_at
            FROM appointment a
            JOIN doctor d ON a.doctor_id = d.id
            JOIN account acc ON d.id = acc.id
            JOIN location l ON a.location_id = l.id
            WHERE
                a.patient_id = %s
                AND a.date_time > NOW()
                AND a.status IN ('booked', 'waiting')
            ORDER BY a.date_time ASC
        """
        
        raw_result = execute_query(query, (patient_id,))
        
        appointments = [
            {
                "id": row[0],
                "doctor_id": row[1],
                "doctor_name": row[2],
                "doctor_surname": row[3],
                "specialization": row[4],
                "address": row[5],
                "city": row[6],
                "date_time": row[7].isoformat() if row[7] else None,
                "price": float(row[8]) if row[8] else 0,
                "status": row[9],
                "created_at": row[10].isoformat() if row[10] else None
            }
            for row in raw_result
        ]

        return {"appointments": appointments}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Errore nel recupero degli appuntamenti prossimi: {str(e)}")


@router_appointments.get("/past_appointments")
async def get_past_appointments(patient_id: int = Query(..., gt=0, description="ID del paziente")):
    """Ottieni gli appuntamenti passati del paziente"""
    try:
        query = """
            SELECT
                a.id,
                a.doctor_id,
                acc.name AS doctor_name,
                acc.surname AS doctor_surname,
                d.specialization,
                l.address,
                l.city,
                a.date_time,
                a.price,
                a.status,
                a.created_at,
                r.stars,
                r.report
            FROM appointment a
            JOIN doctor d ON a.doctor_id = d.id
            JOIN account acc ON d.id = acc.id
            JOIN location l ON a.location_id = l.id
            LEFT JOIN review r ON r.appointment_id = a.id
            WHERE
                a.patient_id = %s
                AND a.date_time < NOW()
                AND a.status = 'completed'
            ORDER BY a.date_time DESC
        """
        
        raw_result = execute_query(query, (patient_id,))
        
        appointments = [
            {
                "id": row[0],
                "doctor_id": row[1],
                "doctor_name": row[2],
                "doctor_surname": row[3],
                "specialization": row[4],
                "address": row[5],
                "city": row[6],
                "date_time": row[7].isoformat() if row[7] else None,
                "price": float(row[8]) if row[8] else 0,
                "status": row[9],
                "created_at": row[10].isoformat() if row[10] else None,
                "review_stars": row[11],
                "review_report": row[12],
                "has_review": row[11] is not None
            }
            for row in raw_result
        ]

        return {"appointments": appointments}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Errore nel recupero degli appuntamenti passati: {str(e)}")


@router_appointments.get("/get_patient_health_profile")
async def get_patient_health_profile(patient_id: int = Query(..., gt=0, description="ID del paziente")):
    """Ottiene il profilo sanitario completo del paziente per l'AI"""
    try:
        # Ottieni i dati di base del paziente
        query_basic = """
        SELECT 
            a.name,
            a.surname,
            a.birth_date,
            a.sex,
            p.blood_type,
            p.allergies,
            p.chronic_conditions
        FROM account a
        JOIN patient p ON a.id = p.id
        WHERE a.id = %s
        """
        
        result = execute_query(query_basic, (patient_id,))
        if not result:
            raise HTTPException(status_code=404, detail="Paziente non trovato")
        
        patient_data = result[0]
        
        # Calcola l'età
        age = None
        if patient_data[2]:  # birth_date
            from datetime import date
            today = date.today()
            birth_date = patient_data[2]
            age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        
        # Ottieni la cronologia medica recente
        query_history = """
        SELECT 
            mr.symptoms,
            mr.diagnosis,
            mr.treatment_plan,
            mr.record_date,
            d.specialization
        FROM medical_record mr
        JOIN doctor d ON mr.doctor_id = d.id
        JOIN clinical_folder cf ON mr.clinical_folder_id = cf.id
        WHERE cf.patient_id = %s
        ORDER BY mr.record_date DESC
        LIMIT 5
        """
        
        history_result = execute_query(query_history, (patient_id,))
        
        return {
            "patient_info": {
                "name": patient_data[0],
                "surname": patient_data[1],
                "age": age,
                "sex": patient_data[3],
                "blood_type": patient_data[4],
                "allergies": patient_data[5] or [],
                "chronic_conditions": patient_data[6] or []
            },
            "recent_medical_history": [
                {
                    "symptoms": row[0],
                    "diagnosis": row[1],
                    "treatment_plan": row[2],
                    "record_date": row[3].isoformat() if row[3] else None,
                    "specialization": row[4]
                }
                for row in history_result
            ],
            "total_records": len(history_result)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore nel recupero del profilo sanitario: {str(e)}")


@router_appointments.get("/get_free_slots")
async def get_free_slots(
    doctor_id: int = Query(..., gt=0, description="ID of the doctor"),
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
          AND a.status = 'waiting'
          AND a.date_time > NOW()
        """
        params = [doctor_id]

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


@router_appointments.get("/get_history")
async def history(patient_id: int = Query(..., gt=0, description="ID del paziente")):
    try:
        #query
        query = ''' SELECT
                        a.id,
                        acc.surname AS doctor_surname,
                        d.specialization,
                        l.address,
                        l.city,
                        a.date_time,
                        a.price,
                        a.status,
                        a.created_at
                    FROM appointment a
                    JOIN doctor d ON a.doctor_id = d.id
                    JOIN account acc ON d.id = acc.id
                    JOIN location l ON a.location_id = l.id
                    WHERE
                        a.date_time < NOW()
                        AND a.status = 'completed'
                        AND a.patient_id = %s
                        ORDER BY a.date_time ASC;
                '''
        #esecuzione query
        raw_result = execute_query(query, (patient_id,))
        
        appointments: List[Appointment] = [
            Appointment(
                id=row[0],
                doctor_surname=row[1],
                specialization=row[2],
                address=row[3],
                city=row[4],
                date_time=row[5],
                price=float(row[6]),
                status=row[7],
                created_at=row[8]
            )
            for row in raw_result
        ]

        return {"appointments": appointments}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Errore nel recupero degli appuntamenti: {str(e)}")
    

@router_appointments.get("/get_booked_appointments")
async def get_booked_appointment(patient_id: int = Query(..., gt=0, description="ID del paziente")):
    try:
        query =   """
            SELECT 
                a.id,
                acc.surname AS doctor_surname,
                d.specialization,
                l.address AS location_address,
                l.city,
                a.date_time,
                a.price,
                a.status,
                a.created_at
            FROM appointment a
            JOIN doctor d ON a.doctor_id = d.id
            JOIN account acc ON d.id = acc.id
            JOIN location l ON a.location_id = l.id
            WHERE a.status = 'booked' AND a.patient_id = %s
            ORDER BY a.date_time ASC
        """
        raw_result = execute_query(query, (patient_id,))
        
        appointments: List[Appointment] = [
            Appointment(
                id=row[0],
                doctor_surname=row[1],
                specialization=row[2],
                address=row[3],
                city=row[4],
                date_time=row[5],
                price=float(row[6]),
                status=row[7],
                created_at=row[8]
            )
            for row in raw_result
        ]

        return {"appointments": appointments}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Errore nel recupero dei prossimi appuntamenti: {str(e)}")