from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
import uuid
from datetime import datetime
import logging

from ..models.schemas import (
    ChatRequest, ChatResponse, ChatMessage, MessageRole,
    HealthAdviceRequest, HealthAdviceResponse
)
from ..utils.ai_chat import AIChatService
from ..utils.auth import get_current_user
from ..utils.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize AI Chat Service
ai_chat_service = AIChatService()

@router.post("/", response_model=ChatResponse)
async def chat_with_ai(
    request: ChatRequest,
    current_user: Optional[dict] = Depends(get_current_user)
):
    """
    Chat con l'assistente AI per domande sanitarie generali
    """
    try:
        logger.info(f"Chat request from user {current_user.get('id') if current_user else 'anonymous'}")
        
        # Generate conversation ID if not provided
        conversation_id = request.conversation_id or str(uuid.uuid4())
        
        # Create chat message
        message = ChatMessage(
            role=MessageRole.USER,
            content=request.message,
            timestamp=datetime.now()
        )
        
        # Get AI response
        response = await ai_chat_service.get_response(
            message=request.message,
            conversation_id=conversation_id,
            user_context=request.context,
            user_id=current_user.get('id') if current_user else None
        )
        
        return ChatResponse(
            message=response['message'],
            conversation_id=conversation_id,
            timestamp=datetime.now(),
            confidence=response.get('confidence'),
            suggestions=response.get('suggestions')
        )
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore nel servizio AI: {str(e)}")

@router.post("/health-advice", response_model=HealthAdviceResponse)
async def get_health_advice(
    request: HealthAdviceRequest,
    current_user: Optional[dict] = Depends(get_current_user)
):
    """
    Ottieni consigli sanitari su un argomento specifico
    """
    try:
        logger.info(f"Health advice request for topic: {request.topic}")
        
        advice = await ai_chat_service.get_health_advice(
            topic=request.topic,
            user_profile=request.user_profile,
            specific_concerns=request.specific_concerns
        )
        
        return HealthAdviceResponse(
            advice=advice['advice'],
            sources=advice.get('sources', []),
            disclaimer="Questi consigli non sostituiscono la consulenza medica professionale. Consulta sempre un medico per problemi di salute.",
            related_topics=advice.get('related_topics', [])
        )
        
    except Exception as e:
        logger.error(f"Error in health advice endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore nel servizio AI: {str(e)}")

@router.get("/conversation/{conversation_id}")
async def get_conversation_history(
    conversation_id: str,
    current_user: Optional[dict] = Depends(get_current_user)
):
    """
    Ottieni la cronologia di una conversazione specifica
    """
    try:
        # Verify user has access to this conversation
        if current_user:
            # In a real implementation, you'd check if the user owns this conversation
            pass
        
        history = await ai_chat_service.get_conversation_history(conversation_id)
        return {"conversation_id": conversation_id, "messages": history}
        
    except Exception as e:
        logger.error(f"Error getting conversation history: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore nel recupero della cronologia: {str(e)}")

@router.delete("/conversation/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: Optional[dict] = Depends(get_current_user)
):
    """
    Elimina una conversazione
    """
    try:
        if not current_user:
            raise HTTPException(status_code=401, detail="Autenticazione richiesta")
        
        await ai_chat_service.delete_conversation(conversation_id, current_user['id'])
        return {"message": "Conversazione eliminata con successo"}
        
    except Exception as e:
        logger.error(f"Error deleting conversation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore nell'eliminazione: {str(e)}")

@router.get("/conversations")
async def get_user_conversations(
    current_user: dict = Depends(get_current_user),
    limit: int = 10,
    offset: int = 0
):
    """
    Ottieni la lista delle conversazioni dell'utente
    """
    try:
        if not current_user:
            raise HTTPException(status_code=401, detail="Autenticazione richiesta")
        
        conversations = await ai_chat_service.get_user_conversations(
            user_id=current_user['id'],
            limit=limit,
            offset=offset
        )
        return {"conversations": conversations}
        
    except Exception as e:
        logger.error(f"Error getting user conversations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore nel recupero delle conversazioni: {str(e)}") 