"""
Router principale per la gestione dei profili e dell'autenticazione.

Questo modulo centralizza tutti i router specifici per:
- Gestione profili dottori
- Gestione profili pazienti
- Gestione profili account generici
- Sistema di autenticazione con cookies
- Gestione token JWT e refresh

Il sistema fornisce un'architettura modulare per la gestione
completa dei profili utente e dell'autenticazione.
"""

from fastapi import APIRouter
from backend.router_profile.doctor_profile import router_doctor_profile
from backend.router_profile.patient_profile import router_patient_profile
from backend.router_profile.account_profile import router_account_profile
from backend.router_profile.cookies_login import router_cookies_login

# Router principale per tutti i servizi di profilo e autenticazione
router_profile = APIRouter()

# Include i router specifici con prefissi e tag appropriati
router_profile.include_router(router_doctor_profile, prefix="/doctor", tags=["doctor"])
router_profile.include_router(router_patient_profile, prefix="/patient", tags=["patient"])
router_profile.include_router(router_account_profile, prefix="/account", tags=["generic"])
router_profile.include_router(router_cookies_login, prefix="/cookies", tags=["cookies"])