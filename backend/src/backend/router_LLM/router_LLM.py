from fastapi import APIRouter

from backend.router_LLM.status import router_LLM_status

router_LLM = APIRouter()

router_LLM.include_router(router_LLM_status, prefix="/status", tags=["status"])

