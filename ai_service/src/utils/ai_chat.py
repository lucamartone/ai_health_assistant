import google.generativeai as genai
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
import json
import asyncio
import httpx
from ..utils.config import settings

logger = logging.getLogger(__name__)

class AIChatService:
    def __init__(self):
        self.openai_client = None
        self.google_model = None
        self.conversations = {}  # In production, use Redis or database
        self.ai_config = settings.get_ai_config()
        self.initialize_ai_client()
        
    def initialize_ai_client(self):
        """Initialize AI client based on selected provider"""
        try:
            if settings.ai_provider.lower() == "google":
                self._initialize_google()
        except Exception as e:
            logger.error(f"Failed to initialize AI client: {str(e)}")
            logger.warning("Using mock responses as fallback")
    
    
    def _initialize_google(self):
        """Initialize Google AI (Gemini) client"""
        try:
            if self.ai_config["api_key"]:
                genai.configure(api_key=self.ai_config["api_key"])
                
                # List available models to debug
                try:
                    models = genai.list_models()
                    available_models = [model.name for model in models]
                    logger.info(f"Available Google AI models: {available_models}")
                except Exception as e:
                    logger.warning(f"Could not list models: {e}")
                
                # Try to initialize the model
                try:
                    self.google_model = genai.GenerativeModel(
                        model_name=self.ai_config["model"],
                        generation_config=genai.types.GenerationConfig(
                            max_output_tokens=self.ai_config["max_tokens"],
                            temperature=self.ai_config["temperature"]
                        )
                    )
                    logger.info(f"Google AI (Gemini) client initialized successfully with model: {self.ai_config['model']}")
                except Exception as model_error:
                    logger.error(f"Failed to initialize model {self.ai_config['model']}: {model_error}")
                    # Try fallback model
                    try:
                        self.google_model = genai.GenerativeModel("gemini-1.5-flash")
                        logger.info("Using fallback model: gemini-1.5-flash")
                    except Exception as fallback_error:
                        logger.error(f"Fallback model also failed: {fallback_error}")
                        raise
            else:
                logger.warning("Google API key not provided, using mock responses")
        except Exception as e:
            logger.error(f"Failed to initialize Google AI client: {str(e)}")
            self.google_model = None
    
    async def get_response(
        self, 
        message: str, 
        conversation_id: str,
        user_context: Optional[Dict[str, Any]] = None,
        user_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Get AI response for a user message
        """
        try:
            # Get conversation history
            conversation = self.conversations.get(conversation_id, [])
            logger.info(f"Conversation ID: {conversation_id}, History length: {len(conversation)}")
            
            # Add user message to conversation
            conversation.append({
                "role": "user",
                "content": message,
                "timestamp": datetime.now().isoformat()
            })
            
            # Prepare system prompt
            system_prompt = self._get_system_prompt(user_context)
            
            # Get AI response based on provider
            if settings.ai_provider.lower() == "google" and self.google_model:
                response = await self._get_google_response(message, system_prompt, conversation)
           
            # Add AI response to conversation
            conversation.append({
                "role": "assistant",
                "content": response["message"],
                "timestamp": datetime.now().isoformat()
            })
            
            # Store updated conversation
            self.conversations[conversation_id] = conversation
            logger.info(f"Updated conversation stored. Total conversations: {len(self.conversations)}")
            
            return response
            
        except Exception as e:
            logger.error(f"Error getting AI response: {str(e)}")
            return {
                "message": "Mi dispiace, si è verificato un errore. Riprova più tardi.",
                "confidence": 0.0,
                "suggestions": []
            }
    
    async def get_health_advice(
        self, 
        topic: str, 
        user_profile: Optional[Dict[str, Any]] = None,
        specific_concerns: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Get health advice on a specific topic
        """
        try:
            # Prepare prompt for health advice
            prompt = f"Fornisci consigli sanitari su: {topic}"
            
            if user_profile:
                prompt += f"\nProfilo utente: {json.dumps(user_profile, ensure_ascii=False)}"
            
            if specific_concerns:
                prompt += f"\nPreoccupazioni specifiche: {', '.join(specific_concerns)}"
            
            prompt += "\n\nFornisci consigli pratici, sicuri e basati su evidenze scientifiche."
            
            if settings.ai_provider.lower() == "google" and self.google_model:
                response = await self._get_google_health_advice(prompt)
                advice = response["message"]
            else:
                advice = await self._get_mock_health_advice(topic)
            
            return {
                "advice": advice,
                "sources": ["Linee guida sanitarie internazionali", "Studi clinici peer-reviewed"],
                "related_topics": self._get_related_topics(topic)
            }
            
        except Exception as e:
            logger.error(f"Error getting health advice: {str(e)}")
            return {
                "advice": "Non è possibile fornire consigli al momento. Consulta un medico per assistenza.",
                "sources": [],
                "related_topics": []
            }
    
    async def get_conversation_history(self, conversation_id: str) -> List[Dict[str, Any]]:
        """Get conversation history"""
        return self.conversations.get(conversation_id, [])
    
    async def delete_conversation(self, conversation_id: str, user_id: int):
        """Delete a conversation"""
        if conversation_id in self.conversations:
            del self.conversations[conversation_id]
    
    async def get_user_conversations(
        self, 
        user_id: int, 
        limit: int = 10, 
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Get user conversations (placeholder implementation)"""
        # In a real implementation, you would query the database
        return []
    
    def _get_system_prompt(self, user_context: Optional[Dict[str, Any]] = None) -> str:
        """Get system prompt for chat"""
        prompt = """Sei un assistente sanitario AI professionale e compassionevole. Il tuo ruolo è:

1. Fornire informazioni sanitarie accurate e basate su evidenze
2. Aiutare a comprendere sintomi e condizioni mediche
3. Suggerire quando consultare un medico
4. Offrire consigli su stili di vita sani
5. Riconoscere situazioni di emergenza e guidare verso assistenza medica immediata
6. Suggerire specializzazioni mediche in base alla diagnosi, le specializzazioni sono:
    "Allergologia", "Anestesia e Rianimazione", "Cardiologia", "Chirurgia Generale",
  "Dermatologia", "Endocrinologia", "Gastroenterologia", "Ginecologia",
  "Medicina Generale", "Nefrologia", "Neurologia", "Oculistica", "Oncologia",
  "Ortopedia", "Otorinolaringoiatria", "Pediatria", "Psichiatria", "Psicologia",
  "Radiologia", "Urologia".



Rispondi sempre in italiano e sii utile ma cauto nelle raccomandazioni mediche."""
        print(user_context)
        
        if user_context:
            prompt += f"\n\nContesto utente: {json.dumps(user_context, ensure_ascii=False)}"
        
        return prompt
    
    def _get_health_advice_prompt(self) -> str:
        """Get system prompt for health advice"""
        return """Sei un esperto di salute pubblica. Fornisci consigli sanitari:

1. Basati su evidenze scientifiche
2. Sicuri e pratici
3. Adattati al contesto italiano
4. Con disclaimer appropriati
5. Che incoraggino la consultazione medica quando necessario

Usa un tono informativo ma accessibile."""
    
    async def _get_google_response(self, message: str, system_prompt: str, conversation: List[Dict]) -> Dict[str, Any]:
        """Get response from Google AI (Gemini)"""
        try:
            # Prepare conversation history for Gemini
            chat = self.google_model.start_chat(history=[])
            
            # Add system prompt as first message
            full_prompt = f"{system_prompt}\n\nUtente: {message}"
            
            response = await asyncio.to_thread(
                chat.send_message,
                full_prompt
            )
            
            content = response.text
            
            # Generate suggestions based on response
            suggestions = self._generate_suggestions(content)
            
            return {
                "message": content,
                "confidence": 0.9,
                "suggestions": suggestions,
                "provider": "google",
                "model": self.ai_config["model"]
            }
            
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Error getting Google AI response: {error_msg}")
            
            # Check if it's a quota/rate limit error
            if "429" in error_msg or "quota" in error_msg.lower() or "rate limit" in error_msg.lower():
                logger.warning("Google AI quota exceeded or rate limited, using mock response")
                return await self._get_mock_response(message)
            
            # For other errors, also fallback to mock
            logger.warning("Google AI error, falling back to mock response")
            return await self._get_mock_response(message)
    
    
    async def _get_google_health_advice(self, prompt: str) -> Dict[str, Any]:
        """Get health advice from Google AI"""
        try:
            system_prompt = self._get_health_advice_prompt()
            full_prompt = f"{system_prompt}\n\n{prompt}"
            
            response = await asyncio.to_thread(
                self.google_model.generate_content,
                full_prompt
            )
            
            return {
                "message": response.text,
                "provider": "google",
                "model": self.ai_config["model"]
            }
            
        except Exception as e:
            logger.error(f"Error getting Google health advice: {str(e)}")
            return {"message": "Non è possibile fornire consigli al momento."}
    
    
    async def _get_mock_response(self, message: str) -> Dict[str, Any]:
        """Get mock response when AI service is unavailable"""
        mock_responses = {
            "salute": "Ciao! Sono qui per aiutarti con domande sulla salute. Come posso esserti utile oggi?",
            "sintomi": "I sintomi possono essere indicativi di diverse condizioni. Ti consiglio di consultare un medico per una valutazione accurata.",
            "mal di testa": "Il mal di testa può avere molte cause. Se è persistente o molto intenso, consulta un medico. Nel frattempo, riposo e idratazione possono aiutare.",
            "febbre": "La febbre è spesso un segno di infezione. Se è alta (oltre 38°C) o persistente, consulta un medico.",
            "default": "Grazie per la tua domanda. Sono qui per fornire informazioni sanitarie generali, ma ricorda di consultare sempre un medico per problemi specifici."
        }
        
        message_lower = message.lower()
        response = mock_responses["default"]
        
        for key, value in mock_responses.items():
            if key in message_lower:
                response = value
                break
        
        return {
            "message": response,
            "confidence": 0.5,
            "suggestions": ["Consulta un medico", "Mantieni uno stile di vita sano", "Fai controlli regolari"],
            "provider": "mock",
            "model": "mock"
        }
    
    async def _get_mock_health_advice(self, topic: str) -> str:
        """Get mock health advice"""
        return f"Per quanto riguarda {topic}, ti consiglio di consultare un medico per consigli personalizzati. Mantieni uno stile di vita sano con dieta equilibrata e attività fisica regolare."
    
    def _generate_suggestions(self, response: str) -> List[str]:
        """Generate follow-up suggestions based on response"""
        suggestions = []
        
        if "medico" in response.lower():
            suggestions.append("Prenota una visita medica")
        
        if "sintomi" in response.lower():
            suggestions.append("Monitora i sintomi")
        
        if "stile di vita" in response.lower():
            suggestions.append("Migliora lo stile di vita")
        
        if not suggestions:
            suggestions = ["Hai altre domande?", "Vuoi sapere di più su questo argomento?"]
        
        return suggestions[:3]  # Limit to 3 suggestions
    
    def _get_related_topics(self, topic: str) -> List[str]:
        """Get related health topics"""
        topic_map = {
            "dieta": ["Nutrizione", "Peso", "Metabolismo"],
            "esercizio": ["Fitness", "Sport", "Attività fisica"],
            "sonno": ["Riposo", "Insonnia", "Qualità del sonno"],
            "stress": ["Ansia", "Rilassamento", "Benessere mentale"],
            "default": ["Prevenzione", "Stile di vita sano", "Controlli medici"]
        }
        
        topic_lower = topic.lower()
        for key, topics in topic_map.items():
            if key in topic_lower:
                return topics
        
        return topic_map["default"] 