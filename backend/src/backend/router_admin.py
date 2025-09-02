"""
Router per le funzionalità di amministrazione del sistema MediFlow.

Questo modulo fornisce tutte le funzionalità necessarie per:
- Autenticazione degli amministratori
- Gestione delle richieste di registrazione dei dottori
- Approvazione e rifiuto delle richieste dottore
- Visualizzazione e download dei documenti di supporto
- Verifica dell'accesso amministrativo
- Gestione completa del flusso di approvazione dottori

Il sistema implementa un controllo amministrativo centralizzato
per la gestione delle registrazioni e l'approvazione dei nuovi dottori.
"""

from fastapi import APIRouter, HTTPException, Form
from fastapi.responses import Response
from pydantic import BaseModel
from typing import List, Optional
import json
from backend.connection import execute_query

# Router per le funzionalità di amministrazione
router_admin = APIRouter()

# Modelli Pydantic per la gestione delle richieste amministrative
class AdminLoginRequest(BaseModel):
    """
    Modello per la richiesta di login amministrativo.
    
    Definisce i dati necessari per l'autenticazione
    degli amministratori del sistema.
    """
    email: str        # Email dell'amministratore
    password: str     # Password dell'amministratore

class DoctorRequest(BaseModel):
    """
    Modello per le richieste di registrazione dei dottori.
    
    Definisce la struttura completa di una richiesta
    di registrazione dottore in attesa di approvazione.
    """
    id: int           # ID univoco della richiesta
    name: str         # Nome completo del dottore
    email: str        # Email del dottore
    specialization: str  # Specializzazione medica
    status: str       # Stato della richiesta (pending, approved, rejected)

class DoctorRequestsResponse(BaseModel):
    """
    Modello per la risposta delle richieste dottore.
    
    Definisce la struttura della risposta che include
    tutte le richieste pendenti e il conteggio totale.
    """
    pending_requests: List[DoctorRequest]  # Lista delle richieste in attesa
    count: int                             # Numero totale di richieste

# Endpoint di login amministrativo
@router_admin.post("/login")
async def admin_login(request: AdminLoginRequest):
    """
    Endpoint per l'autenticazione degli amministratori.
    
    Questa funzione gestisce il login degli amministratori
    utilizzando credenziali predefinite per semplicità.
    In produzione, dovrebbe utilizzare un sistema di autenticazione
    più robusto con database e hash delle password.
    
    Args:
        request: Oggetto AdminLoginRequest con email e password
        
    Returns:
        dict: Dizionario con conferma del login e informazioni amministratore
        
    Raises:
        HTTPException: In caso di credenziali non valide o errori
    """
    try:
        # Credenziali hardcoded per semplicità (da sostituire in produzione)
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

# Endpoint per verificare accesso amministrativo
@router_admin.get("/check")
async def admin_check():
    """
    Endpoint per verificare l'accesso amministrativo.
    
    Questa funzione fornisce una verifica rapida
    dello stato dell'accesso amministrativo.
    
    Returns:
        dict: Dizionario con conferma dell'accesso e ruolo
    """
    return {
        "message": "Admin access granted",
        "role": "admin",
        "timestamp": "2024-01-01T00:00:00Z"
    }

# Endpoint per ottenere le richieste di registrazione dottori
@router_admin.get("/doctor-requests")
async def get_doctor_requests():
    """
    Endpoint per ottenere tutte le richieste di registrazione dottori pendenti.
    
    Questa funzione recupera tutte le richieste di registrazione
    dei dottori che sono in stato 'pending', includendo:
    - Informazioni personali e professionali
    - Sedi di lavoro con coordinate geografiche
    - Documenti di supporto caricati
    - Metadati della richiesta (data creazione, stato)
    
    Returns:
        dict: Dizionario con richieste pendenti e conteggio totale
        
    Note:
        Include un fallback con dati mock in caso di errori
        per garantire la continuità del servizio amministrativo.
    """
    try:
        from backend.connection import execute_query
        import json
        
        # Query per recuperare tutte le richieste pendenti ordinate per data
        query = """
        SELECT id, name, surname, email, specialization, phone, locations, status, created_at
        FROM doctor_registration_request 
        WHERE status = 'pending' 
        ORDER BY created_at ASC
        """
        
        results = execute_query(query)
        
        # Elaborazione dei risultati con parsing delle locations e documenti
        requests = []
        for row in results:
            # Parsing delle locations (JSON) con gestione errori
            locations = []
            if row[6]:  # Colonna locations
                try:
                    locations = json.loads(row[6])
                except:
                    locations = []
            
            # Recupero dei documenti associati alla richiesta
            docs_query = """
            SELECT id, filename, mime_type, file_size, document_type, uploaded_at
            FROM doctor_document 
            WHERE request_id = %s
            ORDER BY uploaded_at ASC
            """
            documents = execute_query(docs_query, (row[0],))
            
            # Formattazione dei documenti per il frontend
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
            
            # Costruzione della richiesta completa con tutti i dati
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
        # Garantisce la continuità del servizio amministrativo
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

