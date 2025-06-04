import os
from fastapi import FastAPI
from src.backend.router_profile.router_profile import router_profile
from src.backend.router_database.router_database import router_database

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8001")
app = FastAPI()

app.include_router(router_profile, prefix="/profile", tags=["generic"])
app.include_router(router_database, prefix="/database", tags=["database"])