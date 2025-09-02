"""
Gestione completa delle cartelle cliniche per i dottori.

Questo modulo fornisce tutte le funzionalità necessarie per:
- Visualizzare la lista dei pazienti di un dottore
- Gestire le cartelle cliniche complete dei pazienti
- Creare e aggiornare record medici
- Gestire prescrizioni mediche
- Caricare e scaricare documenti medici
- Gestire i segni vitali dei pazienti

Il sistema mantiene una struttura organizzata per ogni paziente con:
- Informazioni personali e anagrafiche
- Cronologia medica completa
- Prescrizioni attive e storiche
- Documenti medici organizzati per tipo
"""

from fastapi import APIRouter, HTTPException, Depends, Query, UploadFile, File, Form
from fastapi.responses import FileResponse
from typing import List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
import json
from datetime import datetime
import os

from .pydantic.doctor_basemodels import (
    MedicalRecordCreate, MedicalRecordUpdate, MedicalRecordResponse,
    PrescriptionCreate, PrescriptionUpdate, PrescriptionResponse,
    MedicalDocumentCreate, MedicalDocumentUpdate, MedicalDocumentResponse,
    ClinicalFolderResponse
)
from ..connection import connect_to_postgres

# Router per la gestione delle cartelle cliniche
router = APIRouter()

# Directory per il caricamento dei documenti
UPLOAD_DIR = './uploaded_docs/'
os.makedirs(UPLOAD_DIR, exist_ok=True)

# =========================================
# Gestione Cartelle Cliniche
# =========================================

@router.get("/patients/{doctor_id}")
async def get_doctor_patients(doctor_id: int, db: psycopg2.extensions.connection = Depends(connect_to_postgres)):
    """
    Recupera tutti i pazienti associati a un dottore specifico.
    
    Questa funzione recupera la lista completa dei pazienti che hanno avuto
    almeno un appuntamento con il dottore specificato, ordinati per cognome e nome.
    
    Args:
        doctor_id: ID del dottore per cui recuperare i pazienti
        db: Connessione al database PostgreSQL
        
    Returns:
        dict: Dizionario contenente la lista dei pazienti con informazioni complete
        
    Raises:
        HTTPException: In caso di errore del database o errori imprevisti
    """
    try:
        with db.cursor(cursor_factory=RealDictCursor) as cursor:
            # Query per recuperare pazienti distinti dagli appuntamenti
            cursor.execute("""
                SELECT DISTINCT 
                    p.id,
                    a.name,
                    a.surname,
                    a.email,
                    a.birth_date,
                    a.sex
                FROM patient p
                JOIN account a ON p.id = a.id
                WHERE p.id IN (
                    SELECT DISTINCT patient_id 
                    FROM appointment 
                    WHERE doctor_id = %s AND patient_id IS NOT NULL
                )
                ORDER BY a.surname, a.name
            """, (doctor_id,))
            
            patients = cursor.fetchall()
            
            # Formattazione dei dati per la risposta
            return {
                "patients": [
                    {
                        "id": patient['id'],
                        "name": patient['name'],
                        "surname": patient['surname'],
                        "email": patient['email'],
                        "birth_date": patient['birth_date'].isoformat() if patient['birth_date'] else None,
                        "sex": patient['sex']
                    }
                    for patient in patients
                ]
            }
            
    except psycopg2.Error as e:
        print(f"Errore del database in get_doctor_patients: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore del database: {str(e)}")
    except Exception as e:
        print(f"Errore imprevisto in get_doctor_patients: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore imprevisto: {str(e)}")

