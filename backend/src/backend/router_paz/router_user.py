from fastapi import APIRouter
from backend.router_paz.appointments import router_appointments
from backend.router_paz.rating import router_rating
from backend.router_paz.show_doc import router_doctors_database

router_user = APIRouter()


router_user.include_router(router_appointments, prefix="/appointments", tags=["appointments"])
router_user.include_router(router_rating, prefix="/rating", tags=["rating"])
router_user.include_router(router_doctors_database, prefix="/doctors", tags=["doctors"])