from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Appointment(BaseModel):
    id: int
    doctor_surname: str
    specialization :str
    address : str
    city: str
    date_time: datetime
    price: float
    status: str
    created_at: datetime

class ReviewRequest(BaseModel):
    appointment_id: int
    stars: int
    report: Optional[str] = None

class BookAppointmentRequest(BaseModel):
    appointment_id: int
    patient_id: int