@router.get("/patient/{patient_id}", response_model=ClinicalFolderResponse)
async def get_patient_clinical_folder(patient_id: int, db: psycopg2.extensions.connection = Depends(connect_to_postgres)):
    """
    Recupera la cartella clinica completa di un paziente specifico.
    
    Questa funzione crea o recupera la cartella clinica del paziente e restituisce
    tutte le informazioni mediche organizzate, inclusi record medici, prescrizioni
    e documenti caricati.
    
    Args:
        patient_id: ID del paziente per cui recuperare la cartella clinica
        db: Connessione al database PostgreSQL
        
    Returns:
        ClinicalFolderResponse: Oggetto contenente tutte le informazioni della cartella clinica
        
    Raises:
        HTTPException: In caso di paziente non trovato o errori del database
    """
    try:
        with db.cursor(cursor_factory=RealDictCursor) as cursor:
            # Recupero delle informazioni base del paziente
            cursor.execute("""
                SELECT a.name, a.surname, a.birth_date, a.sex
                FROM account a
                JOIN patient p ON a.id = p.id
                WHERE p.id = %s
            """, (patient_id,))
            
            patient_info = cursor.fetchone()
            if not patient_info:
                raise HTTPException(status_code=404, detail="Paziente non trovato")
            
            # Calcolo dell'età del paziente
            age = None
            if patient_info['birth_date']:
                from datetime import date
                today = date.today()
                age = today.year - patient_info['birth_date'].year - ((today.month, today.day) < (patient_info['birth_date'].month, patient_info['birth_date'].day))
            
            # Recupero o creazione della cartella clinica
            cursor.execute("""
                INSERT INTO clinical_folder (patient_id)
                VALUES (%s)
                ON CONFLICT DO NOTHING
                RETURNING id, patient_id, created_at, updated_at
            """, (patient_id,))
            
            folder_result = cursor.fetchone()
            if not folder_result:
                cursor.execute("""
                    SELECT id, patient_id, created_at, updated_at
                    FROM clinical_folder
                    WHERE patient_id = %s
                """, (patient_id,))
                folder_result = cursor.fetchone()
            
            folder_id = folder_result['id']
            
            # Recupero dei record medici con informazioni del dottore
            print(f"DEBUG: Querying medical records for folder_id: {folder_id}")
            cursor.execute("""
                SELECT mr.*, a.name as doctor_name, a.surname as doctor_surname
                FROM medical_record mr
                JOIN account a ON mr.doctor_id = a.id
                WHERE mr.clinical_folder_id = %s
                ORDER BY mr.record_date DESC
            """, (folder_id,))
            medical_records = cursor.fetchall()
            print(f"DEBUG: Found {len(medical_records)} medical records for folder {folder_id}")
            
            # Debug: stampa i primi record se ce ne sono
            if medical_records:
                print(f"DEBUG: First record: {medical_records[0]}")
            else:
                print(f"DEBUG: No medical records found for folder {folder_id}")
                # Verifica se esistono record senza JOIN
                cursor.execute("""
                    SELECT COUNT(*) as count FROM medical_record WHERE clinical_folder_id = %s
                """, (folder_id,))
                count_result = cursor.fetchone()
                print(f"DEBUG: Medical records without JOIN: {count_result['count']}")
            
            # Recupero dei documenti medici con informazioni del dottore
            cursor.execute("""
                SELECT md.*, a.name as doctor_name, a.surname as doctor_surname
                FROM medical_document md
                JOIN account a ON md.doctor_id = a.id
                WHERE md.clinical_folder_id = %s
                ORDER BY md.uploaded_at DESC
            """, (folder_id,))
            documents = cursor.fetchall()
            print(f"DEBUG: Found {len(documents)} documents for folder {folder_id}")
            
            # Aggiunta degli URL di download ai documenti
            for doc in documents:
                doc['download_url'] = f"/doctor/clinical_folders/download-document/{doc['id']}"
            
            print(f"DEBUG: Returning {len(medical_records)} medical records and {len(documents)} documents")
            
            # Costruzione della risposta completa
            return ClinicalFolderResponse(
                id=folder_result['id'],
                patient_id=folder_result['patient_id'],
                patient_name=patient_info['name'],
                patient_surname=patient_info['surname'],
                patient_age=age,
                patient_sex=patient_info['sex'],
                created_at=folder_result['created_at'],
                updated_at=folder_result['updated_at'],
                medical_records=[MedicalRecordResponse(**record) for record in medical_records],
                documents=[MedicalDocumentResponse(**doc) for doc in documents]
            )
            
    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Errore del database: {str(e)}")

