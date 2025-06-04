from fastapi import APIRouter
from backend.src.backend.router_database.database_doctors import router_database_doctors

router_database = APIRouter()

router_database.include_router(router_database_doctors, prefix="/database", tags=["database"])

