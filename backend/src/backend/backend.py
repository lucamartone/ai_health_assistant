import os
from fastapi import FastAPI, HTTPException
from typing import List, Tuple
from backend_profile import user_profile_router
from backend_profile import doctor_profile_router

app = FastAPI()

app.include_router(user_profile_router, prefix="/user", tags=["user"])
app.include_router(doctor_profile_router, prefix="/doctor", tags=["doctor"])