@router.get("/patient/{patient_id}/doctor/{doctor_id}", response_model=ClinicalFolderResponse)
async def get_patient_clinical_folder_by_doctor(
    patient_id: int, 
    doctor_id: int, 
    db: psycopg2.extensions.connection = Depends(connect_to_postgres)
):
    """
    Recupera la cartella clinica di un paziente filtrata per un dottore specifico.
    
    Questa funzione è simile a get_patient_clinical_folder ma permette di
    filtrare i dati per un dottore specifico, utile per la gestione multi-dottore.
    
    Args:
        patient_id: ID del paziente per cui recuperare la cartella clinica
        doctor_id: ID del dottore per cui filtrare i dati
        db: Connessione al database PostgreSQL
        
    Returns:
        ClinicalFolderResponse: Oggetto contenente le informazioni filtrate della cartella clinica
        
    Raises:
        HTTPException: In caso di paziente non trovato o errori del database
    """
    try:
        with db.cursor(cursor_factory=RealDictCursor) as cursor:
            # Recupero delle informazioni base del paziente
            cursor.execute("""
                SELECT a.name, a.surname, a.birth_date, a.sex
                FROM account a
                JOIN patient p ON a.id = p.id
                WHERE p.id = %s
            """, (patient_id,))
            
            patient_info = cursor.fetchone()
            if not patient_info:
                raise HTTPException(status_code=404, detail="Paziente non trovato")
            
            # Calcolo dell'età del paziente
            age = None
            if patient_info['birth_date']:
                from datetime import date
                today = date.today()
                age = today.year - patient_info['birth_date'].year - ((today.month, today.day) < (patient_info['birth_date'].month, patient_info['birth_date'].day))
            
            # Recupero o creazione della cartella clinica
            cursor.execute("""
                INSERT INTO clinical_folder (patient_id)
                VALUES (%s)
                ON CONFLICT DO NOTHING
                RETURNING id, patient_id, created_at, updated_at
            """, (patient_id,))
            
            folder_result = cursor.fetchone()
            if not folder_result:
                cursor.execute("""
                    SELECT id, patient_id, created_at, updated_at
                    FROM clinical_folder
                    WHERE patient_id = %s
                """, (patient_id,))
                folder_result = cursor.fetchone()
            
            folder_id = folder_result['id']
            
            # Recupero dei record medici per specifico dottore
            cursor.execute("""
                SELECT mr.*, a.name as doctor_name, a.surname as doctor_surname
                FROM medical_record mr
                JOIN account a ON mr.doctor_id = a.id
                WHERE mr.clinical_folder_id = %s AND mr.doctor_id = %s
                ORDER BY mr.record_date DESC
            """, (folder_id, doctor_id))
            medical_records = cursor.fetchall()
            
            # Recupero dei documenti medici per specifico dottore
            cursor.execute("""
                SELECT md.*, a.name as doctor_name, a.surname as doctor_surname
                FROM medical_document md
                JOIN account a ON md.doctor_id = a.id
                WHERE md.clinical_folder_id = %s AND md.doctor_id = %s
                ORDER BY md.uploaded_at DESC
            """, (folder_id, doctor_id))
            documents = cursor.fetchall()
            
            # Recupero delle recensioni per questo paziente e dottore
            cursor.execute("""
                SELECT r.id, r.appointment_id, r.stars, r.report, a.date_time as appointment_date
                FROM review r
                JOIN appointment a ON r.appointment_id = a.id
                WHERE a.patient_id = %s AND a.doctor_id = %s AND r.stars IS NOT NULL
                ORDER BY a.date_time DESC
            """, (patient_id, doctor_id))
            reviews = cursor.fetchall()
            
            # Aggiunta degli URL di download ai documenti
            for doc in documents:
                doc['download_url'] = f"/doctor/clinical_folders/download-document/{doc['id']}"
            
            return ClinicalFolderResponse(
                id=folder_result['id'],
                patient_id=folder_result['patient_id'],
                patient_name=patient_info['name'],
                patient_surname=patient_info['surname'],
                patient_age=age,
                patient_sex=patient_info['sex'],
                created_at=folder_result['created_at'],
                updated_at=folder_result['updated_at'],
                medical_records=[MedicalRecordResponse(**record) for record in medical_records],
                documents=[MedicalDocumentResponse(**doc) for doc in documents],
                reviews=reviews
            )
            
    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Errore del database: {str(e)}")

# =========================================
# Gestione Record Medici
# =========================================