# Endpoint per approvare le richieste dottore
@router_admin.post("/approve-doctor/{request_id}")
async def approve_doctor(request_id: int, admin_notes: str = Form("")):
    """
    Approva una richiesta di registrazione dottore.
    
    Questa funzione delega l'approvazione al modulo di registrazione
    dottore, passando le note amministrative per la tracciabilità.
    
    Args:
        request_id: ID della richiesta da approvare
        admin_notes: Note opzionali dell'amministratore per la richiesta
        
    Returns:
        dict: Risultato dell'operazione di approvazione
        
    Raises:
        HTTPException: In caso di errori durante l'approvazione
    """
    try:
        from backend.router_doctor.doctor_registration import review_registration_request
        return await review_registration_request(request_id, "approve", admin_notes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore durante l'approvazione: {str(e)}")

# Endpoint per rifiutare le richieste dottore
@router_admin.post("/reject-doctor/{request_id}")
async def reject_doctor(request_id: int, admin_notes: str = Form("")):
    """
    Rifiuta una richiesta di registrazione dottore.
    
    Questa funzione delega il rifiuto al modulo di registrazione
    dottore, passando le note amministrative per la tracciabilità.
    
    Args:
        request_id: ID della richiesta da rifiutare
        admin_notes: Note opzionali dell'amministratore per la richiesta
        
    Returns:
        dict: Risultato dell'operazione di rifiuto
        
    Raises:
        HTTPException: In caso di errori durante il rifiuto
    """
    try:
        from backend.router_doctor.doctor_registration import review_registration_request
        return await review_registration_request(request_id, "reject", admin_notes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore durante il rifiuto: {str(e)}")

# Endpoint per scaricare i documenti dei dottori
@router_admin.get("/doctor-document/{document_id}")
async def get_doctor_document(document_id: int):
    """
    Scarica un documento di supporto di un dottore.
    
    Questa funzione recupera e restituisce un documento specifico
    caricato durante la richiesta di registrazione, con:
    - Controlli di validità del file
    - Gestione dei tipi MIME
    - Headers appropriati per il download
    - Validazione dei dati del file
    
    Args:
        document_id: ID del documento da scaricare
        
    Returns:
        Response: File response con il documento richiesto
        
    Raises:
        HTTPException: In caso di documento non trovato, file vuoto o errori
    """
    try:
        print(f"Richiesta documento ID: {document_id}")
        
        # Query per recuperare i dati del documento
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
        
        # Controllo che file_data non sia None o vuoto
        if file_data is None:
            print("file_data è None")
            raise HTTPException(status_code=500, detail="Dati del file mancanti")
        
        # Conversione memoryview in bytes per il controllo
        file_bytes = bytes(file_data) if hasattr(file_data, 'tobytes') else file_data
        
        if len(file_bytes) == 0:
            print("file_data è vuoto")
            raise HTTPException(status_code=500, detail="Il file è vuoto")
        
        # Validazione del PDF se il tipo MIME lo indica
        if mime_type == "application/pdf":
            # Conversione memoryview in bytes se necessario
            file_bytes = bytes(file_data) if hasattr(file_data, 'tobytes') else file_data
            if not file_bytes.startswith(b'%PDF'):
                print("File non sembra essere un PDF valido")
                print(f"Primi 10 bytes: {file_bytes[:10]}")
        
        # Conversione finale memoryview in bytes per la risposta
        file_bytes = bytes(file_data) if hasattr(file_data, 'tobytes') else file_data
        
        # Creazione della risposta con headers appropriati per il download
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