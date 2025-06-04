from fastapi import APIRouter
from src.backend.router_database.doctors_database import router_doctors_database

router_database = APIRouter()

router_database.include_router(router_doctors_database, prefix="/doctors", tags=["doctors"])