@router.post("/medical-records", response_model=MedicalRecordResponse)
async def create_medical_record(
    record: MedicalRecordCreate,
    doctor_id: int = Query(..., description="ID of the doctor creating the record"),
    db: psycopg2.extensions.connection = Depends(connect_to_postgres)
):
    """
    Crea un nuovo record medico per un paziente specifico.
    
    Questa funzione gestisce la creazione di un nuovo record medico,
    assicurandosi che la cartella clinica del paziente esista.
    
    Args:
        record: Oggetto Pydantic contenente i dati del record medico da creare
        doctor_id: ID del dottore che crea il record
        db: Connessione al database PostgreSQL
        
    Returns:
        MedicalRecordResponse: Oggetto contenente i dati del record medico creato
        
    Raises:
        HTTPException: In caso di errore del database o errori imprevisti
    """
    try:
        with db.cursor(cursor_factory=RealDictCursor) as cursor:
            # Prima verifica se la cartella clinica esiste
            cursor.execute("""
                SELECT id FROM clinical_folder WHERE patient_id = %s
            """, (record.patient_id,))
            
            folder_result = cursor.fetchone()
            
            # Se la cartella non esiste, creala
            if not folder_result:
                cursor.execute("""
                    INSERT INTO clinical_folder (patient_id)
                    VALUES (%s)
                    RETURNING id
                """, (record.patient_id,))
                folder_result = cursor.fetchone()
            
            folder_id = folder_result['id']
            print(f"DEBUG: Using clinical folder ID: {folder_id} for patient {record.patient_id}")
            
            # Creazione del record medico
            print(f"DEBUG: Creating medical record with vital_signs: {record.vital_signs}")
            
            # Gestione dei segni vitali - converti in JSON se presente
            vital_signs_json = None
            if record.vital_signs:
                try:
                    vital_signs_json = json.dumps(record.vital_signs.dict())
                    print(f"DEBUG: Vital signs JSON: {vital_signs_json}")
                except Exception as e:
                    print(f"DEBUG: Error serializing vital signs: {e}")
                    vital_signs_json = json.dumps(record.vital_signs)
            
            cursor.execute("""
                INSERT INTO medical_record (
                    clinical_folder_id, doctor_id, appointment_id, symptoms,
                    diagnosis, treatment_plan, notes, vital_signs
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, clinical_folder_id, doctor_id, appointment_id,
                          record_date, symptoms, diagnosis, treatment_plan,
                          notes, vital_signs, created_at
            """, (
                folder_id, doctor_id, record.appointment_id, record.symptoms,
                record.diagnosis, record.treatment_plan, record.notes,
                vital_signs_json
            ))
            
            record_result = cursor.fetchone()
            print(f"DEBUG: Record created with ID: {record_result['id']}")
            
            # Recupero le informazioni del dottore
            cursor.execute("""
                SELECT name, surname FROM account WHERE id = %s
            """, (doctor_id,))
            doctor_info = cursor.fetchone()
            
            db.commit()
            print(f"DEBUG: Database committed successfully")
            
            # Verifica che il record sia stato salvato
            cursor.execute("""
                SELECT COUNT(*) as count FROM medical_record WHERE clinical_folder_id = %s
            """, (folder_id,))
            count_result = cursor.fetchone()
            print(f"DEBUG: Total medical records in folder {folder_id}: {count_result['count']}")
            
            return MedicalRecordResponse(
                **record_result,
                doctor_name=doctor_info['name'],
                doctor_surname=doctor_info['surname']
            )
            
    except psycopg2.Error as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore del database: {str(e)}")

