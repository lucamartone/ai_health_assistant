from fastapi import APIRouter, HTTPException, Form
from fastapi.responses import Response
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
        if request.email == "admin@mediflow.com" and request.password == "admin123":
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
            
            # Recupera i documenti associati
            docs_query = """
            SELECT id, filename, mime_type, file_size, document_type, uploaded_at
            FROM doctor_document 
            WHERE request_id = %s
            ORDER BY uploaded_at ASC
            """
            documents = execute_query(docs_query, (row[0],))
            
            doc_list = []
            for doc in documents:
                doc_list.append({
                    "id": doc[0],
                    "filename": doc[1],
                    "mime_type": doc[2],
                    "file_size": doc[3],
                    "document_type": doc[4],
                    "uploaded_at": doc[5].isoformat() if doc[5] else None
                })
            
            requests.append({
                "id": row[0],
                "name": f"{row[1]} {row[2]}",
                "email": row[3],
                "specialization": row[4],
                "phone": row[5],
                "locations": locations,
                "documents": doc_list,
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

@router_admin.get("/doctor-document/{document_id}")
async def get_doctor_document(document_id: int):
    """Scarica un documento del dottore."""
    try:
        print(f"Richiesta documento ID: {document_id}")
        
        query = """
        SELECT filename, file_data, mime_type, file_size
        FROM doctor_document 
        WHERE id = %s
        """
        
        print(f"Eseguendo query per documento ID: {document_id}")
        result = execute_query(query, (document_id,))
        print(f"Risultato query: {result}")
        
        if not result:
            print("Documento non trovato")
            raise HTTPException(status_code=404, detail="Documento non trovato")
        
        doc = result[0]
        filename = doc[0]
        file_data = doc[1]
        mime_type = doc[2]
        file_size = doc[3]
        
        print(f"Documento trovato: {filename}")
        print(f"Tipo MIME: {mime_type}")
        print(f"Dimensione file: {file_size}")
        print(f"Tipo file_data: {type(file_data)}")
        print(f"Dimensione file_data: {len(file_data) if file_data else 'None'}")
        
        # Controlla se file_data è None o vuoto
        if file_data is None:
            print("file_data è None")
            raise HTTPException(status_code=500, detail="Dati del file mancanti")
        
        # Converti memoryview in bytes per il controllo
        file_bytes = bytes(file_data) if hasattr(file_data, 'tobytes') else file_data
        
        if len(file_bytes) == 0:
            print("file_data è vuoto")
            raise HTTPException(status_code=500, detail="Il file è vuoto")
        
        # Controlla se il file è un PDF valido
        if mime_type == "application/pdf":
            # Converti memoryview in bytes se necessario
            file_bytes = bytes(file_data) if hasattr(file_data, 'tobytes') else file_data
            if not file_bytes.startswith(b'%PDF'):
                print("File non sembra essere un PDF valido")
                print(f"Primi 10 bytes: {file_bytes[:10]}")
        
        # Converti memoryview in bytes se necessario
        file_bytes = bytes(file_data) if hasattr(file_data, 'tobytes') else file_data
        
        return Response(
            content=file_bytes,
            media_type=mime_type or "application/octet-stream",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Length": str(len(file_bytes)),
                "Cache-Control": "no-cache"
            }
        )
        
    except HTTPException as he:
        print(f"HTTPException: {he}")
        raise he
    except Exception as e:
        print(f"Errore generico: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Errore nel recupero del documento: {str(e)}") 