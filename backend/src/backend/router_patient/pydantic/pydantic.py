from pydantic import BaseModel
from datetime import datetime

class Appointment(BaseModel):
    id: int
    doctor_id: int
    patient_id: int
    location_id: int
    date_time: datetime
    price: float
    state: str
    created_at: datetime