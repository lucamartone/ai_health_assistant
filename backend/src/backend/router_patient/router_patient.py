"""
Router principale per le funzionalità dei pazienti.

Questo modulo centralizza tutti i router specifici per i pazienti,
organizzandoli in endpoint logici per una migliore gestione delle API.
Include funzionalità per appuntamenti, recensioni e visualizzazione dottori.
"""

from fastapi import APIRouter
from backend.router_patient.appointments import router_appointments
from backend.router_patient.reviews import router_reviews
from backend.router_patient.doctors import router_show_doctors

# Router principale per tutte le funzionalità dei pazienti
router_patient = APIRouter()

# Include i router specifici con prefissi e tag appropriati
router_patient.include_router(router_appointments, prefix="/appointments", tags=["appointments"])
router_patient.include_router(router_reviews, prefix="/reviews", tags=["reviews"])
router_patient.include_router(router_show_doctors, prefix="/doctors", tags=["doctors"])