@router.get("/medical-records/{record_id}", response_model=MedicalRecordResponse)
async def get_medical_record(record_id: int, db: psycopg2.extensions.connection = Depends(connect_to_postgres)):
    """
    Recupera un record medico specifico.
    
    Questa funzione recupera un singolo record medico dal database
    utilizzando il suo ID.
    
    Args:
        record_id: ID del record medico da recuperare
        db: Connessione al database PostgreSQL
        
    Returns:
        MedicalRecordResponse: Oggetto contenente i dati del record medico
        
    Raises:
        HTTPException: In caso di record non trovato o errori del database
    """
    try:
        with db.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                SELECT mr.*, a.name as doctor_name, a.surname as doctor_surname
                FROM medical_record mr
                JOIN account a ON mr.doctor_id = a.id
                WHERE mr.id = %s
            """, (record_id,))
            
            record = cursor.fetchone()
            if not record:
                raise HTTPException(status_code=404, detail="Record medico non trovato")
            
            return MedicalRecordResponse(**record)
            
    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Errore del database: {str(e)}")

@router.put("/medical-records/{record_id}", response_model=MedicalRecordResponse)
async def update_medical_record(
    record_id: int,
    record_update: MedicalRecordUpdate,
    db: psycopg2.extensions.connection = Depends(connect_to_postgres)
):
    """
    Aggiorna un record medico esistente.
    
    Questa funzione permette di aggiornare i campi di un record medico
    specifico, utilizzando l'ID.
    
    Args:
        record_id: ID del record medico da aggiornare
        record_update: Oggetto Pydantic contenente i nuovi dati per l'aggiornamento
        db: Connessione al database PostgreSQL
        
    Returns:
        MedicalRecordResponse: Oggetto contenente i dati aggiornati del record medico
        
    Raises:
        HTTPException: In caso di record non trovato o errori del database
    """
    try:
        with db.cursor(cursor_factory=RealDictCursor) as cursor:
            # Costruzione della query di aggiornamento dinamica
            update_fields = []
            values = []
            
            if record_update.symptoms is not None:
                update_fields.append("symptoms = %s")
                values.append(record_update.symptoms)
            if record_update.diagnosis is not None:
                update_fields.append("diagnosis = %s")
                values.append(record_update.diagnosis)
            if record_update.treatment_plan is not None:
                update_fields.append("treatment_plan = %s")
                values.append(record_update.treatment_plan)
            if record_update.notes is not None:
                update_fields.append("notes = %s")
                values.append(record_update.notes)
            if record_update.vital_signs is not None:
                update_fields.append("vital_signs = %s")
                values.append(json.dumps(record_update.vital_signs.dict()))
            
            if not update_fields:
                raise HTTPException(status_code=400, detail="Nessun campo da aggiornare")
            
            values.append(record_id)
            
            cursor.execute(f"""
                UPDATE medical_record 
                SET {', '.join(update_fields)}
                WHERE id = %s
                RETURNING id, clinical_folder_id, doctor_id, appointment_id,
                          record_date, symptoms, diagnosis, treatment_plan,
                          notes, vital_signs, created_at
            """, values)
            
            record_result = cursor.fetchone()
            if not record_result:
                raise HTTPException(status_code=404, detail="Record medico non trovato")
            
            # Recupero le informazioni del dottore
            cursor.execute("""
                SELECT name, surname FROM account WHERE id = %s
            """, (record_result['doctor_id'],))
            doctor_info = cursor.fetchone()
            
            db.commit()
            
            return MedicalRecordResponse(
                **record_result,
                doctor_name=doctor_info['name'],
                doctor_surname=doctor_info['surname']
            )
            
    except psycopg2.Error as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore del database: {str(e)}")

# =========================================
# Gestione Prescrizioni
# =========================================

@router.post("/prescriptions", response_model=PrescriptionResponse)
async def create_prescription(
    prescription: PrescriptionCreate,
    db: psycopg2.extensions.connection = Depends(connect_to_postgres)
):
    """
    Crea una nuova prescrizione.
    
    Questa funzione gestisce la creazione di una nuova prescrizione,
    assicurandosi che il record medico associato esista.
    
    Args:
        prescription: Oggetto Pydantic contenente i dati della prescrizione da creare
        db: Connessione al database PostgreSQL
        
    Returns:
        PrescriptionResponse: Oggetto contenente i dati della prescrizione creata
        
    Raises:
        HTTPException: In caso di errore del database o errori imprevisti
    """
    try:
        with db.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                INSERT INTO prescription (
                    medical_record_id, medication_name, dosage, frequency,
                    duration, instructions
                ) VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id, medical_record_id, medication_name, dosage,
                          frequency, duration, instructions, prescribed_date, is_active
            """, (
                prescription.medical_record_id, prescription.medication_name,
                prescription.dosage, prescription.frequency, prescription.duration,
                prescription.instructions
            ))
            
            prescription_result = cursor.fetchone()
            db.commit()
            
            return PrescriptionResponse(**prescription_result)
            
    except psycopg2.Error as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore del database: {str(e)}")

