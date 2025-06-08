from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv
from openai import OpenAI

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

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

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

        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # or "gpt-3.5-turbo" for a more economical option
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ],
            temperature=0.7,
            max_tokens=500
        )

        return {
            "response": response.choices[0].message.content,
            "status": "success"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001) 