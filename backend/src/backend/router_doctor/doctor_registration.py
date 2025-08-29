from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import List, Optional
import json
from datetime import datetime
from backend.connection import execute_query
from passlib.context import CryptContext

router_doctor_registration = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router_doctor_registration.post("/request")
async def submit_registration_request(
    name: str = Form(...),
    surname: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    sex: str = Form(...),
    birth_date: str = Form(...),
    specialization: str = Form(...),
    phone: str = Form(...),
    locations: str = Form(...),  # JSON string
    documents: Optional[List[UploadFile]] = File(None)
):
    """Invia richiesta di registrazione dottore."""
    try:
        # Verifica se l'email esiste già
        check_query = "SELECT id FROM account WHERE email = %s"
        existing = execute_query(check_query, (email,))
        
        if existing:
            raise HTTPException(status_code=400, detail="Email già registrata")
        
        # Verifica se esiste già una richiesta pendente
        check_request_query = "SELECT id FROM doctor_registration_request WHERE email = %s AND status = 'pending'"
        existing_request = execute_query(check_request_query, (email,))
        
        if existing_request:
            raise HTTPException(status_code=400, detail="Hai già una richiesta di registrazione in attesa")
        
        # Inserisci la richiesta
        insert_query = """
        INSERT INTO doctor_registration_request 
        (name, surname, email, password, sex, birth_date, specialization, phone, locations, status, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'pending', CURRENT_TIMESTAMP)
        RETURNING id
        """
        
        # Parsing della data
        try:
            parsed_date = datetime.strptime(birth_date, '%Y-%m-%d').date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Formato data non valido. Usa YYYY-MM-DD")
        
        # Parsing delle locations
        try:
            locations_data = json.loads(locations)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Formato locations non valido")
        
        result = execute_query(
            insert_query, 
            (name, surname, email, password, sex, parsed_date, specialization, phone, json.dumps(locations_data),),
            commit=True
        )
        
        if not result or not result[0]:
            raise HTTPException(status_code=500, detail="Errore nell'inserimento della richiesta")
        
        request_id = result[0][0]
        
        # Gestione documenti se presenti
        if documents:
            print(f"Caricamento {len(documents)} documenti")
            for i, doc in enumerate(documents):
                print(f"Processando documento {i+1}: {doc.filename}")
                
                if doc.size > 10 * 1024 * 1024:  # 10MB limit
                    raise HTTPException(status_code=400, detail=f"Documento {doc.filename} troppo grande (max 10MB)")
                
                # Leggi il contenuto del file
                file_content = await doc.read()
                print(f"Dimensione file {doc.filename}: {len(file_content)} bytes")
                
                # Verifica che il file non sia vuoto
                if len(file_content) == 0:
                    raise HTTPException(status_code=400, detail=f"Documento {doc.filename} è vuoto")
                
                # Verifica che sia un PDF valido se il tipo è PDF
                if doc.content_type == "application/pdf":
                    # Converti memoryview in bytes se necessario
                    file_bytes = bytes(file_content) if hasattr(file_content, 'tobytes') else file_content
                    if not file_bytes.startswith(b'%PDF'):
                        print(f"Attenzione: {doc.filename} non sembra essere un PDF valido")
                        print(f"Primi 10 bytes: {file_bytes[:10]}")
                
                # Inserisci il documento
                doc_query = """
                INSERT INTO doctor_document 
                (request_id, filename, mime_type, file_data, document_type, file_size, uploaded_at)
                VALUES (%s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
                """
                
                execute_query(
                    doc_query,
                    (request_id, doc.filename, doc.content_type, file_content, 'altro', len(file_content)),
                    commit=True
                )
                print(f"Documento {doc.filename} salvato con successo")
        
        return {
            "message": "Richiesta di registrazione inviata con successo",
            "request_id": request_id,
            "status": "pending"
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Errore durante la registrazione: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore interno: {str(e)}")

@router_doctor_registration.get("/status/{email}")
async def check_registration_status(email: str):
    """Controlla lo status di una richiesta di registrazione."""
    try:
        query = """
        SELECT id, status, created_at, admin_notes, reviewed_at
        FROM doctor_registration_request 
        WHERE email = %s 
        ORDER BY created_at DESC 
        LIMIT 1
        """
        
        result = execute_query(query, (email,))
        
        if not result:
            raise HTTPException(status_code=404, detail="Nessuna richiesta trovata per questa email")
        
        request = result[0]
        
        return {
            "request_id": request[0],
            "status": request[1],
            "created_at": request[2].isoformat() if request[2] else None,
            "admin_notes": request[3],
            "reviewed_at": request[4].isoformat() if request[4] else None
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore interno: {str(e)}")

@router_doctor_registration.get("/pending")
async def get_pending_requests():
    """Ottiene tutte le richieste pendenti (per admin)."""
    try:
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
        raise HTTPException(status_code=500, detail=f"Errore interno: {str(e)}")

@router_doctor_registration.post("/review/{request_id}")
async def review_registration_request(
    request_id: int,
    action: str = Form(...),  # 'approve' or 'reject'
    admin_notes: str = Form("")
):
    """Revisiona una richiesta di registrazione (approva/rifiuta)."""
    try:
        # Verifica che la richiesta esista e sia pendente
        check_query = """
        SELECT * FROM doctor_registration_request 
        WHERE id = %s AND status = 'pending'
        """
        request_data = execute_query(check_query, (request_id,))
        
        if not request_data:
            raise HTTPException(status_code=404, detail="Richiesta non trovata o già processata")
        
        request = request_data[0]
        
        if action == "approve":
            # Hash della password prima di inserirla
            hashed_password = pwd_context.hash(request[4])
            
            # Crea l'account dottore
            account_query = """
            INSERT INTO account (name, surname, email, password, sex, birth_date, phone, role, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 'doctor', 'active')
            RETURNING id
            """
            
            account_result = execute_query(account_query, (
                request[1], request[2], request[3], hashed_password, request[5], request[6], request[8]
            ), commit=True)
            
            if not account_result or not account_result[0]:
                raise HTTPException(status_code=500, detail="Errore nella creazione dell'account")
            
            doctor_id = account_result[0][0]
            
            # Inserisci nella tabella doctor
            doctor_query = """
            INSERT INTO doctor (id, specialization, is_verified, verification_date)
            VALUES (%s, %s, TRUE, CURRENT_TIMESTAMP)
            """
            execute_query(doctor_query, (doctor_id, request[7]), commit=True)
            
            # Inserisci le locations
            try:
                print(f"Processing locations for doctor {doctor_id}")
                print(f"Raw locations data: {request[9]}")
                
                # Le locations potrebbero essere già una lista o una stringa JSON
                if isinstance(request[9], str):
                    locations_data = json.loads(request[9])
                else:
                    locations_data = request[9]
                
                print(f"Parsed locations data: {locations_data}")
                
                if isinstance(locations_data, list):
                    for i, location in enumerate(locations_data):
                        if isinstance(location, dict):
                            print(f"Inserting location {i}: {location}")
                            location_query = """
                            INSERT INTO location (doctor_id, address, latitude, longitude)
                            VALUES (%s, %s, %s, %s)
                            """
                            execute_query(location_query, (
                                doctor_id, 
                                location.get('address', ''), 
                                location.get('latitude'), 
                                location.get('longitude')
                            ), commit=True)
                            print(f"Location {i} inserted successfully")
                        else:
                            print(f"Location {i} is not a dict: {location}")
                else:
                    print(f"Locations data is not a list: {type(locations_data)}")
            except (json.JSONDecodeError, TypeError) as e:
                print(f"Errore nel parsing delle locations: {e}")
                print(f"Raw data that caused error: {request[9]}")
                # Continua anche se le locations non sono valide
            
            # Aggiorna status richiesta
            update_query = """
            UPDATE doctor_registration_request 
            SET status = 'approved', admin_notes = %s, reviewed_at = CURRENT_TIMESTAMP
            WHERE id = %s
            """
            execute_query(update_query, (admin_notes, request_id), commit=True)
            
            return {
                "message": "Dottore approvato con successo",
                "doctor_id": doctor_id,
                "status": "approved"
            }
            
        elif action == "reject":
            # Aggiorna status richiesta
            update_query = """
            UPDATE doctor_registration_request 
            SET status = 'rejected', admin_notes = %s, reviewed_at = CURRENT_TIMESTAMP
            WHERE id = %s
            """
            execute_query(update_query, (admin_notes, request_id), commit=True)
            
            return {
                "message": "Richiesta rifiutata",
                "status": "rejected"
            }
            
        else:
            raise HTTPException(status_code=400, detail="Azione non valida. Usa 'approve' o 'reject'")
            
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore interno: {str(e)}") 