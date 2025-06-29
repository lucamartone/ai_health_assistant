from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
import logging

from ..models.schemas import (
    SymptomAnalysisRequest, SymptomAnalysisResponse,
    EmergencyCheckRequest, EmergencyCheckResponse
)
from ..utils.symptoms_analyzer import SymptomsAnalyzer
from ..utils.auth import get_current_user
from ..utils.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize Symptoms Analyzer
symptoms_analyzer = SymptomsAnalyzer()

@router.post("/analyze", response_model=SymptomAnalysisResponse)
async def analyze_symptoms(
    request: SymptomAnalysisRequest,
    current_user: Optional[dict] = Depends(get_current_user)
):
    """
    Analizza i sintomi e fornisce possibili condizioni e raccomandazioni
    """
    try:
        logger.info(f"Symptom analysis request for {len(request.symptoms)} symptoms")
        
        # Validate symptoms
        if not request.symptoms:
            raise HTTPException(status_code=400, detail="Almeno un sintomo è richiesto")
        
        # Analyze symptoms
        analysis = await symptoms_analyzer.analyze_symptoms(
            symptoms=request.symptoms,
            age=request.age,
            sex=request.sex,
            medical_history=request.medical_history,
            medications=request.medications
        )
        
        return SymptomAnalysisResponse(
            possible_conditions=analysis['possible_conditions'],
            severity_level=analysis['severity_level'],
            recommendations=analysis['recommendations'],
            urgency=analysis['urgency'],
            confidence_score=analysis['confidence_score']
        )
        
    except Exception as e:
        logger.error(f"Error in symptom analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore nell'analisi dei sintomi: {str(e)}")

@router.post("/emergency-check", response_model=EmergencyCheckResponse)
async def check_emergency(
    request: EmergencyCheckRequest,
    current_user: Optional[dict] = Depends(get_current_user)
):
    """
    Verifica se i sintomi richiedono attenzione medica immediata
    """
    try:
        logger.info(f"Emergency check request for {len(request.symptoms)} symptoms")
        
        # Check for emergency conditions
        emergency_check = await symptoms_analyzer.check_emergency(
            symptoms=request.symptoms,
            age=request.age,
            sex=request.sex,
            location=request.location
        )
        
        return EmergencyCheckResponse(
            is_emergency=emergency_check['is_emergency'],
            urgency_level=emergency_check['urgency_level'],
            recommended_action=emergency_check['recommended_action'],
            emergency_services_needed=emergency_check['emergency_services_needed'],
            symptoms_to_monitor=emergency_check['symptoms_to_monitor']
        )
        
    except Exception as e:
        logger.error(f"Error in emergency check: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore nel controllo di emergenza: {str(e)}")

@router.get("/common-symptoms")
async def get_common_symptoms():
    """
    Ottieni una lista di sintomi comuni per l'autocompletamento
    """
    try:
        symptoms = await symptoms_analyzer.get_common_symptoms()
        return {"symptoms": symptoms}
        
    except Exception as e:
        logger.error(f"Error getting common symptoms: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore nel recupero dei sintomi comuni: {str(e)}")

@router.get("/symptom-categories")
async def get_symptom_categories():
    """
    Ottieni le categorie di sintomi disponibili
    """
    try:
        categories = await symptoms_analyzer.get_symptom_categories()
        return {"categories": categories}
        
    except Exception as e:
        logger.error(f"Error getting symptom categories: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore nel recupero delle categorie: {str(e)}")

@router.get("/symptoms-by-category/{category}")
async def get_symptoms_by_category(category: str):
    """
    Ottieni i sintomi per una categoria specifica
    """
    try:
        symptoms = await symptoms_analyzer.get_symptoms_by_category(category)
        return {"category": category, "symptoms": symptoms}
        
    except Exception as e:
        logger.error(f"Error getting symptoms by category: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore nel recupero dei sintomi: {str(e)}")

@router.post("/symptom-severity")
async def assess_symptom_severity(
    symptoms: List[str],
    current_user: Optional[dict] = Depends(get_current_user)
):
    """
    Valuta la gravità di una combinazione di sintomi
    """
    try:
        if not symptoms:
            raise HTTPException(status_code=400, detail="Almeno un sintomo è richiesto")
        
        severity = await symptoms_analyzer.assess_severity(symptoms)
        return severity
        
    except Exception as e:
        logger.error(f"Error assessing symptom severity: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore nella valutazione della gravità: {str(e)}")

@router.get("/symptom-patterns")
async def get_symptom_patterns():
    """
    Ottieni pattern comuni di sintomi per diverse condizioni
    """
    try:
        patterns = await symptoms_analyzer.get_symptom_patterns()
        return {"patterns": patterns}
        
    except Exception as e:
        logger.error(f"Error getting symptom patterns: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore nel recupero dei pattern: {str(e)}") 