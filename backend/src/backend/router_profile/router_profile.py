from fastapi import APIRouter
from backend.router_profile.doctor_profile import router_doctor_profile
from backend.router_profile.patient_profile import router_patient_profile
from backend.router_profile.account_profile import router_account_profile
from backend.router_profile.cookies_login import router_cookies_login

router_profile = APIRouter()

router_profile.include_router(router_doctor_profile, prefix="/doctor", tags=["doctor"])
router_profile.include_router(router_patient_profile, prefix="/patient", tags=["patient"])
router_profile.include_router(router_account_profile, prefix="/account", tags=["generic"])
router_profile.include_router(router_cookies_login, prefix="/cookies", tags=["cookies"])