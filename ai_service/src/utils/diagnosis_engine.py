import logging
from typing import Dict, List, Optional, Any
import json
from datetime import datetime

logger = logging.getLogger(__name__)

class DiagnosisEngine:
    def __init__(self):
        # Load disease database (in production, this would be in a database)
        self.disease_database = self._load_disease_database()
        self.medication_interactions = self._load_medication_interactions()
        self.health_metrics_ranges = self._load_health_metrics_ranges()
        
    async def analyze_diagnosis(
        self,
        symptoms: List[str],
        patient_info: Dict[str, Any],
        medical_history: Optional[Dict[str, Any]] = None,
        test_results: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Analyze symptoms and provide AI-powered diagnosis
        """
        try:
            logger.info(f"Analyzing diagnosis for {len(symptoms)} symptoms")
            
            # Normalize symptoms
            normalized_symptoms = [s.lower().strip() for s in symptoms]
            
            # Find possible conditions
            possible_conditions = self._find_conditions_from_symptoms(normalized_symptoms)
            
            # Rank conditions by likelihood
            ranked_conditions = self._rank_conditions(
                possible_conditions, 
                patient_info, 
                medical_history, 
                test_results
            )
            
            # Get primary diagnosis
            primary_diagnosis = ranked_conditions[0]['condition'] if ranked_conditions else "Condizione non identificata"
            
            # Get differential diagnoses
            differential_diagnoses = [cond['condition'] for cond in ranked_conditions[1:4]]
            
            # Calculate confidence
            confidence = ranked_conditions[0]['confidence'] if ranked_conditions else 0.0
            
            # Generate reasoning
            reasoning = self._generate_reasoning(normalized_symptoms, ranked_conditions)
            
            # Get recommended tests
            recommended_tests = self._get_recommended_tests(normalized_symptoms, primary_diagnosis)
            
            # Get treatment suggestions
            treatment_suggestions = self._get_treatment_suggestions(primary_diagnosis)
            
            # Identify risk factors
            risk_factors = self._identify_risk_factors(patient_info, medical_history)
            
            return {
                'primary_diagnosis': primary_diagnosis,
                'differential_diagnoses': differential_diagnoses,
                'confidence': confidence,
                'reasoning': reasoning,
                'recommended_tests': recommended_tests,
                'treatment_suggestions': treatment_suggestions,
                'risk_factors': risk_factors
            }
            
        except Exception as e:
            logger.error(f"Error in diagnosis analysis: {str(e)}")
            return {
                'primary_diagnosis': "Errore nell'analisi",
                'differential_diagnoses': [],
                'confidence': 0.0,
                'reasoning': "Si è verificato un errore durante l'analisi",
                'recommended_tests': ["Consultare un medico per una valutazione completa"],
                'treatment_suggestions': [],
                'risk_factors': []
            }
    
    async def check_medication_interactions(
        self,
        medications: List[str],
        supplements: Optional[List[str]] = None,
        food_items: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Check for medication interactions
        """
        try:
            interactions = []
            risk_level = "none"
            
            # Check medication-medication interactions
            for i, med1 in enumerate(medications):
                for med2 in medications[i+1:]:
                    interaction = self._check_medication_interaction(med1, med2)
                    if interaction:
                        interactions.append(interaction)
            
            # Check medication-supplement interactions
            if supplements:
                for med in medications:
                    for supp in supplements:
                        interaction = self._check_medication_interaction(med, supp)
                        if interaction:
                            interactions.append(interaction)
            
            # Determine overall risk level
            if interactions:
                risk_level = "moderate" if len(interactions) <= 2 else "high"
            
            return {
                'interactions': interactions,
                'risk_level': risk_level,
                'recommendations': self._get_interaction_recommendations(interactions),
                'contraindications': self._get_contraindications(medications)
            }
            
        except Exception as e:
            logger.error(f"Error checking medication interactions: {str(e)}")
            return {
                'interactions': [],
                'risk_level': 'unknown',
                'recommendations': ['Consultare un farmacista o medico'],
                'contraindications': []
            }
    
    async def analyze_health_metrics(
        self,
        metrics: Dict[str, Any],
        age: int,
        sex: str,
        activity_level: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Analyze health metrics and provide recommendations
        """
        try:
            analysis = {}
            recommendations = []
            risk_factors = []
            
            # Analyze each metric
            for metric_name, value in metrics.items():
                if metric_name in self.health_metrics_ranges:
                    range_info = self.health_metrics_ranges[metric_name]
                    age_group = self._get_age_group(age)
                    
                    if age_group in range_info:
                        normal_range = range_info[age_group]
                        analysis[metric_name] = {
                            'value': value,
                            'normal_range': normal_range,
                            'status': self._evaluate_metric(value, normal_range)
                        }
                        
                        # Add recommendations based on status
                        if analysis[metric_name]['status'] == 'high':
                            recommendations.append(f"Monitorare {metric_name} - valore elevato")
                            risk_factors.append(f"{metric_name} elevato")
                        elif analysis[metric_name]['status'] == 'low':
                            recommendations.append(f"Monitorare {metric_name} - valore basso")
                            risk_factors.append(f"{metric_name} basso")
            
            return {
                'analysis': analysis,
                'normal_ranges': {k: v for k, v in self.health_metrics_ranges.items() if k in metrics},
                'recommendations': recommendations,
                'risk_factors': risk_factors,
                'trends': None  # Could be implemented to track trends over time
            }
            
        except Exception as e:
            logger.error(f"Error analyzing health metrics: {str(e)}")
            return {
                'analysis': {},
                'normal_ranges': {},
                'recommendations': ['Consultare un medico per interpretazione'],
                'risk_factors': [],
                'trends': None
            }
    
    async def get_disease_database(
        self,
        search: Optional[str] = None,
        category: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Get disease database entries"""
        diseases = list(self.disease_database.values())
        
        if search:
            search_lower = search.lower()
            diseases = [d for d in diseases if search_lower in d['name'].lower() or search_lower in d['description'].lower()]
        
        if category:
            diseases = [d for d in diseases if category.lower() in d.get('category', '').lower()]
        
        return diseases[:limit]
    
    async def get_treatment_options(self, condition: str) -> List[Dict[str, Any]]:
        """Get treatment options for a condition"""
        condition_lower = condition.lower()
        
        for disease in self.disease_database.values():
            if condition_lower in disease['name'].lower():
                return disease.get('treatments', [])
        
        return []
    
    async def assess_health_risk(
        self,
        age: int,
        sex: str,
        conditions: Optional[List[str]] = None,
        lifestyle_factors: Optional[List[str]] = None,
        family_history: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Assess health risk based on various factors"""
        risk_score = 0
        risk_factors = []
        
        # Age-based risk
        if age > 65:
            risk_score += 2
            risk_factors.append("Età avanzata")
        elif age > 45:
            risk_score += 1
            risk_factors.append("Età media")
        
        # Sex-based risk factors
        if sex == 'M':
            risk_factors.append("Sesso maschile")
        
        # Condition-based risk
        if conditions:
            for condition in conditions:
                if condition.lower() in ['diabete', 'ipertensione', 'obesità']:
                    risk_score += 2
                    risk_factors.append(condition)
        
        # Lifestyle factors
        if lifestyle_factors:
            for factor in lifestyle_factors:
                if factor.lower() in ['fumo', 'sedentarietà', 'alcol']:
                    risk_score += 1
                    risk_factors.append(factor)
        
        # Determine risk level
        if risk_score >= 5:
            risk_level = "alto"
        elif risk_score >= 3:
            risk_level = "moderato"
        else:
            risk_level = "basso"
        
        return {
            'risk_score': risk_score,
            'risk_level': risk_level,
            'risk_factors': risk_factors,
            'recommendations': self._get_risk_recommendations(risk_level, risk_factors)
        }
    
    async def get_medical_tests(
        self,
        symptoms: Optional[List[str]] = None,
        condition: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get recommended medical tests"""
        tests = []
        
        if symptoms:
            # Add tests based on symptoms
            for symptom in symptoms:
                symptom_tests = self._get_tests_for_symptom(symptom.lower())
                tests.extend(symptom_tests)
        
        if condition:
            # Add tests based on condition
            condition_tests = self._get_tests_for_condition(condition.lower())
            tests.extend(condition_tests)
        
        # Remove duplicates
        unique_tests = []
        seen = set()
        for test in tests:
            if test['name'] not in seen:
                unique_tests.append(test)
                seen.add(test['name'])
        
        return unique_tests
    
    def _load_disease_database(self) -> Dict[str, Any]:
        """Load disease database"""
        return {
            'influenza': {
                'name': 'Influenza',
                'category': 'Infezioni respiratorie',
                'description': 'Infezione virale delle vie respiratorie',
                'symptoms': ['febbre', 'tosse', 'mal di gola', 'stanchezza'],
                'treatments': [
                    {'name': 'Riposo', 'type': 'supportive'},
                    {'name': 'Idratazione', 'type': 'supportive'},
                    {'name': 'Antipiretici', 'type': 'medication'}
                ]
            },
            'diabete': {
                'name': 'Diabete',
                'category': 'Malattie metaboliche',
                'description': 'Disturbo del metabolismo del glucosio',
                'symptoms': ['sete eccessiva', 'minzione frequente', 'stanchezza'],
                'treatments': [
                    {'name': 'Dieta controllata', 'type': 'lifestyle'},
                    {'name': 'Esercizio fisico', 'type': 'lifestyle'},
                    {'name': 'Insulina', 'type': 'medication'}
                ]
            }
        }
    
    def _load_medication_interactions(self) -> Dict[str, Any]:
        """Load medication interactions database"""
        return {
            'aspirina': {
                'warfarin': {'severity': 'high', 'description': 'Aumenta rischio sanguinamento'},
                'ibuprofene': {'severity': 'moderate', 'description': 'Aumenta rischio effetti collaterali'}
            }
        }
    
    def _load_health_metrics_ranges(self) -> Dict[str, Any]:
        """Load normal ranges for health metrics"""
        return {
            'blood_pressure': {
                'adult': {'min': 90, 'max': 140},
                'elderly': {'min': 90, 'max': 150}
            },
            'heart_rate': {
                'adult': {'min': 60, 'max': 100},
                'elderly': {'min': 60, 'max': 100}
            },
            'temperature': {
                'all': {'min': 36.1, 'max': 37.2}
            }
        }
    
    def _find_conditions_from_symptoms(self, symptoms: List[str]) -> List[Dict[str, Any]]:
        """Find possible conditions based on symptoms"""
        conditions = []
        
        for disease in self.disease_database.values():
            matching_symptoms = [s for s in symptoms if s in disease['symptoms']]
            if matching_symptoms:
                confidence = len(matching_symptoms) / len(disease['symptoms'])
                conditions.append({
                    'condition': disease['name'],
                    'confidence': confidence,
                    'matching_symptoms': matching_symptoms
                })
        
        return conditions
    
    def _rank_conditions(
        self,
        conditions: List[Dict[str, Any]],
        patient_info: Dict[str, Any],
        medical_history: Optional[Dict[str, Any]],
        test_results: Optional[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Rank conditions by likelihood"""
        # Simple ranking by confidence for now
        # In a real implementation, you would use more sophisticated algorithms
        return sorted(conditions, key=lambda x: x['confidence'], reverse=True)
    
    def _generate_reasoning(self, symptoms: List[str], conditions: List[Dict[str, Any]]) -> str:
        """Generate reasoning for the diagnosis"""
        if not conditions:
            return "I sintomi non corrispondono a condizioni note nel database."
        
        top_condition = conditions[0]
        reasoning = f"I sintomi {', '.join(symptoms)} suggeriscono {top_condition['condition']} "
        reasoning += f"(confidenza: {top_condition['confidence']:.1%}). "
        
        if len(conditions) > 1:
            reasoning += f"Altre possibilità includono {', '.join([c['condition'] for c in conditions[1:3]])}."
        
        return reasoning
    
    def _get_recommended_tests(self, symptoms: List[str], condition: str) -> List[str]:
        """Get recommended medical tests"""
        tests = []
        
        if 'febbre' in symptoms:
            tests.append('Esame del sangue completo')
        
        if 'dolore al petto' in symptoms:
            tests.append('ECG')
            tests.append('Radiografia del torace')
        
        if 'difficoltà respiratorie' in symptoms:
            tests.append('Spirometria')
            tests.append('Radiografia del torace')
        
        return tests
    
    def _get_treatment_suggestions(self, condition: str) -> List[str]:
        """Get treatment suggestions for a condition"""
        condition_lower = condition.lower()
        
        for disease in self.disease_database.values():
            if condition_lower in disease['name'].lower():
                return [t['name'] for t in disease.get('treatments', [])]
        
        return ['Consultare un medico per trattamento specifico']
    
    def _identify_risk_factors(self, patient_info: Dict[str, Any], medical_history: Optional[Dict[str, Any]]) -> List[str]:
        """Identify risk factors"""
        risk_factors = []
        
        age = patient_info.get('age', 0)
        if age > 65:
            risk_factors.append('Età avanzata')
        
        if medical_history:
            if 'diabete' in medical_history:
                risk_factors.append('Diabete')
            if 'ipertensione' in medical_history:
                risk_factors.append('Ipertensione')
        
        return risk_factors
    
    def _check_medication_interaction(self, med1: str, med2: str) -> Optional[Dict[str, Any]]:
        """Check for interaction between two medications"""
        med1_lower = med1.lower()
        med2_lower = med2.lower()
        
        if med1_lower in self.medication_interactions:
            if med2_lower in self.medication_interactions[med1_lower]:
                return {
                    'medication1': med1,
                    'medication2': med2,
                    'severity': self.medication_interactions[med1_lower][med2_lower]['severity'],
                    'description': self.medication_interactions[med1_lower][med2_lower]['description']
                }
        
        return None
    
    def _get_interaction_recommendations(self, interactions: List[Dict[str, Any]]) -> List[str]:
        """Get recommendations for medication interactions"""
        recommendations = []
        
        for interaction in interactions:
            if interaction['severity'] == 'high':
                recommendations.append(f"Evitare l'assunzione di {interaction['medication1']} e {interaction['medication2']}")
            else:
                recommendations.append(f"Monitorare gli effetti di {interaction['medication1']} e {interaction['medication2']}")
        
        return recommendations
    
    def _get_contraindications(self, medications: List[str]) -> List[str]:
        """Get contraindications for medications"""
        # Placeholder implementation
        return []
    
    def _get_age_group(self, age: int) -> str:
        """Get age group for health metrics"""
        if age >= 65:
            return 'elderly'
        else:
            return 'adult'
    
    def _evaluate_metric(self, value: float, normal_range: Dict[str, float]) -> str:
        """Evaluate if a metric is within normal range"""
        if value < normal_range['min']:
            return 'low'
        elif value > normal_range['max']:
            return 'high'
        else:
            return 'normal'
    
    def _get_risk_recommendations(self, risk_level: str, risk_factors: List[str]) -> List[str]:
        """Get recommendations based on risk level"""
        recommendations = []
        
        if risk_level == 'alto':
            recommendations.append('Consultare un medico per valutazione completa')
            recommendations.append('Monitorare regolarmente i parametri vitali')
        elif risk_level == 'moderato':
            recommendations.append('Mantenere uno stile di vita sano')
            recommendations.append('Controlli medici regolari')
        else:
            recommendations.append('Mantenere le abitudini attuali')
        
        return recommendations
    
    def _get_tests_for_symptom(self, symptom: str) -> List[Dict[str, Any]]:
        """Get tests for a specific symptom"""
        test_map = {
            'febbre': [{'name': 'Esame del sangue', 'type': 'laboratory'}],
            'dolore al petto': [{'name': 'ECG', 'type': 'cardiac'}],
            'difficoltà respiratorie': [{'name': 'Spirometria', 'type': 'respiratory'}]
        }
        
        return test_map.get(symptom, [])
    
    def _get_tests_for_condition(self, condition: str) -> List[Dict[str, Any]]:
        """Get tests for a specific condition"""
        test_map = {
            'diabete': [{'name': 'Glicemia', 'type': 'laboratory'}],
            'ipertensione': [{'name': 'Monitoraggio pressione', 'type': 'cardiac'}]
        }
        
        return test_map.get(condition, []) 