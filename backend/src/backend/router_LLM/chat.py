from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
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
    blood_type: Optional[str] = None
    allergies: Optional[List[str]] = None
    chronic_conditions: Optional[List[str]] = None

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    user_context: Optional[UserContext] = None
    message_history: Optional[List[Message]] = []

class ChatResponse(BaseModel):
    response: str
    confidence: float
    suggestions: list
    provider: str
    model: str
    usage: Dict[str, int]

@router_LLM_chat.post("/ask", response_model=ChatResponse)
async def ask(request: ChatRequest):
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
7. Considerare sempre il profilo sanitario del paziente nelle tue risposte
8. Mantenere sempre la memoria della conversazione precedente

IMPORTANTE: 
- Ricorda sempre i sintomi e le informazioni che il paziente ha condiviso nella conversazione
- Se il paziente chiede "che cos'ho" o simili, fai riferimento ai sintomi che ha menzionato prima
- Non fornire mai diagnosi definitive. Incoraggia sempre la consultazione con un medico per problemi seri
- Rispondi sempre in italiano e sii utile ma cauto nelle raccomandazioni mediche"""

        # Aggiungi il contesto utente se disponibile
        if request.user_context:
            context_info = []
            if request.user_context.eta:
                context_info.append(f"Età: {request.user_context.eta} anni")
            if request.user_context.sesso:
                context_info.append(f"Sesso: {request.user_context.sesso}")
            if request.user_context.blood_type:
                context_info.append(f"Gruppo sanguigno: {request.user_context.blood_type}")
            if request.user_context.allergies and len(request.user_context.allergies) > 0:
                context_info.append(f"Allergie: {', '.join(request.user_context.allergies)}")
            if request.user_context.chronic_conditions and len(request.user_context.chronic_conditions) > 0:
                context_info.append(f"Condizioni croniche: {', '.join(request.user_context.chronic_conditions)}")
            if request.user_context.patologie and len(request.user_context.patologie) > 0:
                context_info.append(f"Patologie note: {', '.join(request.user_context.patologie)}")
            
            if context_info:
                system_prompt += f"\n\nPROFILO SANITARIO DEL PAZIENTE:\n{' | '.join(context_info)}\n\nConsidera sempre questi dati nel fornire consigli e raccomandazioni. Presta particolare attenzione alle allergie e condizioni croniche quando suggerisci farmaci o trattamenti."

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

        # Debug: stampa i messaggi che vengono inviati all'AI
        print(f"🔍 Messaggi inviati all'AI per conversazione {request.conversation_id}:")
        for i, msg in enumerate(messages):
            print(f"  {i+1}. {msg['role']}: {msg['content'][:100]}...")
        
        # Debug: stampa il user context ricevuto
        if request.user_context:
            print(f"👤 User Context ricevuto dal frontend:")
            print(f"  - Età: {request.user_context.eta}")
            print(f"  - Sesso: {request.user_context.sesso}")
            print(f"  - Patologie: {request.user_context.patologie}")
            print(f"  - Blood Type: {request.user_context.blood_type}")
            print(f"  - Allergies: {request.user_context.allergies}")
            print(f"  - Chronic Conditions: {request.user_context.chronic_conditions}")
        else:
            print("⚠️  Nessun user context ricevuto dal frontend")

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

            # Genera solo suggerimenti di prenotazione
            suggestions = generate_booking_suggestions(request.message)
            print(f"🔍 Messaggio utente: '{request.message}'")
            print(f"🔍 Suggerimenti generati: {suggestions}")

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


def generate_booking_suggestions(user_message: str) -> list:
    """
    Genera solo suggerimenti di prenotazione basati sui sintomi/condizioni menzionati
    """
    suggestions = []
    
    # Mappa di sintomi/condizioni a specializzazioni
    specialization_map = {
        "cuore": "Cardiologia",
        "cardiaca": "Cardiologia",
        "pressione": "Cardiologia",
        "ipertensione": "Cardiologia",
        "aritmia": "Cardiologia",
        "dolore al petto": "Cardiologia",
        "pelle": "Dermatologia",
        "eruzione": "Dermatologia",
        "acne": "Dermatologia",
        "psoriasi": "Dermatologia",
        "eczema": "Dermatologia",
        "stomaco": "Gastroenterologia",
        "digestione": "Gastroenterologia",
        "nausea": "Gastroenterologia",
        "vomito": "Gastroenterologia",
        "diarrea": "Gastroenterologia",
        "stipsi": "Gastroenterologia",
        "cervello": "Neurologia",
        "testa": "Neurologia",
        "mal di testa": "Neurologia",
        "emicrania": "Neurologia",
        "vertigini": "Neurologia",
        "convulsioni": "Neurologia",
        "occhi": "Oculistica",
        "vista": "Oculistica",
        "cecità": "Oculistica",
        "cataratta": "Oculistica",
        "glaucoma": "Oculistica",
        "orecchie": "Otorinolaringoiatria",
        "naso": "Otorinolaringoiatria",
        "gola": "Otorinolaringoiatria",
        "udito": "Otorinolaringoiatria",
        "tinnito": "Otorinolaringoiatria",
        "tonsille": "Otorinolaringoiatria",
        "ossa": "Ortopedia",
        "articolazioni": "Ortopedia",
        "schiena": "Ortopedia",
        "lombare": "Ortopedia",
        "frattura": "Ortopedia",
        "artrite": "Ortopedia",
        "reumatismi": "Ortopedia",
        "polmoni": "Pneumologia",
        "respirazione": "Pneumologia",
        "asma": "Pneumologia",
        "bronchite": "Pneumologia",
        "tosse": "Pneumologia",
        "reni": "Nefrologia",
        "urine": "Nefrologia",
        "dialisi": "Nefrologia",
        "tiroide": "Endocrinologia",
        "diabete": "Endocrinologia",
        "ormoni": "Endocrinologia",
        "metabolismo": "Endocrinologia",
        "bambini": "Pediatria",
        "pediatrico": "Pediatria",
        "infantile": "Pediatria",
        "psiche": "Psichiatria",
        "depressione": "Psichiatria",
        "ansia": "Psichiatria",
        "stress": "Psichiatria",
        "panico": "Psichiatria",
        "psicologico": "Psicologia",
        "terapia": "Psicologia",
        "counseling": "Psicologia",
        "tumore": "Oncologia",
        "cancro": "Oncologia",
        "chemioterapia": "Oncologia",
        "radioterapia": "Oncologia",
        "vescica": "Urologia",
        "prostata": "Urologia",
        "genitale": "Urologia",
        "ginecologico": "Ginecologia",
        "gravidanza": "Ginecologia",
        "mestruazioni": "Ginecologia",
        "menopausa": "Ginecologia",
        "allergia": "Allergologia",
        "allergico": "Allergologia",
        "anafilassi": "Allergologia",
        "anestesia": "Anestesia e Rianimazione",
        "chirurgia": "Chirurgia Generale",
        "operazione": "Chirurgia Generale",
        "radiografia": "Radiologia",
        "risonanza": "Radiologia",
        "tac": "Radiologia",
        "ecografia": "Radiologia"
    }
    
    user_message_lower = user_message.lower()
    print(f"🔍 Messaggio in minuscolo: '{user_message_lower}'")
    
    # Cerca specializzazioni nel messaggio
    suggested_specializations = []
    for keyword, specialization in specialization_map.items():
        if keyword in user_message_lower:
            suggested_specializations.append(specialization)
            print(f"🔍 Trovata keyword '{keyword}' -> {specialization}")
    
    # Rimuovi duplicati
    suggested_specializations = list(set(suggested_specializations))
    
    # Aggiungi solo suggerimenti per specialisti se trovati
    if suggested_specializations:
        for spec in suggested_specializations[:2]:  # Massimo 2 specialisti
            suggestions.append({
                "type": "BOOK_APPOINTMENT",
                "specialization": spec,
                "text": f"Prenota visita di {spec}"
            })
    
    return suggestions