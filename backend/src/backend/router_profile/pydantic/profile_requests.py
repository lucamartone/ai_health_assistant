from pydantic import BaseModel, EmailStr
from typing import List, Literal, Optional


class LocationData(BaseModel):
    address: str
    latitude: Optional[float]
    longitude: Optional[float]

class RegisterRequest(BaseModel):
    name:str
    surname:str
    email: EmailStr
    password: str
    sex: Literal['M', 'F']

class RegisterDoctorRequest(BaseModel):
    name: str
    surname: str
    email: EmailStr
    password: str
    sex: Literal['M', 'F']
    specialization: str
    location: List[LocationData]

class LoginRequest(BaseModel):
    email: str
    password: str