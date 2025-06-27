import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import time

from backend.router_profile.router_profile import router_profile
from backend.router_patient.router_patient import router_patient
from backend.router_doctor.router_doctor import router_doctor

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8001")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

app = FastAPI(
    title="AI Health Assistant API",
    description="API per l'assistente sanitario AI",
    version="1.0.0",
    docs_url="/docs" if ENVIRONMENT == "development" else None,
    redoc_url="/redoc" if ENVIRONMENT == "development" else None,
)

# Middleware per aggiungere headers di sicurezza
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Headers di sicurezza moderni
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        # Content Security Policy
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self'; "
            "connect-src 'self' http://localhost:8001; "
            "frame-ancestors 'none';"
        )
        response.headers["Content-Security-Policy"] = csp
        
        return response

# Middleware per logging delle richieste
class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        
        print(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.3f}s")
        return response

# Configurazione CORS moderna
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",     # Vite dev server
        "http://127.0.0.1:3000",     # Alternative localhost
        "http://localhost:5173",     # Vite default port
        "https://yourdomain.com",    # Produzione (da configurare)
    ] if ENVIRONMENT == "development" else [
        "https://yourdomain.com",    # Solo dominio di produzione
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=[
        "Accept",
        "Accept-Language",
        "Content-Language",
        "Content-Type",
        "Authorization",
        "X-Requested-With",
    ],
    expose_headers=["Set-Cookie"],
    max_age=3600,  # Cache preflight per 1 ora
)

# Aggiungi middleware di sicurezza
app.add_middleware(SecurityHeadersMiddleware)

# Aggiungi middleware di logging in development
if ENVIRONMENT == "development":
    app.add_middleware(LoggingMiddleware)

# Trusted Host middleware per produzione
if ENVIRONMENT == "production":
    app.add_middleware(
        TrustedHostMiddleware, 
        allowed_hosts=["yourdomain.com", "www.yourdomain.com"]
    )
    # HTTPS redirect in produzione
    app.add_middleware(HTTPSRedirectMiddleware)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": ENVIRONMENT,
        "timestamp": time.time()
    }

# Include routers
app.include_router(router_profile, prefix="/profile", tags=["generic"])
app.include_router(router_patient, prefix="/patient", tags=["patient"])
app.include_router(router_doctor, prefix="/doctor", tags=["doctor"])