from fastapi import APIRouter
from backend.router_patient.appointments import router_appointments
from backend.src.backend.router_patient.reviews import router_reviews
from backend.src.backend.router_patient.show_doctors import router_show_doctors

router_patient = APIRouter()


router_patient.include_router(router_appointments, prefix="/appointments", tags=["appointments"])
router_patient.include_router(router_reviews, prefix="/rewiews", tags=["reviews"])
router_patient.include_router(router_show_doctors, prefix="/show_doctors", tags=["show_doctors"])