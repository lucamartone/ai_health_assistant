from fastapi import APIRouter
from src.backend.router_profile.generic_profile import router_generic_profile
from src.backend.router_profile.doctor_profile import router_doctor_profile
from src.backend.router_profile.patient_profile import router_patient_profile

router_profile = APIRouter()

router_profile.include_router(router_generic_profile, prefix="/generic", tags=["profile"])
router_profile.include_router(router_doctor_profile, prefix="/doctor", tags=["profile"])
router_profile.include_router(router_patient_profile, prefix="/patient", tags=["profile"])
