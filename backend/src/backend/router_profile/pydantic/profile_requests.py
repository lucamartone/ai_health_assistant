from pydantic import BaseModel, EmailStr
from typing import List
from typing import Literal

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
    specialization: str
    location: List[str]


class LoginRequest(BaseModel):
    email: str
    password: str