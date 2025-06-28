from fastapi import APIRouter
from .appointments import router_appointments
from .clinical_folders import router as clinical_folders_router

router_doctor = APIRouter()
router_doctor.include_router(router_appointments, prefix="/appointments", tags=["appointments"])
router_doctor.include_router(clinical_folders_router, prefix="/clinical_folders", tags=["clinical_folders"])