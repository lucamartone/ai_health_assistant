from pydantic import BaseModel
from typing import List, Literal, Optional

class AppointmentsRequest(BaseModel):
    doctor_id: int

class AppointmentInsert(BaseModel):
    doctor_id: int
    location_id: int
    date_time: str  # ISO 8601 format
    state: str = 'waiting'  # Default state for new appointments

