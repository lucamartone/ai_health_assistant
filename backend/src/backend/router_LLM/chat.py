from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import httpx
import json

router_LLM_chat = APIRouter()

OLLAMA_URL = 'http://ollama:11434'
MODEL = 'llama3.2:latest'

class Message(BaseModel):
    role: str
    content: str

class UserContext(BaseModel):
    eta: Optional[int] = None
    sesso: Optional[str] = None
    patologie: Optional[List[str]] = None

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    user_context: Optional[UserContext] = None
    message_history: Optional[List[Message]] = []

class ChatResponse(BaseModel):
    response: str
    confidence: float
    suggestions: List[str]
    provider: str
    model: str
    usage: Dict[str, int]

@router_LLM_chat.post("/ask", response_model=ChatResponse)
async def ask_health_question(request: ChatRequest):
    """
    Endpoint per inviare una domanda di salute all'AI
    """
    try:
        # Prepara il prompt di sistema per il contesto sanitario
        system_prompt = """Sei un assistente sanitario AI professionale e compassionevole. Il tuo ruolo è:
1. Fornire informazioni sanitarie accurate e basate su evidenze
2. Aiutare a comprendere sintomi e condizioni mediche
3. Suggerire quando consultare un medico
4. Offrire consigli su stili di vita sani
5. Riconoscere situazioni di emergenza e guidare verso assistenza medica immediata
6. Suggerire specializzazioni mediche in base alla diagnosi

Rispondi sempre in italiano e sii utile ma cauto nelle raccomandazioni mediche.

IMPORTANTE: Non fornire mai diagnosi definitive. Incoraggia sempre la consultazione con un medico per problemi seri."""

        # Aggiungi il contesto utente se disponibile
        if request.user_context:
            context_info = []
            if request.user_context.eta:
                context_info.append(f"Età: {request.user_context.eta} anni")
            if request.user_context.sesso:
                context_info.append(f"Sesso: {request.user_context.sesso}")
            if request.user_context.patologie:
                context_info.append(f"Patologie note: {', '.join(request.user_context.patologie)}")
            
            if context_info:
                system_prompt += f"\n\nContesto utente: {'; '.join(context_info)}"

        # Costruisci l'array dei messaggi includendo la cronologia
        messages = [
            {
                "role": "system",
                "content": system_prompt
            }
        ]

        # Aggiungi la cronologia dei messaggi precedenti
        if request.message_history:
            for msg in request.message_history:
                messages.append({
                    "role": msg.role,
                    "content": msg.content
                })

        # Aggiungi il messaggio corrente
        messages.append({
            "role": "user",
            "content": request.message
        })

        # Prepara il payload per Ollama
        payload = {
            "model": MODEL,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": 0.7,
                "num_predict": 1000,
                "top_k": 40,
                "top_p": 0.9,
                "repeat_penalty": 1.1
            }
        }

        # Invia la richiesta a Ollama
        async with httpx.AsyncClient(timeout=httpx.Timeout(None)) as client:
            response = await client.post(
                f"{OLLAMA_URL}/api/chat",
                json=payload,
                headers={"Content-Type": "application/json"}
            )

            if not response.is_success:
                error_text = response.text
                print(f"❌ Errore Ollama API: {response.status_code} - {error_text}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Errore nel servizio AI: {response.status_code}"
                )

            data = response.json()
            print(f"✅ Risposta da Ollama ricevuta per conversazione {request.conversation_id}")

            # Genera suggerimenti basati sulla risposta
            suggestions = generate_suggestions(request.message, data.get("message", {}).get("content", ""))

            return ChatResponse(
                response=data.get("message", {}).get("content", "Mi dispiace, non ho ricevuto una risposta valida."),
                confidence=0.9,
                suggestions=suggestions,
                provider="ollama",
                model=MODEL,
                usage={
                    "prompt_tokens": data.get("prompt_eval_count", 0),
                    "completion_tokens": data.get("eval_count", 0),
                    "total_tokens": (data.get("prompt_eval_count", 0) + data.get("eval_count", 0))
                }
            )

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=408,
            detail="Timeout nella richiesta al servizio AI"
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Errore di connessione al servizio AI: {str(e)}"
        )
    except Exception as e:
        print(f"❌ Errore generico nella chat: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Errore interno del server: {str(e)}"
        )

def generate_suggestions(user_message: str, ai_response: str) -> List[str]:
    """
    Genera suggerimenti di follow-up basati sul messaggio dell'utente e la risposta dell'AI
    """
    suggestions = []
    
    # Suggerimenti generici per domande di salute
    if any(word in user_message.lower() for word in ["sintomi", "dolore", "mal di"]):
        suggestions.extend([
            "Quando hai notato questi sintomi per la prima volta?",
            "I sintomi peggiorano in momenti specifici della giornata?",
            "Hai altri sintomi associati?"
        ])
    
    elif any(word in user_message.lower() for word in ["dieta", "alimentazione", "cibo"]):
        suggestions.extend([
            "Hai allergie o intolleranze alimentari?",
            "Quali sono i tuoi obiettivi nutrizionali?",
            "Hai problemi digestivi specifici?"
        ])
    
    elif any(word in user_message.lower() for word in ["esercizio", "sport", "attività fisica"]):
        suggestions.extend([
            "Che tipo di attività fisica ti interessa?",
            "Hai limitazioni fisiche da considerare?",
            "Qual è il tuo livello di fitness attuale?"
        ])
    
    else:
        # Suggerimenti generici
        suggestions.extend([
            "Puoi fornire più dettagli sui tuoi sintomi?",
            "Hai già consultato un medico per questo problema?",
            "Ci sono altri fattori che potrebbero essere rilevanti?"
        ])
    
    # Limita a 3 suggerimenti
    return suggestions[:3]
