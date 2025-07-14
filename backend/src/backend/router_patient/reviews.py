from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from datetime import datetime
from backend.connection import execute_query
from backend.router_patient.pydantic.pydantic import Appointment

router_reviews = APIRouter()

#appuntamenti del panziente completati ma non ancora valutati
@router_reviews.get("/appointments_to_rank")
async def get_appoinntments_to_rank(patient_id: int = Query(..., gt=0, description="ID del paziente")):
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
                        a.state,
                        a.created_at
                    FROM appointment a
                    JOIN doctor d ON a.doctor_id = d.id
                    JOIN account acc ON d.id = acc.id
                    JOIN location l ON a.location_id = l.id
                    LEFT JOIN history h ON h.appointment_id = a.id
                    WHERE
                        a.date_time < NOW()
                        AND a.state = 'completed'
                        AND h.review IS NULL
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
                state=row[7],
                created_at=row[8]
            )
            for row in raw_result
        ]

        return {"appointments": appointments}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Errore nel recupero degli appuntamenti da valutare: {str(e)}")

@router_reviews.get("/review_doctor")
async def review_doctor(doctor_id: str, patient_id: str, rating: int):
    """Endpoint to rate a doctor."""
    # Implement logic to save the rating for the doctor
    if doctor_id and patient_id and 1 <= rating <= 5:
        return {"message": "Doctor rated successfully", "doctor_id": doctor_id, "rating": rating}
    else:
        raise HTTPException(status_code=400, detail="Invalid input")