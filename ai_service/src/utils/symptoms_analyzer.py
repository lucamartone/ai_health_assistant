import logging
from typing import Dict, List, Optional, Any
import json
from datetime import datetime

logger = logging.getLogger(__name__)

class SymptomsAnalyzer:
    def __init__(self):
        # Load symptom database (in production, this would be in a database)
        self.symptom_database = self._load_symptom_database()
        self.emergency_symptoms = self._load_emergency_symptoms()
        self.symptom_categories = self._load_symptom_categories()
        
    async def analyze_symptoms(
        self,
        symptoms: List[str],
        age: Optional[int] = None,
        sex: Optional[str] = None,
        medical_history: Optional[List[str]] = None,
        medications: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Analyze symptoms and provide possible conditions and recommendations
        """
        try:
            logger.info(f"Analyzing {len(symptoms)} symptoms")
            
            # Normalize symptoms
            normalized_symptoms = [s.lower().strip() for s in symptoms]
            
            # Check for emergency conditions first
            emergency_check = self._check_emergency_conditions(normalized_symptoms)
            if emergency_check['is_emergency']:
                return {
                    'possible_conditions': emergency_check['conditions'],
                    'severity_level': 'emergency',
                    'recommendations': ['Cerca assistenza medica immediata'],
                    'urgency': 'immediate',
                    'confidence_score': 0.9
                }
            
            # Analyze symptoms for possible conditions
            possible_conditions = self._find_possible_conditions(
                normalized_symptoms, age, sex, medical_history, medications
            )
            
            # Assess severity
            severity_level = self._assess_severity_level(normalized_symptoms, possible_conditions)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(
                normalized_symptoms, severity_level, age, sex
            )
            
            # Determine urgency
            urgency = self._determine_urgency(severity_level, possible_conditions)
            
            # Calculate confidence score
            confidence_score = self._calculate_confidence_score(
                normalized_symptoms, possible_conditions
            )
            
            return {
                'possible_conditions': possible_conditions,
                'severity_level': severity_level,
                'recommendations': recommendations,
                'urgency': urgency,
                'confidence_score': confidence_score
            }
            
        except Exception as e:
            logger.error(f"Error analyzing symptoms: {str(e)}")
            return {
                'possible_conditions': [],
                'severity_level': 'unknown',
                'recommendations': ['Consulta un medico per una valutazione completa'],
                'urgency': 'routine',
                'confidence_score': 0.0
            }
    
    async def check_emergency(
        self,
        symptoms: List[str],
        age: int,
        sex: str,
        location: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Check if symptoms require immediate medical attention
        """
        try:
            normalized_symptoms = [s.lower().strip() for s in symptoms]
            
            # Check for emergency symptoms
            emergency_check = self._check_emergency_conditions(normalized_symptoms)
            
            # Additional age and sex specific checks
            if age > 65:
                # Elderly patients may need more urgent care for certain symptoms
                if any(s in normalized_symptoms for s in ['confusione', 'vertigini', 'caduta']):
                    emergency_check['urgency_level'] = 'urgent'
            
            if sex == 'F' and age > 40:
                # Women over 40 may need urgent care for chest pain
                if 'dolore al petto' in normalized_symptoms:
                    emergency_check['urgency_level'] = 'urgent'
            
            return emergency_check
            
        except Exception as e:
            logger.error(f"Error in emergency check: {str(e)}")
            return {
                'is_emergency': False,
                'urgency_level': 'low',
                'recommended_action': 'Monitora i sintomi e consulta un medico se peggiorano',
                'emergency_services_needed': False,
                'symptoms_to_monitor': symptoms
            }
    
    async def get_common_symptoms(self) -> List[str]:
        """Get list of common symptoms for autocomplete"""
        return [
            "mal di testa", "febbre", "tosse", "mal di gola", "nausea",
            "vomito", "diarrea", "dolore addominale", "stanchezza",
            "vertigini", "dolore al petto", "difficoltà respiratorie",
            "dolore articolare", "rigidità muscolare", "eruzione cutanea",
            "prurito", "gonfiore", "sanguinamento", "confusione",
            "perdita di coscienza", "convulsioni", "paralisi"
        ]
    
    async def get_symptom_categories(self) -> List[Dict[str, Any]]:
        """Get symptom categories"""
        return self.symptom_categories
    
    async def get_symptoms_by_category(self, category: str) -> List[str]:
        """Get symptoms for a specific category"""
        for cat in self.symptom_categories:
            if cat['name'].lower() == category.lower():
                return cat['symptoms']
        return []
    
    async def assess_severity(self, symptoms: List[str]) -> Dict[str, Any]:
        """Assess severity of symptom combination"""
        try:
            normalized_symptoms = [s.lower().strip() for s in symptoms]
            severity_level = self._assess_severity_level(normalized_symptoms, [])
            
            return {
                'severity_level': severity_level,
                'risk_factors': self._identify_risk_factors(normalized_symptoms),
                'monitoring_advice': self._get_monitoring_advice(severity_level)
            }
        except Exception as e:
            logger.error(f"Error assessing severity: {str(e)}")
            return {
                'severity_level': 'unknown',
                'risk_factors': [],
                'monitoring_advice': 'Consulta un medico per una valutazione'
            }
    
    async def get_symptom_patterns(self) -> List[Dict[str, Any]]:
        """Get common symptom patterns for different conditions"""
        return [
            {
                'condition': 'Influenza',
                'symptoms': ['febbre', 'tosse', 'mal di gola', 'stanchezza', 'dolori muscolari'],
                'duration': '7-10 giorni',
                'severity': 'moderata'
            },
            {
                'condition': 'Gastroenterite',
                'symptoms': ['nausea', 'vomito', 'diarrea', 'dolore addominale', 'febbre'],
                'duration': '1-3 giorni',
                'severity': 'da lieve a moderata'
            },
            {
                'condition': 'Emicrania',
                'symptoms': ['mal di testa intenso', 'nausea', 'sensibilità alla luce', 'vertigini'],
                'duration': '4-72 ore',
                'severity': 'moderata a grave'
            }
        ]
    
    def _load_symptom_database(self) -> Dict[str, Any]:
        """Load symptom database"""
        return {
            'mal di testa': {
                'conditions': ['emicrania', 'cefalea tensiva', 'sinusite', 'ipertensione'],
                'severity': 'moderata',
                'urgency': 'within_week'
            },
            'febbre': {
                'conditions': ['infezione', 'influenza', 'COVID-19', 'infezione urinaria'],
                'severity': 'moderata',
                'urgency': 'within_24h'
            },
            'dolore al petto': {
                'conditions': ['angina', 'infarto', 'reflusso gastroesofageo', 'ansia'],
                'severity': 'alta',
                'urgency': 'immediate'
            },
            'difficoltà respiratorie': {
                'conditions': ['asma', 'bronchite', 'polmonite', 'embolia polmonare'],
                'severity': 'alta',
                'urgency': 'immediate'
            }
        }
    
    def _load_emergency_symptoms(self) -> List[str]:
        """Load emergency symptoms"""
        return [
            'dolore al petto', 'difficoltà respiratorie', 'perdita di coscienza',
            'convulsioni', 'paralisi', 'sanguinamento grave', 'trauma cranico',
            'dolore addominale intenso', 'vomito con sangue', 'feci nere'
        ]
    
    def _load_symptom_categories(self) -> List[Dict[str, Any]]:
        """Load symptom categories"""
        return [
            {
                'name': 'Sistema Respiratorio',
                'symptoms': ['tosse', 'mal di gola', 'difficoltà respiratorie', 'naso chiuso']
            },
            {
                'name': 'Sistema Cardiovascolare',
                'symptoms': ['dolore al petto', 'palpitazioni', 'vertigini', 'gonfiore alle gambe']
            },
            {
                'name': 'Sistema Gastrointestinale',
                'symptoms': ['nausea', 'vomito', 'diarrea', 'dolore addominale', 'bruciore di stomaco']
            },
            {
                'name': 'Sistema Nervoso',
                'symptoms': ['mal di testa', 'vertigini', 'confusione', 'convulsioni', 'paralisi']
            },
            {
                'name': 'Sistema Muscoloscheletrico',
                'symptoms': ['dolore articolare', 'rigidità muscolare', 'gonfiore', 'limitazione movimento']
            }
        ]
    
    def _check_emergency_conditions(self, symptoms: List[str]) -> Dict[str, Any]:
        """Check for emergency conditions"""
        emergency_symptoms = [s for s in symptoms if s in self.emergency_symptoms]
        
        if emergency_symptoms:
            return {
                'is_emergency': True,
                'urgency_level': 'immediate',
                'recommended_action': 'Cerca assistenza medica immediata',
                'emergency_services_needed': True,
                'symptoms_to_monitor': emergency_symptoms,
                'conditions': ['Emergenza medica - richiede valutazione immediata']
            }
        
        return {
            'is_emergency': False,
            'urgency_level': 'low',
            'recommended_action': 'Monitora i sintomi',
            'emergency_services_needed': False,
            'symptoms_to_monitor': symptoms,
            'conditions': []
        }
    
    def _find_possible_conditions(
        self,
        symptoms: List[str],
        age: Optional[int],
        sex: Optional[str],
        medical_history: Optional[List[str]],
        medications: Optional[List[str]]
    ) -> List[Dict[str, Any]]:
        """Find possible conditions based on symptoms"""
        conditions = []
        
        for symptom in symptoms:
            if symptom in self.symptom_database:
                symptom_info = self.symptom_database[symptom]
                for condition in symptom_info['conditions']:
                    conditions.append({
                        'condition': condition,
                        'symptom': symptom,
                        'confidence': 0.7,  # Placeholder
                        'severity': symptom_info['severity']
                    })
        
        # Remove duplicates and sort by confidence
        unique_conditions = {}
        for cond in conditions:
            if cond['condition'] not in unique_conditions:
                unique_conditions[cond['condition']] = cond
            else:
                # Increase confidence if multiple symptoms point to same condition
                unique_conditions[cond['condition']]['confidence'] += 0.1
        
        return list(unique_conditions.values())
    
    def _assess_severity_level(self, symptoms: List[str], conditions: List[Dict[str, Any]]) -> str:
        """Assess overall severity level"""
        if any(s in self.emergency_symptoms for s in symptoms):
            return 'emergency'
        
        severity_scores = []
        for symptom in symptoms:
            if symptom in self.symptom_database:
                severity = self.symptom_database[symptom]['severity']
                if severity == 'alta':
                    severity_scores.append(3)
                elif severity == 'moderata':
                    severity_scores.append(2)
                else:
                    severity_scores.append(1)
        
        if not severity_scores:
            return 'bassa'
        
        avg_severity = sum(severity_scores) / len(severity_scores)
        
        if avg_severity >= 2.5:
            return 'alta'
        elif avg_severity >= 1.5:
            return 'moderata'
        else:
            return 'bassa'
    
    def _generate_recommendations(
        self,
        symptoms: List[str],
        severity_level: str,
        age: Optional[int],
        sex: Optional[str]
    ) -> List[str]:
        """Generate recommendations based on symptoms and severity"""
        recommendations = []
        
        if severity_level == 'emergency':
            recommendations.append('Cerca assistenza medica immediata')
        elif severity_level == 'alta':
            recommendations.append('Consulta un medico entro 24 ore')
        elif severity_level == 'moderata':
            recommendations.append('Consulta un medico entro una settimana')
        else:
            recommendations.append('Monitora i sintomi')
        
        # Age-specific recommendations
        if age and age > 65:
            recommendations.append('Considera una visita medica per monitoraggio')
        
        # Symptom-specific recommendations
        if 'febbre' in symptoms:
            recommendations.append('Monitora la temperatura regolarmente')
        
        if 'dolore al petto' in symptoms:
            recommendations.append('Evita sforzi fisici')
        
        return recommendations
    
    def _determine_urgency(self, severity_level: str, conditions: List[Dict[str, Any]]) -> str:
        """Determine urgency level"""
        if severity_level == 'emergency':
            return 'immediate'
        elif severity_level == 'alta':
            return 'within_24h'
        elif severity_level == 'moderata':
            return 'within_week'
        else:
            return 'routine'
    
    def _calculate_confidence_score(self, symptoms: List[str], conditions: List[Dict[str, Any]]) -> float:
        """Calculate confidence score for the analysis"""
        if not symptoms:
            return 0.0
        
        # Base confidence on number of symptoms and conditions
        symptom_score = min(len(symptoms) / 5.0, 1.0)  # More symptoms = higher confidence
        condition_score = min(len(conditions) / 3.0, 1.0)  # More conditions = higher confidence
        
        return (symptom_score + condition_score) / 2.0
    
    def _identify_risk_factors(self, symptoms: List[str]) -> List[str]:
        """Identify risk factors based on symptoms"""
        risk_factors = []
        
        if 'dolore al petto' in symptoms:
            risk_factors.append('Malattie cardiovascolari')
        
        if 'difficoltà respiratorie' in symptoms:
            risk_factors.append('Malattie respiratorie')
        
        if 'confusione' in symptoms:
            risk_factors.append('Problemi neurologici')
        
        return risk_factors
    
    def _get_monitoring_advice(self, severity_level: str) -> str:
        """Get monitoring advice based on severity"""
        if severity_level == 'emergency':
            return 'Richiede monitoraggio medico immediato'
        elif severity_level == 'alta':
            return 'Monitora attentamente e consulta un medico se peggiora'
        elif severity_level == 'moderata':
            return 'Monitora i sintomi e consulta un medico se persistono'
        else:
            return 'Monitora i sintomi e consulta un medico se peggiorano' 