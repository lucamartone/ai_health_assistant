from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv
import httpx

# Load environment variables
load_dotenv()

app = FastAPI(title="AI Health Assistant LLM Backend")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_API_URL = "http://localhost:11434/api/generate"

class HealthQuery(BaseModel):
    query: str
    context: Optional[str] = None

@app.post("/api/health-query")
async def process_health_query(query: HealthQuery):
    try:
        # Prepare the system message
        system_message = """Sei un assistente sanitario esperto. Fornisci informazioni accurate e basate su evidenze scientifiche.
        Sii chiaro che sei un'IA e non un sostituto per consigli medici professionali.
        Rispondi sempre in italiano in modo chiaro e comprensibile."""
        
        # Prepare the user message
        user_message = query.query
        if query.context:
            user_message = f"Contesto: {query.context}\n\nDomanda: {query.query}"

        # Prepare the full prompt
        full_prompt = f"{system_message}\n\nUtente: {user_message}\n\nAssistente:"

        # Call Ollama API
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    OLLAMA_API_URL,
                    json={
                        "model": "mistral",
                        "prompt": full_prompt,
                        "stream": False,
                        "options": {
                            "temperature": 0.7,
                            "num_predict": 500
                        }
                    }
                )
                
                if response.status_code != 200:
                    raise Exception(f"Ollama API returned status code {response.status_code}")

                result = response.json()
                return {
                    "response": result["response"],
                    "status": "success"
                }

        except Exception as e:
            print(f"Ollama API Error: {str(e)}")  # Log the error
            raise HTTPException(
                status_code=500,
                detail=f"Ollama API error: {str(e)}"
            )

    except Exception as e:
        print(f"Server Error: {str(e)}")  # Log the error
        raise HTTPException(
            status_code=500,
            detail=f"Server error: {str(e)}"
        )

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001) 