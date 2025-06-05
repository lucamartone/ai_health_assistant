from fastapi import APIRouter
from backend.router_profile.doctor_profile import router_doctor_profile
from backend.router_profile.patient_profile import router_patient_profile
from backend.router_profile.generic_profile import router_generic_profile

router_profile = APIRouter()

router_profile.include_router(router_doctor_profile, prefix="/doctor", tags=["doctor"])
router_profile.include_router(router_patient_profile, prefix="/patient", tags=["patient"])
router_profile.include_router(router_generic_profile, prefix="/generic", tags=["generic"])