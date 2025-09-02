"""
Router principale per le funzionalità dei dottori.

Questo modulo centralizza tutti i router specifici per i dottori,
organizzandoli in endpoint logici per una migliore gestione delle API.
"""

from fastapi import APIRouter
from .appointments import router_appointments
from .clinical_folders import router as clinical_folders_router
from .doctor_registration import router_doctor_registration

# Router principale per tutte le funzionalità dei dottori
router_doctor = APIRouter()

# Include i router specifici con prefissi e tag appropriati
router_doctor.include_router(router_appointments, prefix="/appointments", tags=["appointments"])
router_doctor.include_router(clinical_folders_router, prefix="/clinical_folders", tags=["clinical_folders"])
router_doctor.include_router(router_doctor_registration, prefix="/registration", tags=["doctor_registration"])