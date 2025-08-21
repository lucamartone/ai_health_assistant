import os
import re
import time
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from fastapi.middleware.cors import CORSMiddleware

from backend.router_profile.router_profile import router_profile
from backend.router_patient.router_patient import router_patient
from backend.router_doctor.router_doctor import router_doctor
from backend.router_admin import router_admin

load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8001")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

app = FastAPI(
    title="MediFlow API",
    description="API per l'assistente sanitario AI",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ✅ CORS - DEVE ESSERE L'ULTIMO middleware per funzionare correttamente
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^http://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["Set-Cookie"],
    max_age=3600,
)

# Middleware per logging delle richieste
class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        print(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.3f}s")
        return response

# Middleware per headers di sicurezza
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        # Headers di sicurezza
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
            "connect-src *; "
            "frame-ancestors 'none';"
        )
        response.headers["Content-Security-Policy"] = csp

        return response

# ✅ Middleware di logging (solo in dev)
if ENVIRONMENT == "development":
    app.add_middleware(LoggingMiddleware)

# ✅ Middleware per redirect HTTPS e host trust solo in prod
if ENVIRONMENT == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["yourdomain.com", "www.yourdomain.com"]
    )
    app.add_middleware(HTTPSRedirectMiddleware)

# ✅ Middleware per headers di sicurezza
# app.add_middleware(SecurityHeadersMiddleware)

# ✅ Health check semplice
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": ENVIRONMENT,
        "timestamp": time.time()
    }

# ✅ Include i router
app.include_router(router_profile, prefix="/profile", tags=["generic"])
app.include_router(router_patient, prefix="/patient", tags=["patient"])
app.include_router(router_doctor, prefix="/doctor", tags=["doctor"])
app.include_router(router_admin, prefix="/admin", tags=["admin"])
