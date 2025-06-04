from fastapi import FastAPI, HTTPException
from typing import List, Tuple
from frontend_profile import router_generic_profile
from frontend_profile import router_doctor_profile
from frontend_profile import router_patient_profile
from frontend_database import router_database

app = FastAPI()

app.include_router(router_generic_profile, prefix="/generic", tags=["generic"])
app.include_router(router_doctor_profile, prefix="/doctor", tags=["doctor"])
app.include_router(router_patient_profile, prefix="/patient", tags=["patient"])
app.include_router(router_database, prefix="/database", tags=["database"])