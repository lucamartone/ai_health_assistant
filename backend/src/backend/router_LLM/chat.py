"""
Sistema di chat intelligente per assistenza sanitaria basato su AI.

Questo modulo fornisce un sistema completo di conversazione AI per:
- Rispondere a domande di salute e benessere
- Fornire informazioni mediche accurate e sicure
- Suggerire specializzazioni mediche appropriate
- Mantenere il contesto delle conversazioni
- Considerare il profilo sanitario dell'utente
- Generare suggerimenti di prenotazione intelligenti

Il sistema utilizza il modello llama3.2:latest tramite Ollama
e implementa prompt di sistema specializzati per la medicina.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import httpx
import json

# Router per le funzionalità di chat AI
router_LLM_chat = APIRouter()

# Configurazione del servizio Ollama
OLLAMA_URL = 'http://ollama:11434'
MODEL = 'llama3.2:latest'

class Message(BaseModel):
    """
    Modello per i singoli messaggi della conversazione.
    
    Definisce la struttura di ogni messaggio scambiato
    tra l'utente e l'assistente AI.
    """
    role: str      # Ruolo del messaggio (user, assistant, system)
    content: str   # Contenuto testuale del messaggio

class UserContext(BaseModel):
    """
    Modello per il contesto sanitario dell'utente.
    
    Contiene informazioni personali e mediche che permettono
    all'AI di fornire risposte più personalizzate e accurate.
    """
    eta: Optional[int] = None                    # Età dell'utente
    sesso: Optional[str] = None                  # Sesso dell'utente
    patologie: Optional[List[str]] = None        # Patologie note
    blood_type: Optional[str] = None             # Gruppo sanguigno
    allergies: Optional[List[str]] = None        # Allergie note
    chronic_conditions: Optional[List[str]] = None # Condizioni croniche

class ChatRequest(BaseModel):
    """
    Modello per le richieste di chat.
    
    Definisce la struttura completa di una richiesta
    di conversazione con l'assistente AI.
    """
    message: str                                 # Messaggio corrente dell'utente
    conversation_id: Optional[str] = None        # ID della conversazione per il tracking
    user_context: Optional[UserContext] = None  # Contesto sanitario dell'utente
    message_history: Optional[List[Message]] = [] # Cronologia dei messaggi precedenti

class ChatResponse(BaseModel):
    """
    Modello per le risposte dell'assistente AI.
    
    Include la risposta generata, metriche di confidenza,
    suggerimenti e informazioni tecniche.
    """
    response: str                    # Risposta generata dall'AI
    confidence: float                # Livello di confidenza della risposta
    suggestions: list                # Suggerimenti di azioni (es. prenotazioni)
    provider: str                    # Fornitore del servizio AI
    model: str                       # Modello AI utilizzato
    usage: Dict[str, int]           # Statistiche di utilizzo (token)

@router_LLM_chat.post("/ask", response_model=ChatResponse)
async def ask(request: ChatRequest):
    """
    Endpoint principale per inviare domande di salute all'assistente AI.
    
    Questa funzione gestisce l'intera conversazione con l'AI, includendo:
    - Preparazione del prompt di sistema con contesto sanitario
    - Gestione della cronologia delle conversazioni
    - Invio delle richieste al servizio Ollama
    - Generazione di suggerimenti di prenotazione intelligenti
    - Gestione degli errori e timeout
    
    Args:
        request: Oggetto ChatRequest contenente il messaggio e il contesto
        
    Returns:
        ChatResponse: Risposta completa dell'assistente AI con suggerimenti
        
    Raises:
        HTTPException: In caso di errori di connessione, timeout o errori del servizio
    """
    try:

        # Preparazione del prompt di sistema per il contesto sanitario
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

        # Aggiunta del contesto utente se disponibile per personalizzare le risposte
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

        # Costruzione dell'array dei messaggi includendo la cronologia completa
        messages = [
            {
                "role": "system",
                "content": system_prompt
            }
        ]

        # Aggiunta della cronologia dei messaggi precedenti per mantenere il contesto
        if request.message_history:
            for msg in request.message_history:
                messages.append({
                    "role": msg.role,
                    "content": msg.content
                })

        # Aggiunta del messaggio corrente dell'utente
        messages.append({
            "role": "user",
            "content": request.message
        })

        # Debug: stampa i messaggi che vengono inviati all'AI per tracciabilità
        print(f"🔍 Messaggi inviati all'AI per conversazione {request.conversation_id}:")
        for i, msg in enumerate(messages):
            print(f"  {i+1}. {msg['role']}: {msg['content'][:100]}...")
        
        # Debug: stampa il contesto utente ricevuto per verifica
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

        # Preparazione del payload per Ollama con parametri ottimizzati
        payload = {
            "model": MODEL,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": 0.7,        # Controlla la creatività delle risposte
                "num_predict": 1000,       # Numero massimo di token da generare
                "top_k": 40,               # Top-k sampling per diversità
                "top_p": 0.9,              # Nucleus sampling per qualità
                "repeat_penalty": 1.1      # Penalità per ripetizioni
            }
        }

        # Invio della richiesta a Ollama con gestione timeout
        async with httpx.AsyncClient(timeout=httpx.Timeout(None)) as client:
            response = await client.post(
                f"{OLLAMA_URL}/api/chat",
                json=payload,
                headers={"Content-Type": "application/json"}
            )

            # Verifica del successo della richiesta
            if not response.is_success:
                error_text = response.text
                print(f"❌ Errore Ollama API: {response.status_code} - {error_text}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Errore nel servizio AI: {response.status_code}"
                )

            data = response.json()
            print(f"✅ Risposta da Ollama ricevuta per conversazione {request.conversation_id}")

            # Generazione di suggerimenti di prenotazione basati sui sintomi menzionati
            suggestions = generate_booking_suggestions(request.message)
            print(f"🔍 Messaggio utente: '{request.message}'")
            print(f"🔍 Suggerimenti generati: {suggestions}")

            # Costruzione della risposta completa con tutte le informazioni
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
        # Gestione specifica dei timeout nelle richieste
        raise HTTPException(
            status_code=408,
            detail="Timeout nella richiesta al servizio AI"
        )
    except httpx.RequestError as e:
        # Gestione degli errori di connessione al servizio
        raise HTTPException(
            status_code=503,
            detail=f"Errore di connessione al servizio AI: {str(e)}"
        )
    except Exception as e:
        # Gestione degli errori generici non previsti
        print(f"❌ Errore generico nella chat: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Errore interno del server: {str(e)}"
        )


def generate_booking_suggestions(user_message: str) -> list:
    """
    Genera suggerimenti di prenotazione basati sui sintomi/condizioni menzionati.
    
    Questa funzione analizza il messaggio dell'utente per identificare
    sintomi o condizioni mediche e suggerisce le specializzazioni
    mediche più appropriate per la prenotazione di visite.
    
    Args:
        user_message: Messaggio dell'utente da analizzare
        
    Returns:
        list: Lista di suggerimenti di prenotazione con specializzazioni appropriate
    """
    suggestions = []
    
    # Mappa completa di sintomi/condizioni a specializzazioni mediche
    specialization_map = {
        # Cardiologia - problemi cardiaci e circolatori
        "cuore": "Cardiologia",
        "cardiaca": "Cardiologia",
        "pressione": "Cardiologia",
        "ipertensione": "Cardiologia",
        "aritmia": "Cardiologia",
        "dolore al petto": "Cardiologia",
        
        # Dermatologia - problemi della pelle
        "pelle": "Dermatologia",
        "eruzione": "Dermatologia",
        "acne": "Dermatologia",
        "psoriasi": "Dermatologia",
        "eczema": "Dermatologia",
        
        # Gastroenterologia - problemi digestivi
        "stomaco": "Gastroenterologia",
        "digestione": "Gastroenterologia",
        "nausea": "Gastroenterologia",
        "vomito": "Gastroenterologia",
        "diarrea": "Gastroenterologia",
        "stipsi": "Gastroenterologia",
        
        # Neurologia - problemi del sistema nervoso
        "cervello": "Neurologia",
        "testa": "Neurologia",
        "mal di testa": "Neurologia",
        "emicrania": "Neurologia",
        "vertigini": "Neurologia",
        "convulsioni": "Neurologia",
        
        # Oculistica - problemi della vista
        "occhi": "Oculistica",
        "vista": "Oculistica",
        "cecità": "Oculistica",
        "cataratta": "Oculistica",
        "glaucoma": "Oculistica",
        
        # Otorinolaringoiatria - problemi di orecchie, naso e gola
        "orecchie": "Otorinolaringoiatria",
        "naso": "Otorinolaringoiatria",
        "gola": "Otorinolaringoiatria",
        "udito": "Otorinolaringoiatria",
        "tinnito": "Otorinolaringoiatria",
        "tonsille": "Otorinolaringoiatria",
        
        # Ortopedia - problemi muscoloscheletrici
        "ossa": "Ortopedia",
        "articolazioni": "Ortopedia",
        "schiena": "Ortopedia",
        "lombare": "Ortopedia",
        "frattura": "Ortopedia",
        "artrite": "Ortopedia",
        "reumatismi": "Ortopedia",
        "ginocchio": "Ortopedia",
        "dolore al ginocchio": "Ortopedia",
        
        # Pneumologia - problemi respiratori
        "polmoni": "Pneumologia",
        "respirazione": "Pneumologia",
        "asma": "Pneumologia",
        "bronchite": "Pneumologia",
        "tosse": "Pneumologia",
        
        # Nefrologia - problemi renali
        "reni": "Nefrologia",
        "urine": "Nefrologia",
        "dialisi": "Nefrologia",
        
        # Endocrinologia - problemi ormonali e metabolici
        "tiroide": "Endocrinologia",
        "diabete": "Endocrinologia",
        "ormoni": "Endocrinologia",
        "metabolismo": "Endocrinologia",
        
        # Pediatria - problemi dell'infanzia
        "bambini": "Pediatria",
        "pediatrico": "Pediatria",
        "infantile": "Pediatria",
        
        # Psichiatria - problemi di salute mentale
        "psiche": "Psichiatria",
        "depressione": "Psichiatria",
        "ansia": "Psichiatria",
        "stress": "Psichiatria",
        "panico": "Psichiatria",
        
        # Psicologia - supporto psicologico
        "psicologico": "Psicologia",
        "terapia": "Psicologia",
        "counseling": "Psicologia",
        
        # Oncologia - problemi tumorali
        "tumore": "Oncologia",
        "cancro": "Oncologia",
        "chemioterapia": "Oncologia",
        "radioterapia": "Oncologia",
        
        # Urologia - problemi urogenitali maschili
        "vescica": "Urologia",
        "prostata": "Urologia",
        "genitale": "Urologia",
        
        # Ginecologia - problemi ginecologici e ostetrici
        "ginecologico": "Ginecologia",
        "gravidanza": "Ginecologia",
        "mestruazioni": "Ginecologia",
        "menopausa": "Ginecologia",
        
        # Allergologia - problemi allergici
        "allergia": "Allergologia",
        "allergico": "Allergologia",
        "anafilassi": "Allergologia",
        
        # Anestesia e Rianimazione
        "anestesia": "Anestesia e Rianimazione",
        
        # Chirurgia Generale
        "chirurgia": "Chirurgia Generale",
        "operazione": "Chirurgia Generale",
        
        # Radiologia - diagnostica per immagini
        "radiografia": "Radiologia",
        "risonanza": "Radiologia",
        "tac": "Radiologia",
        "ecografia": "Radiologia"
    }
    
    # Conversione del messaggio in minuscolo per la ricerca case-insensitive
    user_message_lower = user_message.lower()
    print(f"🔍 Messaggio in minuscolo: '{user_message_lower}'")
    
    # Ricerca delle specializzazioni appropriate nel messaggio dell'utente
    suggested_specializations = []
    for keyword, specialization in specialization_map.items():
        # Ricerca di parole intere per evitare falsi positivi
        if f" {keyword} " in f" {user_message_lower} " or user_message_lower.startswith(keyword + " ") or user_message_lower.endswith(" " + keyword):
            suggested_specializations.append(specialization)
            print(f"🔍 Trovata keyword '{keyword}' -> {specialization}")
    
    # Rimozione dei duplicati per evitare suggerimenti ripetuti
    suggested_specializations = list(set(suggested_specializations))
    
    # Generazione dei suggerimenti di prenotazione per le specializzazioni trovate
    if suggested_specializations:
        for spec in suggested_specializations[:2]:  # Massimo 2 specialisti per evitare confusione
            suggestions.append({
                "type": "BOOK_APPOINTMENT",
                "specialization": spec,
                "text": f"Prenota visita di {spec}"
            })
    
    return suggestions