@router.get("/prescriptions/{prescription_id}", response_model=PrescriptionResponse)
async def get_prescription(prescription_id: int, db: psycopg2.extensions.connection = Depends(connect_to_postgres)):
    """
    Recupera una prescrizione specifica.
    
    Questa funzione recupera una singola prescrizione dal database
    utilizzando il suo ID.
    
    Args:
        prescription_id: ID della prescrizione da recuperare
        db: Connessione al database PostgreSQL
        
    Returns:
        PrescriptionResponse: Oggetto contenente i dati della prescrizione
        
    Raises:
        HTTPException: In caso di prescrizione non trovata o errori del database
    """
    try:
        with db.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                SELECT * FROM prescription WHERE id = %s
            """, (prescription_id,))
            
            prescription = cursor.fetchone()
            if not prescription:
                raise HTTPException(status_code=404, detail="Prescrizione non trovata")
            
            return PrescriptionResponse(**prescription)
            
    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Errore del database: {str(e)}")

@router.get("/medical-records/{record_id}/prescriptions")
async def get_prescriptions_for_record(record_id: int, db: psycopg2.extensions.connection = Depends(connect_to_postgres)):
    """
    Recupera tutte le prescrizioni per un record medico specifico.
    
    Questa funzione recupera tutte le prescrizioni associate a un
    singolo record medico, ordinandole per data di prescrizione.
    
    Args:
        record_id: ID del record medico per cui recuperare le prescrizioni
        db: Connessione al database PostgreSQL
        
    Returns:
        dict: Dizionario contenente la lista delle prescrizioni
        
    Raises:
        HTTPException: In caso di errore del database o errori imprevisti
    """
    try:
        with db.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                SELECT * FROM prescription 
                WHERE medical_record_id = %s 
                ORDER BY prescribed_date DESC
            """, (record_id,))
            
            prescriptions = cursor.fetchall()
            return {"prescriptions": [PrescriptionResponse(**prescription) for prescription in prescriptions]}
            
    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Errore del database: {str(e)}")

@router.put("/prescriptions/{prescription_id}", response_model=PrescriptionResponse)
async def update_prescription(
    prescription_id: int,
    prescription_update: PrescriptionUpdate,
    db: psycopg2.extensions.connection = Depends(connect_to_postgres)
):
    """
    Aggiorna una prescrizione esistente.
    
    Questa funzione permette di aggiornare i campi di una prescrizione
    specifica, utilizzando l'ID.
    
    Args:
        prescription_id: ID della prescrizione da aggiornare
        prescription_update: Oggetto Pydantic contenente i nuovi dati per l'aggiornamento
        db: Connessione al database PostgreSQL
        
    Returns:
        PrescriptionResponse: Oggetto contenente i dati aggiornati della prescrizione
        
    Raises:
        HTTPException: In caso di prescrizione non trovata o errori del database
    """
    try:
        with db.cursor(cursor_factory=RealDictCursor) as cursor:
            # Costruzione della query di aggiornamento dinamica
            update_fields = []
            values = []
            
            if prescription_update.medication_name is not None:
                update_fields.append("medication_name = %s")
                values.append(prescription_update.medication_name)
            if prescription_update.dosage is not None:
                update_fields.append("dosage = %s")
                values.append(prescription_update.dosage)
            if prescription_update.frequency is not None:
                update_fields.append("frequency = %s")
                values.append(prescription_update.frequency)
            if prescription_update.duration is not None:
                update_fields.append("duration = %s")
                values.append(prescription_update.duration)
            if prescription_update.instructions is not None:
                update_fields.append("instructions = %s")
                values.append(prescription_update.instructions)
            if prescription_update.is_active is not None:
                update_fields.append("is_active = %s")
                values.append(prescription_update.is_active)
            
            if not update_fields:
                raise HTTPException(status_code=400, detail="Nessun campo da aggiornare")
            
            values.append(prescription_id)
            
            cursor.execute(f"""
                UPDATE prescription 
                SET {', '.join(update_fields)}
                WHERE id = %s
                RETURNING id, medical_record_id, medication_name, dosage,
                          frequency, duration, instructions, prescribed_date, is_active
            """, values)
            
            prescription_result = cursor.fetchone()
            if not prescription_result:
                raise HTTPException(status_code=404, detail="Prescrizione non trovata")
            
            db.commit()
            
            return PrescriptionResponse(**prescription_result)
            
    except psycopg2.Error as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore del database: {str(e)}")

