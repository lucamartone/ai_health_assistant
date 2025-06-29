from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # API Configuration
    api_title: str = "AI Health Assistant"
    api_version: str = "1.0.0"
    api_description: str = "Microservizio AI per assistenza sanitaria"
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8002
    debug: bool = False
    
    # AI Provider Configuration
    ai_provider: str = "google"
    
    # Google AI Studio (Gemini) Configuration
    google_api_key: Optional[str] = None
    google_model: str = "gemini-1.5-pro"
    google_max_tokens: int = 1000
    google_temperature: float = 0.7
    
    # Database Configuration
    postgres_host: str = "database"
    postgres_port: int = 5432
    postgres_db: str = "HealthDB"
    postgres_user: str = "admin"
    postgres_password: str = "userpwd"
    
    # Redis Configuration (for caching and queues)
    redis_host: str = "redis"
    redis_port: int = 6379
    redis_db: int = 0
    
    # Security
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # AI Model Configuration
    symptoms_model_path: Optional[str] = None
    diagnosis_model_path: Optional[str] = None
    
    # Logging
    log_level: str = "INFO"
    log_file: Optional[str] = None
    
    # Rate Limiting
    rate_limit_requests: int = 100
    rate_limit_window: int = 3600  # 1 hour
    
    class Config:
        env_file = ".env"
        case_sensitive = False

    def get_database_url(self) -> str:
        """Get database URL from environment or construct from components"""
        return f"postgresql://{self.postgres_user}:{self.postgres_password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
    
    def get_redis_url(self) -> str:
        """Get Redis URL"""
        return f"redis://{self.redis_host}:{self.redis_port}/{self.redis_db}"
    
    def get_ai_config(self) -> dict:
        """Get AI configuration based on selected provider"""
        if self.ai_provider.lower() == "deepseek":
            return {
                "api_key": self.deepseek_api_key,
                "model": self.deepseek_model,
                "max_tokens": self.deepseek_max_tokens,
                "temperature": self.deepseek_temperature,
                "base_url": self.deepseek_base_url
            }
        elif self.ai_provider.lower() == "google":
            return {
                "api_key": self.google_api_key,
                "model": self.google_model,
                "max_tokens": self.google_max_tokens,
                "temperature": self.google_temperature
            }
        else:  # Default to OpenAI
            return {
                "api_key": self.openai_api_key,
                "model": self.openai_model,
                "max_tokens": self.openai_max_tokens,
                "temperature": self.openai_temperature,
                "base_url": self.openai_base_url
            }

# Create settings instance
settings = Settings()

# Environment-specific configurations
if os.getenv("ENVIRONMENT") == "production":
    settings.debug = False
    settings.log_level = "WARNING"
elif os.getenv("ENVIRONMENT") == "development":
    settings.debug = True
    settings.log_level = "DEBUG" 