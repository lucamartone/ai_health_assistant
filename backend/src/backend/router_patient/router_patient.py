from fastapi import APIRouter
from backend.router_patient.appointments import router_appointments
from backend.router_patient.reviews import router_reviews
from backend.router_patient.doctors import router_show_doctors

router_patient = APIRouter()

router_patient.include_router(router_appointments, prefix="/appointments", tags=["appointments"])
router_patient.include_router(router_reviews, prefix="/reviews", tags=["reviews"])
router_patient.include_router(router_show_doctors, prefix="/doctors", tags=["doctors"])