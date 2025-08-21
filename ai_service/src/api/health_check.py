from fastapi import APIRouter, HTTPException
from datetime import datetime
import psutil
import logging
from typing import Dict, Any

from ..utils.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/")
async def health_check():
    """
    Health check endpoint per verificare lo stato del servizio
    """
    try:
        # Get system information
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        health_status = {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "service": "MediFlow",
            "version": settings.api_version,
            "system": {
                "cpu_usage": f"{cpu_percent}%",
                "memory_usage": f"{memory.percent}%",
                "memory_available": f"{memory.available / (1024**3):.2f} GB",
                "disk_usage": f"{disk.percent}%",
                "disk_free": f"{disk.free / (1024**3):.2f} GB"
            }
        }
        
        # Check if system resources are within acceptable limits
        if cpu_percent > 90 or memory.percent > 90 or disk.percent > 90:
            health_status["status"] = "warning"
            health_status["message"] = "High resource usage detected"
        
        return health_status
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")

@router.get("/ready")
async def readiness_check():
    """
    Readiness check per verificare se il servizio è pronto a ricevere traffico
    """
    try:
        # Check if all required services are available
        checks = {
            "database": await check_database_connection(),
            "redis": await check_redis_connection(),
            "ai_models": await check_ai_models(),
            "openai": await check_openai_connection()
        }
        
        all_ready = all(checks.values())
        
        readiness_status = {
            "ready": all_ready,
            "timestamp": datetime.now().isoformat(),
            "checks": checks
        }
        
        if not all_ready:
            raise HTTPException(status_code=503, detail="Service not ready")
        
        return readiness_status
        
    except Exception as e:
        logger.error(f"Readiness check failed: {str(e)}")
        raise HTTPException(status_code=503, detail=f"Service not ready: {str(e)}")

@router.get("/live")
async def liveness_check():
    """
    Liveness check per verificare se il servizio è in esecuzione
    """
    return {
        "alive": True,
        "timestamp": datetime.now().isoformat(),
        "service": "MediFlow"
    }

@router.get("/metrics")
async def get_metrics():
    """
    Ottieni metriche dettagliate del servizio
    """
    try:
        # System metrics
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Process metrics
        process = psutil.Process()
        process_memory = process.memory_info()
        
        metrics = {
            "timestamp": datetime.now().isoformat(),
            "system": {
                "cpu_percent": cpu_percent,
                "memory_percent": memory.percent,
                "memory_used_gb": memory.used / (1024**3),
                "memory_available_gb": memory.available / (1024**3),
                "disk_percent": disk.percent,
                "disk_used_gb": disk.used / (1024**3),
                "disk_free_gb": disk.free / (1024**3)
            },
            "process": {
                "memory_rss_mb": process_memory.rss / (1024**2),
                "memory_vms_mb": process_memory.vms / (1024**2),
                "cpu_percent": process.cpu_percent(),
                "num_threads": process.num_threads(),
                "create_time": datetime.fromtimestamp(process.create_time()).isoformat()
            },
            "service": {
                "version": settings.api_version,
                "environment": "development" if settings.debug else "production"
            }
        }
        
        return metrics
        
    except Exception as e:
        logger.error(f"Error getting metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving metrics: {str(e)}")

async def check_database_connection() -> bool:
    """
    Verifica la connessione al database
    """
    try:
        # In a real implementation, you would test the actual database connection
        # For now, we'll return True as a placeholder
        return True
    except Exception as e:
        logger.error(f"Database connection check failed: {str(e)}")
        return False

async def check_redis_connection() -> bool:
    """
    Verifica la connessione a Redis
    """
    try:
        # In a real implementation, you would test the actual Redis connection
        # For now, we'll return True as a placeholder
        return True
    except Exception as e:
        logger.error(f"Redis connection check failed: {str(e)}")
        return False

async def check_ai_models() -> bool:
    """
    Verifica se i modelli AI sono caricati e funzionanti
    """
    try:
        # In a real implementation, you would test if AI models are loaded
        # For now, we'll return True as a placeholder
        return True
    except Exception as e:
        logger.error(f"AI models check failed: {str(e)}")
        return False

async def check_openai_connection() -> bool:
    """
    Verifica la connessione a OpenAI
    """
    try:
        # In a real implementation, you would test the OpenAI API connection
        # For now, we'll return True as a placeholder
        return True
    except Exception as e:
        logger.error(f"OpenAI connection check failed: {str(e)}")
        return False 