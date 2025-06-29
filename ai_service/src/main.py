from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from datetime import datetime
import os
from dotenv import load_dotenv

from .api.chat import router as chat_router
from .api.symptoms import router as symptoms_router
from .api.diagnosis import router as diagnosis_router
from .api.health_check import router as health_router
from .utils.config import settings

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="AI Health Assistant",
    description="Microservizio AI per assistenza sanitaria intelligente",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router, prefix="/health", tags=["Health"])
app.include_router(chat_router, prefix="/ai/chat", tags=["Chat AI"])
app.include_router(symptoms_router, prefix="/ai/symptoms", tags=["Analisi Sintomi"])
app.include_router(diagnosis_router, prefix="/ai/diagnosis", tags=["Diagnosi AI"])

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AI Health Assistant Microservice",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/info")
async def info():
    """Service information"""
    return {
        "service": "AI Health Assistant",
        "version": "1.0.0",
        "description": "Microservizio AI per assistenza sanitaria",
        "endpoints": {
            "chat": "/ai/chat",
            "symptoms": "/ai/symptoms", 
            "diagnosis": "/ai/diagnosis",
            "health": "/health"
        },
        "docs": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=8002,
        reload=True,
        log_level="info"
    ) 