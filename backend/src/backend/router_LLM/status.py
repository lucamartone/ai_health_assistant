from fastapi import FastAPI, APIRouter
from pydantic import BaseModel
from typing import List
import httpx

router_LLM_status = APIRouter()

MODEL = 'gemma3:1b'
OLLAMA_URL = 'http://ollama:11434'

class ollama_message (BaseModel):
    role:str
    content:str

class ollama_body_answere (BaseModel):
    model:str
    messages: List[ollama_message]
    stream: bool

class answer (BaseModel):
    answer:str

@router_LLM_status.get("/get_status")
async def get_status():
    try:
        async with httpx.AsyncClient() as client:
            # Verifica che Ollama risponda
            response = await client.get(f"{OLLAMA_URL}/api/tags")
            if response.status_code == 200:
                data = response.json()
                models = data.get("models", [])
                
                # Cerca il modello llama3.2
                llama_model = next((model for model in models if "llama3.2:latest" in model.get("name", "")), None)
                
                if llama_model:
                    return {
                        "status": "ready",
                        "model": llama_model["name"],
                        "size": llama_model.get("size", 0),
                        "message": "Modello AI pronto per l'uso"
                    }
                else:
                    return {
                        "status": "downloading",
                        "message": "Modello AI in fase di download..."
                    }
            else:
                return {
                    "status": "error",
                    "message": "Ollama non risponde"
                }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Errore nella connessione a Ollama: {str(e)}"
        }


# @router_LLM_status.post('/ask')
# def ask (question:str):
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
