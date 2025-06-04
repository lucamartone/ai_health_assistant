import os
from fastapi import FastAPI, HTTPException
from typing import List, Tuple
from src.backend.router_profile import router_profile
from src.backend.router_database import router_database
from src.backend.router_user import router_user

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8001")
app = FastAPI()

app.include_router(router_profile, prefix="/generic", tags=["generic"])
app.include_router(router_database, prefix="/database", tags=["database"])
app.include_router(router_user, prefix="/user", tags=["user"])