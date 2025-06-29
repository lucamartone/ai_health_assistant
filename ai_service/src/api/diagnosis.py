from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
import logging

from ..models.schemas import (
    DiagnosisRequest, DiagnosisResponse,
    MedicationInteractionRequest, MedicationInteractionResponse,
    HealthMetricsRequest, HealthMetricsResponse
)
from ..utils.diagnosis_engine import DiagnosisEngine
from ..utils.auth import get_current_user
from ..utils.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize Diagnosis Engine
diagnosis_engine = DiagnosisEngine()

@router.post("/analyze", response_model=DiagnosisResponse)
async def analyze_diagnosis(
    request: DiagnosisRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Analizza i sintomi e fornisce una diagnosi AI con raccomandazioni
    """
    try:
        logger.info(f"Diagnosis analysis request from user {current_user.get('id')}")
        
        # Validate request
        if not request.symptoms:
            raise HTTPException(status_code=400, detail="Almeno un sintomo è richiesto")
        
        if not request.patient_info:
            raise HTTPException(status_code=400, detail="Informazioni del paziente richieste")
        
        # Perform diagnosis analysis
        diagnosis = await diagnosis_engine.analyze_diagnosis(
            symptoms=request.symptoms,
            patient_info=request.patient_info,
            medical_history=request.medical_history,
            test_results=request.test_results
        )
        
        return DiagnosisResponse(
            primary_diagnosis=diagnosis['primary_diagnosis'],
            differential_diagnoses=diagnosis['differential_diagnoses'],
            confidence=diagnosis['confidence'],
            reasoning=diagnosis['reasoning'],
            recommended_tests=diagnosis['recommended_tests'],
            treatment_suggestions=diagnosis['treatment_suggestions'],
            risk_factors=diagnosis['risk_factors']
        )
        
    except Exception as e:
        logger.error(f"Error in diagnosis analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore nell'analisi della diagnosi: {str(e)}")

@router.post("/medication-interactions", response_model=MedicationInteractionResponse)
async def check_medication_interactions(
    request: MedicationInteractionRequest,
    current_user: Optional[dict] = Depends(get_current_user)
):
    """
    Verifica le interazioni tra farmaci, integratori e alimenti
    """
    try:
        logger.info(f"Medication interaction check for {len(request.medications)} medications")
        
        if not request.medications:
            raise HTTPException(status_code=400, detail="Almeno un farmaco è richiesto")
        
        interactions = await diagnosis_engine.check_medication_interactions(
            medications=request.medications,
            supplements=request.supplements,
            food_items=request.food_items
        )
        
        return MedicationInteractionResponse(
            interactions=interactions['interactions'],
            risk_level=interactions['risk_level'],
            recommendations=interactions['recommendations'],
            contraindications=interactions['contraindications']
        )
        
    except Exception as e:
        logger.error(f"Error checking medication interactions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore nel controllo delle interazioni: {str(e)}")

@router.post("/health-metrics", response_model=HealthMetricsResponse)
async def analyze_health_metrics(
    request: HealthMetricsRequest,
    current_user: Optional[dict] = Depends(get_current_user)
):
    """
    Analizza i parametri vitali e fornisce raccomandazioni
    """
    try:
        logger.info(f"Health metrics analysis request")
        
        if not request.metrics:
            raise HTTPException(status_code=400, detail="Almeno un parametro vitale è richiesto")
        
        analysis = await diagnosis_engine.analyze_health_metrics(
            metrics=request.metrics,
            age=request.age,
            sex=request.sex,
            activity_level=request.activity_level
        )
        
        return HealthMetricsResponse(
            analysis=analysis['analysis'],
            normal_ranges=analysis['normal_ranges'],
            recommendations=analysis['recommendations'],
            risk_factors=analysis['risk_factors'],
            trends=analysis.get('trends')
        )
        
    except Exception as e:
        logger.error(f"Error analyzing health metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore nell'analisi dei parametri vitali: {str(e)}")

@router.get("/disease-database")
async def get_disease_database(
    search: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 20
):
    """
    Ottieni informazioni dal database delle malattie
    """
    try:
        diseases = await diagnosis_engine.get_disease_database(
            search=search,
            category=category,
            limit=limit
        )
        return {"diseases": diseases}
        
    except Exception as e:
        logger.error(f"Error getting disease database: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore nel recupero del database: {str(e)}")

@router.get("/treatment-options/{condition}")
async def get_treatment_options(condition: str):
    """
    Ottieni opzioni di trattamento per una condizione specifica
    """
    try:
        treatments = await diagnosis_engine.get_treatment_options(condition)
        return {"condition": condition, "treatments": treatments}
        
    except Exception as e:
        logger.error(f"Error getting treatment options: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore nel recupero delle opzioni di trattamento: {str(e)}")

@router.get("/risk-assessment")
async def assess_health_risk(
    age: int,
    sex: str,
    conditions: Optional[List[str]] = None,
    lifestyle_factors: Optional[List[str]] = None,
    family_history: Optional[List[str]] = None
):
    """
    Valuta il rischio di salute basato su fattori demografici e medici
    """
    try:
        risk_assessment = await diagnosis_engine.assess_health_risk(
            age=age,
            sex=sex,
            conditions=conditions,
            lifestyle_factors=lifestyle_factors,
            family_history=family_history
        )
        return risk_assessment
        
    except Exception as e:
        logger.error(f"Error in risk assessment: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore nella valutazione del rischio: {str(e)}")

@router.get("/medical-tests")
async def get_medical_tests(
    symptoms: Optional[List[str]] = None,
    condition: Optional[str] = None
):
    """
    Suggerisce test medici basati su sintomi o condizione
    """
    try:
        tests = await diagnosis_engine.get_medical_tests(
            symptoms=symptoms,
            condition=condition
        )
        return {"tests": tests}
        
    except Exception as e:
        logger.error(f"Error getting medical tests: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore nel recupero dei test medici: {str(e)}") 