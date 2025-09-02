"""
Router principale per i servizi di intelligenza artificiale (LLM).

Questo modulo centralizza tutti i router specifici per i servizi LLM,
organizzandoli in endpoint logici per la gestione delle conversazioni
AI e il monitoraggio dello stato dei modelli.
"""

from fastapi import APIRouter

from backend.router_LLM.status import router_LLM_status
from backend.router_LLM.chat import router_LLM_chat

# Router principale per tutti i servizi LLM
router_LLM = APIRouter()

# Include i router specifici con prefissi e tag appropriati
router_LLM.include_router(router_LLM_status, prefix="/status", tags=["status"])
router_LLM.include_router(router_LLM_chat, prefix="/chat", tags=["chat"])

