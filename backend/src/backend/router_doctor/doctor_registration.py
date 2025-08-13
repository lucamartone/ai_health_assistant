from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from fastapi.responses import JSONResponse
from typing import List, Optional
from backend.connection import execute_query
from backend.router_profile.pydantic.schemas import RegisterDoctorRequest
from passlib.context import CryptContext
import json
from datetime import datetime, timedelta

router_doctor_registration = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router_doctor_registration.post("/request")
async def submit_registration_request(
    name: str = Form(...),
    surname: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    sex: str = Form(...),
    specialization: str = Form(...),
    locations: str = Form(...),  # JSON string
    documents: Optional[List[UploadFile]] = File(None)
):
    """Endpoint per inviare una richiesta di registrazione dottore."""
    try:
        # Validazione dati
        if sex not in ['M', 'F']:
            raise HTTPException(status_code=400, detail="Sesso deve essere 'M' o 'F'")
        
        # Validazione password
        if len(password) < 8:
            raise HTTPException(status_code=400, detail="Password deve essere di almeno 8 caratteri")
        
        # Controllo se email esiste già
        check_email = "SELECT id FROM account WHERE email = %s"
        if execute_query(check_email, (email,)):
            raise HTTPException(status_code=400, detail="Email già registrata")
        
        # Controllo se esiste già una richiesta pendente
        check_request = "SELECT id FROM doctor_registration_request WHERE email = %s AND status = 'pending'"
        if execute_query(check_request, (email,)):
            raise HTTPException(status_code=400, detail="Richiesta già inviata e in attesa di approvazione")
        
        # Hash password
        hashed_password = pwd_context.hash(password)
        
        # Parsing locations
        try:
            locations_data = json.loads(locations)
            if not isinstance(locations_data, list) or len(locations_data) == 0:
                raise HTTPException(status_code=400, detail="Almeno una location è richiesta")
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Formato locations non valido")
        
        # Gestione documenti
        documents_data = []
        if documents:
            for doc in documents:
                if doc.size > 10 * 1024 * 1024:  # 10MB limit
                    raise HTTPException(status_code=400, detail=f"Documento {doc.filename} troppo grande (max 10MB)")
                
                file_content = await doc.read()
                documents_data.append({
                    "filename": doc.filename,
                    "mime_type": doc.content_type,
                    "size": doc.size,
                    "data": file_content.hex()  # Convert to hex for storage
                })
        
        # Inserimento richiesta
        insert_query = """
        INSERT INTO doctor_registration_request (
            name, surname, email, password, sex, specialization, 
            locations, documents, status, created_at, expires_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days')
        RETURNING id
        """
        
        params = (
            name, surname, email, hashed_password, sex, specialization,
            json.dumps(locations_data), json.dumps(documents_data) if documents_data else None
        )
        
        result = execute_query(insert_query, params, commit=True)
        
        if not result or not result[0]:
            raise HTTPException(status_code=500, detail="Errore durante l'invio della richiesta")
        
        return {
            "message": "Richiesta di registrazione inviata con successo",
            "request_id": result[0][0],
            "status": "pending",
            "expires_at": (datetime.now() + timedelta(days=30)).isoformat()
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore interno: {str(e)}")

@router_doctor_registration.get("/status/{email}")
async def check_registration_status(email: str):
    """Endpoint per controllare lo stato di una richiesta di registrazione."""
    try:
        query = """
        SELECT id, status, created_at, expires_at, admin_notes, reviewed_at
        FROM doctor_registration_request 
        WHERE email = %s 
        ORDER BY created_at DESC 
        LIMIT 1
        """
        
        result = execute_query(query, (email,))
        
        if not result:
            return {"status": "not_found", "message": "Nessuna richiesta trovata per questa email"}
        
        request_data = result[0]
        
        return {
            "request_id": request_data[0],
            "status": request_data[1],
            "created_at": request_data[2].isoformat() if request_data[2] else None,
            "expires_at": request_data[3].isoformat() if request_data[3] else None,
            "admin_notes": request_data[4],
            "reviewed_at": request_data[5].isoformat() if request_data[5] else None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore interno: {str(e)}")

@router_doctor_registration.get("/pending")
async def get_pending_requests():
    """Endpoint per ottenere tutte le richieste pendenti (solo per admin)."""
    try:
        query = """
        SELECT id, name, surname, email, sex, specialization, 
               locations, documents, created_at, expires_at
        FROM doctor_registration_request 
        WHERE status = 'pending' 
        ORDER BY created_at ASC
        """
        
        results = execute_query(query)
        
        requests = []
        for row in results:
            requests.append({
                "id": row[0],
                "name": row[1],
                "surname": row[2],
                "email": row[3],
                "sex": row[4],
                "specialization": row[5],
                "locations": json.loads(row[6]) if row[6] else [],
                "documents": json.loads(row[7]) if row[7] else [],
                "created_at": row[8].isoformat() if row[8] else None,
                "expires_at": row[9].isoformat() if row[9] else None
            })
        
        return {"pending_requests": requests, "count": len(requests)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore interno: {str(e)}")

@router_doctor_registration.post("/review/{request_id}")
async def review_registration_request(
    request_id: int,
    action: str = Form(...),  # 'approve' or 'reject'
    admin_notes: Optional[str] = Form(None),
    admin_id: int = Form(...)
):
    """Endpoint per approvare o rifiutare una richiesta di registrazione (solo per admin)."""
    try:
        if action not in ['approve', 'reject']:
            raise HTTPException(status_code=400, detail="Azione deve essere 'approve' o 'reject'")
        
        # Verifica che la richiesta esista e sia pendente
        check_query = "SELECT * FROM doctor_registration_request WHERE id = %s AND status = 'pending'"
        request_data = execute_query(check_query, (request_id,))
        
        if not request_data:
            raise HTTPException(status_code=404, detail="Richiesta non trovata o già processata")
        
        request = request_data[0]
        
        if action == 'approve':
            # Crea l'account dottore
            try:
                # Inserimento account
                account_query = """
                INSERT INTO account (
                    name, surname, email, password, sex, role, status, created_at
                ) VALUES (%s, %s, %s, %s, %s, 'doctor', 'active', CURRENT_TIMESTAMP)
                RETURNING id
                """
                
                account_result = execute_query(account_query, (
                    request[1], request[2], request[3], request[4], request[5]
                ), commit=True)
                
                if not account_result or not account_result[0]:
                    raise Exception("Errore durante la creazione dell'account")
                
                doctor_id = account_result[0][0]
                
                # Inserimento dottore
                doctor_query = """
                INSERT INTO doctor (id, specialization, is_verified, verification_date, verification_admin_id)
                VALUES (%s, %s, TRUE, CURRENT_TIMESTAMP, %s)
                """
                execute_query(doctor_query, (doctor_id, request[6], admin_id), commit=True)
                
                # Inserimento locations
                locations_data = json.loads(request[7]) if request[7] else []
                for loc in locations_data:
                    location_query = """
                    INSERT INTO location (doctor_id, address, latitude, longitude)
                    VALUES (%s, %s, %s, %s)
                    """
                    execute_query(location_query, (
                        doctor_id, loc.get('address'), loc.get('latitude'), loc.get('longitude')
                    ), commit=True)
                
                # Inserimento documenti
                documents_data = json.loads(request[8]) if request[8] else []
                for doc in documents_data:
                    doc_query = """
                    INSERT INTO doctor_document (
                        doctor_id, document_type, file_name, file_data, mime_type, file_size, is_verified, verified_by
                    ) VALUES (%s, %s, %s, %s, %s, %s, TRUE, %s)
                    """
                    execute_query(doc_query, (
                        doctor_id, 'altro', doc['filename'], 
                        bytes.fromhex(doc['data']), doc['mime_type'], doc['size'], admin_id
                    ), commit=True)
                
                # Aggiorna status richiesta
                update_query = """
                UPDATE doctor_registration_request 
                SET status = 'approved', admin_notes = %s, admin_id = %s, reviewed_at = CURRENT_TIMESTAMP
                WHERE id = %s
                """
                execute_query(update_query, (admin_notes, admin_id, request_id), commit=True)
                
                return {
                    "message": "Richiesta approvata con successo",
                    "doctor_id": doctor_id,
                    "status": "approved"
                }
                
            except Exception as e:
                # Rollback in caso di errore
                raise HTTPException(status_code=500, detail=f"Errore durante l'approvazione: {str(e)}")
        
        else:  # reject
            # Aggiorna status richiesta
            update_query = """
            UPDATE doctor_registration_request 
            SET status = 'rejected', admin_notes = %s, admin_id = %s, reviewed_at = CURRENT_TIMESTAMP
            WHERE id = %s
            """
            execute_query(update_query, (admin_notes, admin_id, request_id), commit=True)
            
            return {
                "message": "Richiesta rifiutata",
                "status": "rejected"
            }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore interno: {str(e)}") 