# =========================================
# Gestione Documenti Medici
# =========================================

@router.post("/documents", response_model=MedicalDocumentResponse)
async def create_medical_document(
    document: MedicalDocumentCreate,
    doctor_id: int = Query(..., description="ID of the doctor uploading the document"),
    db: psycopg2.extensions.connection = Depends(connect_to_postgres)
):
    """
    Crea un nuovo documento medico.
    
    Questa funzione gestisce la creazione di un nuovo documento medico,
    assicurandosi che la cartella clinica del paziente esista.
    
    Args:
        document: Oggetto Pydantic contenente i dati del documento medico da creare
        doctor_id: ID del dottore che carica il documento
        db: Connessione al database PostgreSQL
        
    Returns:
        MedicalDocumentResponse: Oggetto contenente i dati del documento medico creato
        
    Raises:
        HTTPException: In caso di errore del database o errori imprevisti
    """
    try:
        with db.cursor(cursor_factory=RealDictCursor) as cursor:
            # Prima verifica se la cartella clinica esiste
            cursor.execute("""
                SELECT id FROM clinical_folder WHERE patient_id = %s
            """, (document.patient_id,))
            
            folder_result = cursor.fetchone()
            
            # Se la cartella non esiste, creala
            if not folder_result:
                cursor.execute("""
                    INSERT INTO clinical_folder (patient_id)
                    VALUES (%s)
                    RETURNING id
                """, (document.patient_id,))
                folder_result = cursor.fetchone()
            
            folder_id = folder_result['id']
            print(f"DEBUG: Using clinical folder ID: {folder_id} for patient {document.patient_id}")
            
            # Creazione del documento medico
            cursor.execute("""
                INSERT INTO medical_document (
                    clinical_folder_id, doctor_id, document_type, title,
                    description, file_path, file_size, mime_type
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, clinical_folder_id, doctor_id, document_type,
                          title, description, file_path, file_size, mime_type, uploaded_at
            """, (
                folder_id, doctor_id, document.document_type, document.title,
                document.description, document.file_path, document.file_size,
                document.mime_type
            ))
            
            document_result = cursor.fetchone()
            
            # Recupero le informazioni del dottore
            cursor.execute("""
                SELECT name, surname FROM account WHERE id = %s
            """, (doctor_id,))
            doctor_info = cursor.fetchone()
            
            db.commit()
            
            return MedicalDocumentResponse(
                **document_result,
                doctor_name=doctor_info['name'],
                doctor_surname=doctor_info['surname']
            )
            
    except psycopg2.Error as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore del database: {str(e)}")

