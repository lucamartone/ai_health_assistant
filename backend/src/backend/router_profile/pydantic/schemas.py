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
    locations: List[LocationData]

class LoginRequest(BaseModel):
    email: str
    password: str

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str
    account_email: EmailStr

class ModifyProfileRequest(BaseModel):
    name: str
    surname: str
    phone: Optional[str] = None
    email: EmailStr
    profile_img: Optional[str] = None

class HealthDataInput(BaseModel):
    patient_id: int
    blood_type: Optional[str] = None
    allergies: Optional[List[str]] = None
    chronic_conditions: Optional[List[str]] = None