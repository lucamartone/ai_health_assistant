from fastapi import APIRouter
from src.backend.router_user.appointments import router_appointments
from src.backend.router_user.rating import router_rating

router_user = APIRouter()

router_user.include_router(router_appointments, prefix="/appointments", tags=["appointments"])
router_user.include_router(router_rating, prefix="/rating", tags=["rating"])