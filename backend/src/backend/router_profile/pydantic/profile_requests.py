from pydantic import BaseModel, EmailStr
from typing import Literal

class RegisterRequest(BaseModel):
    name:str
    surname:str
    email: EmailStr
    password: str
    sex: Literal['M', 'F']

class LoginRequest(BaseModel):
    email: str
    password: str