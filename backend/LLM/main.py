from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv
import httpx
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

# Configuration for Hugging Face
HF_API_TOKEN = os.getenv("HF_API_TOKEN")
HF_MODEL = os.getenv("HF_MODEL", "mistralai/Mistral-7B-Instruct-v0.2")
HF_API_URL = f"https://api-inference.huggingface.co/models/{HF_MODEL}"
TEMPERATURE = float(os.getenv("TEMPERATURE", "0.7"))
MAX_TOKENS = int(os.getenv("MAX_TOKENS", "500"))
PORT = int(os.getenv("PORT", "5001"))

headers = {
    "Authorization": f"Bearer {HF_API_TOKEN}"
}

class HealthQuery(BaseModel):
    query: str
    context: Optional[str] = None
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None

async def query_huggingface(prompt: str, temperature: float, max_tokens: int):
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": max_tokens,
            "temperature": temperature
        }
    }
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(HF_API_URL, headers=headers, json=payload)
        if response.status_code == 503:
            raise HTTPException(status_code=503, detail="Model is loading or unavailable on Hugging Face. Please try again later.")
        if response.status_code != 200:
            logger.error(f"Hugging Face API error: {response.text}")
            raise HTTPException(status_code=500, detail=f"Hugging Face API error: {response.text}")
        result = response.json()
        # Try to extract the generated text (format may vary by model)
        if isinstance(result, list) and "generated_text" in result[0]:
            return result[0]["generated_text"]
        elif isinstance(result, dict) and "generated_text" in result:
            return result["generated_text"]
        elif isinstance(result, list) and "text" in result[0]:
            return result[0]["text"]
        else:
            logger.error(f"Unexpected Hugging Face response: {result}")
            raise HTTPException(status_code=500, detail="Unexpected response from Hugging Face API.")

@app.post("/api/health-query")
async def process_health_query(query: HealthQuery):
    try:
        # Prepare the system message
        system_message = """Sei un assistente sanitario esperto. Fornisci informazioni accurate e basate su evidenze scientifiche.
        Sii chiaro che sei un'IA e non un sostituto per consigli medici professionali.
        Rispondi sempre in italiano in modo chiaro e comprensibile.
        Se non sei sicuro di una risposta, ammettilo onestamente.
        Non fornire mai diagnosi specifiche o prescrizioni mediche."""
        
        # Prepare the user message
        user_message = query.query
        if query.context:
            user_message = f"Contesto: {query.context}\n\nDomanda: {query.query}"

        # Prepare the full prompt
        full_prompt = f"{system_message}\n\nUtente: {user_message}\n\nAssistente:"

        # Use custom parameters if provided, otherwise use defaults
        temperature = query.temperature if query.temperature is not None else TEMPERATURE
        max_tokens = query.max_tokens if query.max_tokens is not None else MAX_TOKENS

        logger.info(f"Processing query with Hugging Face model {HF_MODEL}")
        response_text = await query_huggingface(full_prompt, temperature, max_tokens)
        return {
            "response": response_text,
            "status": "success",
            "model": HF_MODEL
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        error_msg = f"Server error: {str(e)}"
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

@app.get("/api/health")
async def health_check():
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"https://api-inference.huggingface.co/models/{HF_MODEL}", headers=headers)
            if response.status_code == 200:
                return {
                    "status": "healthy",
                    "model_status": "available",
                    "model": HF_MODEL
                }
            else:
                return {
                    "status": "degraded",
                    "model_status": "unavailable",
                    "error": response.text
                }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "degraded",
            "model_status": "unavailable",
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT) 