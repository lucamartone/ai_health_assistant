from fastapi import APIRouter
from .appointments import router_appointments
from .clinical_folders import router as clinical_folders_router
from .doctor_registration import router_doctor_registration

router_doctor = APIRouter()
router_doctor.include_router(router_appointments, prefix="/appointments", tags=["appointments"])
router_doctor.include_router(clinical_folders_router, prefix="/clinical_folders", tags=["clinical_folders"])
router_doctor.include_router(router_doctor_registration, prefix="/registration", tags=["doctor_registration"])