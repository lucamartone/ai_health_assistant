from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"

class ChatMessage(BaseModel):
    role: MessageRole
    content: str
    timestamp: Optional[datetime] = None

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, description="Messaggio dell'utente")
    conversation_id: Optional[str] = None
    user_id: Optional[int] = None
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    message: str
    conversation_id: str
    timestamp: datetime
    confidence: Optional[float] = None
    suggestions: Optional[List[str]] = None

class SymptomAnalysisRequest(BaseModel):
    symptoms: List[str] = Field(..., min_items=1, description="Lista dei sintomi")
    age: Optional[int] = Field(None, ge=0, le=120, description="Età del paziente")
    sex: Optional[str] = Field(None, pattern="^(M|F)$", description="Sesso del paziente (M/F)")
    medical_history: Optional[List[str]] = None
    medications: Optional[List[str]] = None

class SymptomAnalysisResponse(BaseModel):
    possible_conditions: List[Dict[str, Any]]
    severity_level: str  # "low", "medium", "high", "emergency"
    recommendations: List[str]
    urgency: str  # "immediate", "within_24h", "within_week", "routine"
    confidence_score: float

class DiagnosisRequest(BaseModel):
    symptoms: List[str]
    patient_info: Dict[str, Any]
    medical_history: Optional[Dict[str, Any]] = None
    test_results: Optional[Dict[str, Any]] = None

class DiagnosisResponse(BaseModel):
    primary_diagnosis: str
    differential_diagnoses: List[str]
    confidence: float
    reasoning: str
    recommended_tests: List[str]
    treatment_suggestions: List[str]
    risk_factors: List[str]

class HealthAdviceRequest(BaseModel):
    topic: str = Field(..., description="Argomento per cui richiedere consigli")
    user_profile: Optional[Dict[str, Any]] = None
    specific_concerns: Optional[List[str]] = None

class HealthAdviceResponse(BaseModel):
    advice: str
    sources: List[str]
    disclaimer: str
    related_topics: List[str]

class EmergencyCheckRequest(BaseModel):
    symptoms: List[str]
    age: int
    sex: str
    location: Optional[str] = None

class EmergencyCheckResponse(BaseModel):
    is_emergency: bool
    urgency_level: str  # "immediate", "urgent", "moderate", "low"
    recommended_action: str
    emergency_services_needed: bool
    symptoms_to_monitor: List[str]

class MedicationInteractionRequest(BaseModel):
    medications: List[str]
    supplements: Optional[List[str]] = None
    food_items: Optional[List[str]] = None

class MedicationInteractionResponse(BaseModel):
    interactions: List[Dict[str, Any]]
    risk_level: str  # "none", "low", "moderate", "high", "severe"
    recommendations: List[str]
    contraindications: List[str]

class HealthMetricsRequest(BaseModel):
    metrics: Dict[str, Any]  # blood_pressure, heart_rate, temperature, etc.
    age: int
    sex: str
    activity_level: Optional[str] = None

class HealthMetricsResponse(BaseModel):
    analysis: Dict[str, Any]
    normal_ranges: Dict[str, Any]
    recommendations: List[str]
    risk_factors: List[str]
    trends: Optional[Dict[str, Any]] = None

class AIErrorResponse(BaseModel):
    error: str
    message: str
    timestamp: datetime
    request_id: Optional[str] = None 