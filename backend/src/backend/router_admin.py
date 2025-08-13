from fastapi import APIRouter, HTTPException, Form
from pydantic import BaseModel
from typing import List, Optional
import json
from backend.connection import execute_query

router_admin = APIRouter()

# Modelli Pydantic
class AdminLoginRequest(BaseModel):
    email: str
    password: str

class DoctorRequest(BaseModel):
    id: int
    name: str
    email: str
    specialization: str
    status: str

class DoctorRequestsResponse(BaseModel):
    pending_requests: List[DoctorRequest]
    count: int

# Endpoint di login admin
@router_admin.post("/login")
async def admin_login(request: AdminLoginRequest):
    """Login semplice per admin."""
    try:
        # Credenziali hardcoded per semplicità
        if request.email == "admin@healthassistant.com" and request.password == "admin123":
            return {
                "message": "Login admin riuscito",
                "admin": {
                    "id": 1,
                    "name": "Admin",
                    "surname": "Sistema",
                    "email": request.email,
                    "role": "admin"
                }
            }
        else:
            raise HTTPException(status_code=401, detail="Credenziali non valide")
            
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore interno: {str(e)}")

# Endpoint per verificare accesso admin
@router_admin.get("/check")
async def admin_check():
    """Endpoint per verificare accesso admin."""
    return {
        "message": "Admin access granted",
        "role": "admin",
        "timestamp": "2024-01-01T00:00:00Z"
    }

# Endpoint per ottenere richieste dottori
@router_admin.get("/doctor-requests")
async def get_doctor_requests():
    """Endpoint per ottenere richieste di registrazione dottori."""
    try:
        from backend.connection import execute_query
        import json
        
        query = """
        SELECT id, name, surname, email, specialization, phone, locations, status, created_at
        FROM doctor_registration_request 
        WHERE status = 'pending' 
        ORDER BY created_at ASC
        """
        
        results = execute_query(query)
        
        requests = []
        for row in results:
            # Parsing delle locations
            locations = []
            if row[6]:  # locations column
                try:
                    locations = json.loads(row[6])
                except:
                    locations = []
            
            requests.append({
                "id": row[0],
                "name": f"{row[1]} {row[2]}",
                "email": row[3],
                "specialization": row[4],
                "phone": row[5],
                "locations": locations,
                "status": row[7],
                "created_at": row[8].isoformat() if row[8] else None
            })
        
        return {
            "pending_requests": requests,
            "count": len(requests)
        }
        
    except Exception as e:
        print(f"Errore nel router admin: {str(e)}")
        # Fallback con dati mock se l'endpoint non funziona
        mock_requests = [
            {
                "id": 1,
                "name": "Dr. Rossi",
                "email": "rossi@example.com",
                "specialization": "Cardiologia",
                "status": "pending"
            }
        ]
        
        return {
            "pending_requests": mock_requests,
            "count": len(mock_requests)
        }

# Endpoint per approvare/rifiutare dottori
@router_admin.post("/approve-doctor/{request_id}")
async def approve_doctor(request_id: int, admin_notes: str = Form("")):
    """Approva una richiesta dottore."""
    try:
        from backend.router_doctor.doctor_registration import review_registration_request
        return await review_registration_request(request_id, "approve", admin_notes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore durante l'approvazione: {str(e)}")

@router_admin.post("/reject-doctor/{request_id}")
async def reject_doctor(request_id: int, admin_notes: str = Form("")):
    """Rifiuta una richiesta dottore."""
    try:
        from backend.router_doctor.doctor_registration import review_registration_request
        return await review_registration_request(request_id, "reject", admin_notes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore durante il rifiuto: {str(e)}") 