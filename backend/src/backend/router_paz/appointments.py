from fastapi import APIRouter, HTTPException

router_appointments = APIRouter()

@router_appointments.get("/book_appointment")
async def book_appointment(doctor_id: str, patient_id: str, appointment_time: str):
    """Endpoint to book an appointment with a doctor."""
    # Implement logic to book the appointment
    if doctor_id and patient_id and appointment_time:
        return {"message": "Appointment booked successfully"}
    else:
        raise HTTPException(status_code=400, detail="Invalid input")

