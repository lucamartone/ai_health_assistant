"""
Monitoraggio dello stato dei modelli di intelligenza artificiale.

Questo modulo fornisce funzionalità per:
- Verificare lo stato di connessione con Ollama
- Monitorare la disponibilità dei modelli AI
- Controllare lo stato di download dei modelli
- Fornire informazioni sui modelli disponibili

Il sistema si connette al servizio Ollama per verificare
la disponibilità e lo stato dei modelli di linguaggio.
"""

from fastapi import FastAPI, APIRouter
from pydantic import BaseModel
from typing import List
import httpx

# Router per il monitoraggio dello stato dei modelli LLM
router_LLM_status = APIRouter()

# URL del servizio Ollama per la connessione
OLLAMA_URL = 'http://ollama:11434'

class ollama_message(BaseModel):
    """
    Modello per i messaggi di Ollama.
    
    Definisce la struttura dei messaggi inviati
    al servizio Ollama per le conversazioni AI.
    """
    role: str      # Ruolo del messaggio (user, assistant, system)
    content: str   # Contenuto del messaggio

class ollama_body_answere(BaseModel):
    """
    Modello per il corpo delle richieste a Ollama.
    
    Definisce la struttura delle richieste inviate
    al servizio Ollama per generare risposte.
    """
    model: str                    # Nome del modello da utilizzare
    messages: List[ollama_message] # Lista dei messaggi della conversazione
    stream: bool                  # Flag per streaming delle risposte

class answer(BaseModel):
    """
    Modello per le risposte di Ollama.
    
    Struttura semplificata per le risposte
    generate dal servizio Ollama.
    """
    answer: str   # Contenuto della risposta generata

@router_LLM_status.get("/get_status")
async def get_status():
    """
    Verifica lo stato di connessione e disponibilità dei modelli AI.
    
    Questa funzione controlla:
    - La connessione al servizio Ollama
    - La disponibilità del modello llama3.2:latest
    - Lo stato di download dei modelli
    - Le dimensioni dei modelli disponibili
    
    Returns:
        dict: Dizionario con lo stato del servizio e informazioni sui modelli
        
    Raises:
        Exception: In caso di errori di connessione o comunicazione
    """
    try:
        async with httpx.AsyncClient() as client:
            # Verifica che Ollama risponda correttamente
            response = await client.get(f"{OLLAMA_URL}/api/tags")
            if response.status_code == 200:
                data = response.json()
                models = data.get("models", [])
                
                # Cerca specificamente il modello llama3.2:latest
                llama_model = next((model for model in models if "llama3.2:latest" in model.get("name", "")), None)
                
                if llama_model:
                    # Modello disponibile e pronto per l'uso
                    return {
                        "status": "ready",
                        "model": llama_model["name"],
                        "size": llama_model.get("size", 0),
                        "message": "Modello AI pronto per l'uso"
                    }
                else:
                    # Modello non ancora scaricato
                    return {
                        "status": "downloading",
                        "message": "Modello AI in fase di download..."
                    }
            else:
                # Ollama non risponde correttamente
                return {
                    "status": "error",
                    "message": "Ollama non risponde correttamente"
                }
    except Exception as e:
        # Errore generico di connessione
        return {
            "status": "error",
            "message": f"Errore nella connessione a Ollama: {str(e)}"
        }


# Codice commentato per funzionalità future di richiesta diretta
# @router_LLM_status.post('/ask')
# def ask (question:str):
#     """
#     Funzione per inviare domande dirette a Ollama.
#     
#     ATTENZIONE: Questa funzione è attualmente commentata
#     e non utilizzata. È stata sostituita dalla versione
#     più avanzata nel modulo chat.py
#     """
#     oll_mess = ollama_message(role='user',content=question)
#     ollama_body_ans = ollama_body_answere(
#         model=MODEL,
#         messages = [oll_mess],
#         stream=False
#     )
#     ollama_body_ans
#     print(ollama_body_ans)
#     body_js = { 'model' : f'{MODEL}', 'messages':[{'role':'user','content':f'{question}'}], 'stream': False}
#     print(body_js)
#     res = requests.post(f'{OLLURL}/api/chat' ,json=body_js )  #json=ollama_body_ans.dict()
    
#     res.raise_for_status()
#     res_js = res.json()
#     print(res_js)
#     response = res_js['message']['content']

#     return response