@router.get("/documents/{document_id}", response_model=MedicalDocumentResponse)
async def get_medical_document(document_id: int, db: psycopg2.extensions.connection = Depends(connect_to_postgres)):
    """
    Recupera un documento medico specifico.
    
    Questa funzione recupera un singolo documento medico dal database
    utilizzando il suo ID.
    
    Args:
        document_id: ID del documento medico da recuperare
        db: Connessione al database PostgreSQL
        
    Returns:
        MedicalDocumentResponse: Oggetto contenente i dati del documento medico
        
    Raises:
        HTTPException: In caso di documento non trovato o errori del database
    """
    try:
        with db.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                SELECT md.*, a.name as doctor_name, a.surname as doctor_surname
                FROM medical_document md
                JOIN account a ON md.doctor_id = a.id
                WHERE md.id = %s
            """, (document_id,))
            
            document = cursor.fetchone()
            if not document:
                raise HTTPException(status_code=404, detail="Documento medico non trovato")
            
            return MedicalDocumentResponse(**document)
            
    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Errore del database: {str(e)}")

@router.delete("/documents/{document_id}")
async def delete_medical_document(document_id: int, db: psycopg2.extensions.connection = Depends(connect_to_postgres)):
    """
    Elimina un documento medico.
    
    Questa funzione elimina un documento medico dal database
    utilizzando il suo ID.
    
    Args:
        document_id: ID del documento medico da eliminare
        db: Connessione al database PostgreSQL
        
    Returns:
        dict: Dizionario contenente il messaggio di successo
        
    Raises:
        HTTPException: In caso di documento non trovato o errori del database
    """
    try:
        with db.cursor() as cursor:
            cursor.execute("DELETE FROM medical_document WHERE id = %s", (document_id,))
            
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Documento medico non trovato")
            
            db.commit()
            return {"message": "Documento medico eliminato con successo"}
            
    except psycopg2.Error as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore del database: {str(e)}")

@router.post("/upload-document")
async def upload_medical_document(
    patient_id: int = Form(...),
    doctor_id: int = Form(...),
    document_type: str = Form(...),
    title: str = Form(...),
    description: str = Form(''),
    file: UploadFile = File(...),
    db: psycopg2.extensions.connection = Depends(connect_to_postgres)
):
    """
    Carica un file di documento medico e crea il record del documento.
    
    Questa funzione gestisce il caricamento di un file di documento medico,
    la sua salvataggio e la creazione del record corrispondente nel database.
    
    Args:
        patient_id: ID del paziente a cui appartiene il documento
        doctor_id: ID del dottore che carica il documento
        document_type: Tipo di documento (es. 'Radiografia', 'Referto')
        title: Titolo del documento
        description: Descrizione opzionale del documento
        file: File di documento da caricare
        db: Connessione al database PostgreSQL
        
    Returns:
        dict: Oggetto contenente i dati del documento creato
        
    Raises:
        HTTPException: In caso di errore di caricamento del file o errori del database
    """
    try:
        # Salvataggio del file
        filename = f"{patient_id}_{doctor_id}_{int(datetime.now().timestamp())}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        rel_path = file_path.replace('./', '/', 1) if file_path.startswith('./') else file_path
        # Creazione del record del documento
        with db.cursor(cursor_factory=RealDictCursor) as cursor:
            # Prima verifica se la cartella clinica esiste
            cursor.execute("""
                SELECT id FROM clinical_folder WHERE patient_id = %s
            """, (patient_id,))
            
            folder_result = cursor.fetchone()
            
            # Se la cartella non esiste, creala
            if not folder_result:
                cursor.execute("""
                    INSERT INTO clinical_folder (patient_id)
                    VALUES (%s)
                    RETURNING id
                """, (patient_id,))
                folder_result = cursor.fetchone()
            
            folder_id = folder_result['id']
            print(f"DEBUG: Using clinical folder ID: {folder_id} for patient {patient_id}")
            
            cursor.execute("""
                INSERT INTO medical_document (
                    clinical_folder_id, doctor_id, document_type, title,
                    description, file_path, file_size, mime_type
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, clinical_folder_id, doctor_id, document_type,
                          title, description, file_path, file_size, mime_type, uploaded_at
            """, (
                folder_id, doctor_id, document_type, title, description,
                rel_path, len(content), file.content_type
            ))
            document_result = cursor.fetchone()
            cursor.execute("SELECT name, surname FROM account WHERE id = %s", (doctor_id,))
            doctor_info = cursor.fetchone()
            db.commit()
            return {
                **document_result,
                "doctor_name": doctor_info['name'],
                "doctor_surname": doctor_info['surname']
            }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore di caricamento documento: {str(e)}")

@router.get("/download-document/{document_id}")
async def download_medical_document(document_id: int, db: psycopg2.extensions.connection = Depends(connect_to_postgres)):
    """
    Scarica un documento medico specifico.
    
    Questa funzione recupera il percorso del file del documento medico
    dal database e lo restituisce come FileResponse.
    
    Args:
        document_id: ID del documento medico da scaricare
        db: Connessione al database PostgreSQL
        
    Returns:
        FileResponse: Oggetto FileResponse per il download del file
        
    Raises:
        HTTPException: In caso di documento non trovato o errori del database
    """
    try:
        with db.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                SELECT md.file_path FROM medical_document md WHERE md.id = %s
            """, (document_id,))
            
            document_path = cursor.fetchone()
            if not document_path:
                raise HTTPException(status_code=404, detail="Documento medico non trovato")
            
            file_path = document_path['file_path']
            return FileResponse(file_path)
            
    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Errore del database: {str(e)}") 