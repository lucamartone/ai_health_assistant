import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.router_profile.router_profile import router_profile
from backend.router_patient.router_patient import router_patient

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8001")
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost",         # per React in dev
        "http://localhost:3000",    # se usi Vite o create-react-app
        "http://127.0.0.1:3000",    # utile in certi ambienti
        "http://localhost:80"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router_profile, prefix="/profile", tags=["generic"])
app.include_router(router_patient, prefix="/patient", tags=["patient"])