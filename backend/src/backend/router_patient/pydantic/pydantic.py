from pydantic import BaseModel
from datetime import datetime

class Appointment(BaseModel):
    id: int
    doctor_surname: str
    specialization :str
    address : str
    city: str
    date_time: datetime
    price: float
    state: str
    created_at: datetime
