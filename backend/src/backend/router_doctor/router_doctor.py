from fastapi import APIRouter
from backend.router_doctor.appointments import router_appointments

router_doctor = APIRouter()

router_doctor.include_router(router_appointments, prefix="/appointments", tags=["appointments"])