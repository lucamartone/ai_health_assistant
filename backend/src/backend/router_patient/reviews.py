from fastapi import APIRouter, HTTPException, Query
from typing import List
from backend.connection import execute_query
from backend.router_patient.pydantic.schemas import Appointment, ReviewRequest

router_reviews = APIRouter()

#appuntamenti del panziente completati ma non ancora valutati
@router_reviews.get("/appointments_to_rank")
async def get_appointments_to_rank(patient_id: int = Query(..., gt=0, description="ID del paziente")):
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
                    LEFT JOIN review r ON r.appointment_id = a.id
                    WHERE
                        a.date_time < NOW()
                        AND a.status = 'completed'
                        AND r.stars IS NULL
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
        raise HTTPException(status_code=400, detail=f"Errore nel recupero degli appuntamenti da valutare: {str(e)}")

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

        # Insert the review into the review table
        insert_query = """
            INSERT INTO review (appointment_id, stars, report)
            VALUES (%s, %s, %s)
        """
        execute_query(insert_query, (data.appointment_id, data.stars, data.report), commit=True)

        return {"message": "Review submitted successfully."}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error submitting review: {str(e)}")