from fastapi import APIRouter

from backend.router_LLM.status import router_LLM_status
from backend.router_LLM.chat import router_LLM_chat

router_LLM = APIRouter()

router_LLM.include_router(router_LLM_status, prefix="/status", tags=["status"])
router_LLM.include_router(router_LLM_chat, prefix="/chat", tags=["chat"])

