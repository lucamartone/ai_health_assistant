from pydantic import BaseModel, EmailStr
from typing import Literal

class RegisterRequest(BaseModel):
    nome:str
    cognome:str
    email: EmailStr
    password: str
    sesso:Literal['M', 'F']

class LoginRequest(BaseModel):
    email: str
    password: str