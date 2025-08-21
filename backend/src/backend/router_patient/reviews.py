from fastapi import APIRouter, HTTPException, Query
from typing import List
from backend.connection import execute_query
from backend.router_patient.pydantic.schemas import Appointment, ReviewRequest

router_reviews = APIRouter()

#appuntamenti del paziente completati ma non ancora valutati
@router_reviews.get("/appointments_to_rank")
async def get_appointments_to_rank(patient_id: int = Query(..., gt=0, description="ID del paziente")):
    try:
        #query
        query = ''' SELECT
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
                    LEFT JOIN review r ON r.appointment_id = a.id
                    WHERE
                        a.date_time < NOW()
                        AND a.status = 'completed'
                        AND r.stars IS NULL
                        AND a.patient_id = %s
                        ORDER BY a.date_time ASC;
                '''
        #esecuzione query
        raw_result = execute_query(query, (patient_id,), commit = True)
        
        appointments: List[Appointment] = [
            Appointment(
                id=row[0],
                doctor_id=row[1],
                doctor_name=row[2],
                doctor_surname=row[3],
                specialization=row[4],
                address=row[5],
                city=row[6],
                date_time=row[7],
                price=float(row[8]),
                status=row[9],
                created_at=row[10]
            )
            for row in raw_result
        ]

        return {"appointments": appointments}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Errore nel recupero degli appuntamenti da valutare: {str(e)}")

# Alias per compatibilità con il frontend
@router_reviews.get("/get_to_rank_appointments")
async def get_to_rank_appointments(id_patient: int = Query(..., gt=0, description="ID del paziente")):
    """Alias per get_appointments_to_rank per compatibilità con il frontend"""
    return await get_appointments_to_rank(id_patient)

@router_reviews.post("/review_appointment")
async def review_appointment(data: ReviewRequest):
    """Endpoint to rate an appointment."""
    try:
        # Check if the appointment exists and is completed
        query = """
            SELECT id FROM appointment WHERE id = %s AND status = 'completed'
        """
        raw_result = execute_query(query, (data.appointment_id,))
        
        if not raw_result:
            raise HTTPException(status_code=404, detail="Appointment not found or not completed.")

        # Check if review already exists
        check_review_query = """
            SELECT id FROM review WHERE appointment_id = %s
        """
        review_result = execute_query(check_review_query, (data.appointment_id,))
        
        if review_result:
            # Update existing review
            update_query = """
                UPDATE review
                SET stars = %s, report = %s
                WHERE appointment_id = %s
            """
            execute_query(update_query, (data.stars, data.report, data.appointment_id), commit=True)
        else:
            # Create new review
            insert_query = """
                INSERT INTO review (appointment_id, stars, report)
                VALUES (%s, %s, %s)
            """
            execute_query(insert_query, (data.appointment_id, data.stars, data.report), commit=True)

        return {"message": "Review submitted successfully."}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error submitting review: {str(e)}")


@router_reviews.get("/patient_reviews")
async def get_patient_reviews(patient_id: int = Query(..., gt=0, description="ID del paziente")):
    """Ottieni tutte le recensioni del paziente"""
    try:
        query = """
            SELECT
                r.id,
                r.appointment_id,
                r.stars,
                r.report,
                a.date_time,
                acc.name AS doctor_name,
                acc.surname AS doctor_surname,
                d.specialization
            FROM review r
            JOIN appointment a ON r.appointment_id = a.id
            JOIN doctor d ON a.doctor_id = d.id
            JOIN account acc ON d.id = acc.id
            WHERE a.patient_id = %s AND r.stars IS NOT NULL
            ORDER BY a.date_time DESC
        """
        
        raw_result = execute_query(query, (patient_id,))
        
        reviews = [
            {
                "id": row[0],
                "appointment_id": row[1],
                "stars": row[2],
                "report": row[3],
                "appointment_date": row[4].isoformat() if row[4] else None,
                "doctor_name": row[5],
                "doctor_surname": row[6],
                "specialization": row[7]
            }
            for row in raw_result
        ]

        return {"reviews": reviews}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Errore nel recupero delle recensioni: {str(e)}")