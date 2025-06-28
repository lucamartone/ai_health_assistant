from fastapi import APIRouter, HTTPException, Depends, Query, UploadFile, File, Form
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

router = APIRouter()

UPLOAD_DIR = './uploaded_docs/'
os.makedirs(UPLOAD_DIR, exist_ok=True)

# =========================================
# Clinical Folder Management
# =========================================

@router.get("/patients/{doctor_id}")
async def get_doctor_patients(doctor_id: int, db: psycopg2.extensions.connection = Depends(connect_to_postgres)):
    """Get all patients for a specific doctor"""
    try:
        with db.cursor(cursor_factory=RealDictCursor) as cursor:
            # Get patients from appointments and clinical folders
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
                    UNION
                    SELECT DISTINCT patient_id 
                    FROM clinical_folder 
                    WHERE id IN (
                        SELECT DISTINCT clinical_folder_id 
                        FROM medical_record 
                        WHERE doctor_id = %s
                    )
                )
                ORDER BY a.surname, a.name
            """, (doctor_id, doctor_id))
            
            patients = cursor.fetchall()
            
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
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/patient/{patient_id}", response_model=ClinicalFolderResponse)
async def get_patient_clinical_folder(patient_id: int, db: psycopg2.extensions.connection = Depends(connect_to_postgres)):
    """Get complete clinical folder for a patient"""
    try:
        with db.cursor(cursor_factory=RealDictCursor) as cursor:
            # Get or create clinical folder
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
            
            if not folder_result:
                raise HTTPException(status_code=404, detail="Patient not found")
            
            folder_id = folder_result['id']
            
            # Get medical records
            cursor.execute("""
                SELECT mr.*, a.name as doctor_name, a.surname as doctor_surname
                FROM medical_record mr
                JOIN account a ON mr.doctor_id = a.id
                WHERE mr.clinical_folder_id = %s
                ORDER BY mr.record_date DESC
            """, (folder_id,))
            medical_records = cursor.fetchall()
            
            # Get medical documents
            cursor.execute("""
                SELECT md.*, a.name as doctor_name, a.surname as doctor_surname
                FROM medical_document md
                JOIN account a ON md.doctor_id = a.id
                WHERE md.clinical_folder_id = %s
                ORDER BY md.uploaded_at DESC
            """, (folder_id,))
            documents = cursor.fetchall()
            
            return ClinicalFolderResponse(
                id=folder_result['id'],
                patient_id=folder_result['patient_id'],
                created_at=folder_result['created_at'],
                updated_at=folder_result['updated_at'],
                medical_records=[MedicalRecordResponse(**record) for record in medical_records],
                documents=[MedicalDocumentResponse(**doc) for doc in documents]
            )
            
    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# =========================================
# Medical Records Management
# =========================================

@router.post("/medical-records", response_model=MedicalRecordResponse)
async def create_medical_record(
    record: MedicalRecordCreate,
    doctor_id: int = Query(..., description="ID of the doctor creating the record"),
    db: psycopg2.extensions.connection = Depends(connect_to_postgres)
):
    """Create a new medical record for a patient"""
    try:
        with db.cursor(cursor_factory=RealDictCursor) as cursor:
            # Get or create clinical folder
            cursor.execute("""
                INSERT INTO clinical_folder (patient_id)
                VALUES (%s)
                ON CONFLICT DO NOTHING
                RETURNING id
            """, (record.patient_id,))
            
            folder_result = cursor.fetchone()
            if not folder_result:
                cursor.execute("""
                    SELECT id FROM clinical_folder WHERE patient_id = %s
                """, (record.patient_id,))
                folder_result = cursor.fetchone()
            
            folder_id = folder_result['id']
            
            # Create medical record
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
                json.dumps(record.vital_signs.dict()) if record.vital_signs else None
            ))
            
            record_result = cursor.fetchone()
            
            # Get doctor info
            cursor.execute("""
                SELECT name, surname FROM account WHERE id = %s
            """, (doctor_id,))
            doctor_info = cursor.fetchone()
            
            db.commit()
            
            return MedicalRecordResponse(
                **record_result,
                doctor_name=doctor_info['name'],
                doctor_surname=doctor_info['surname']
            )
            
    except psycopg2.Error as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/medical-records/{record_id}", response_model=MedicalRecordResponse)
async def get_medical_record(record_id: int, db: psycopg2.extensions.connection = Depends(connect_to_postgres)):
    """Get a specific medical record"""
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
                raise HTTPException(status_code=404, detail="Medical record not found")
            
            return MedicalRecordResponse(**record)
            
    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.put("/medical-records/{record_id}", response_model=MedicalRecordResponse)
async def update_medical_record(
    record_id: int,
    record_update: MedicalRecordUpdate,
    db: psycopg2.extensions.connection = Depends(connect_to_postgres)
):
    """Update a medical record"""
    try:
        with db.cursor(cursor_factory=RealDictCursor) as cursor:
            # Build update query dynamically
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
                raise HTTPException(status_code=400, detail="No fields to update")
            
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
                raise HTTPException(status_code=404, detail="Medical record not found")
            
            # Get doctor info
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
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# =========================================
# Prescriptions Management
# =========================================

@router.post("/prescriptions", response_model=PrescriptionResponse)
async def create_prescription(
    prescription: PrescriptionCreate,
    db: psycopg2.extensions.connection = Depends(connect_to_postgres)
):
    """Create a new prescription"""
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
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/prescriptions/{prescription_id}", response_model=PrescriptionResponse)
async def get_prescription(prescription_id: int, db: psycopg2.extensions.connection = Depends(connect_to_postgres)):
    """Get a specific prescription"""
    try:
        with db.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                SELECT * FROM prescription WHERE id = %s
            """, (prescription_id,))
            
            prescription = cursor.fetchone()
            if not prescription:
                raise HTTPException(status_code=404, detail="Prescription not found")
            
            return PrescriptionResponse(**prescription)
            
    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.put("/prescriptions/{prescription_id}", response_model=PrescriptionResponse)
async def update_prescription(
    prescription_id: int,
    prescription_update: PrescriptionUpdate,
    db: psycopg2.extensions.connection = Depends(connect_to_postgres)
):
    """Update a prescription"""
    try:
        with db.cursor(cursor_factory=RealDictCursor) as cursor:
            # Build update query dynamically
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
                raise HTTPException(status_code=400, detail="No fields to update")
            
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
                raise HTTPException(status_code=404, detail="Prescription not found")
            
            db.commit()
            
            return PrescriptionResponse(**prescription_result)
            
    except psycopg2.Error as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# =========================================
# Medical Documents Management
# =========================================

@router.post("/documents", response_model=MedicalDocumentResponse)
async def create_medical_document(
    document: MedicalDocumentCreate,
    doctor_id: int = Query(..., description="ID of the doctor uploading the document"),
    db: psycopg2.extensions.connection = Depends(connect_to_postgres)
):
    """Create a new medical document"""
    try:
        with db.cursor(cursor_factory=RealDictCursor) as cursor:
            # Get or create clinical folder
            cursor.execute("""
                INSERT INTO clinical_folder (patient_id)
                VALUES (%s)
                ON CONFLICT DO NOTHING
                RETURNING id
            """, (document.patient_id,))
            
            folder_result = cursor.fetchone()
            if not folder_result:
                cursor.execute("""
                    SELECT id FROM clinical_folder WHERE patient_id = %s
                """, (document.patient_id,))
                folder_result = cursor.fetchone()
            
            folder_id = folder_result['id']
            
            # Create medical document
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
            
            # Get doctor info
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
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/documents/{document_id}", response_model=MedicalDocumentResponse)
async def get_medical_document(document_id: int, db: psycopg2.extensions.connection = Depends(connect_to_postgres)):
    """Get a specific medical document"""
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
                raise HTTPException(status_code=404, detail="Medical document not found")
            
            return MedicalDocumentResponse(**document)
            
    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.delete("/documents/{document_id}")
async def delete_medical_document(document_id: int, db: psycopg2.extensions.connection = Depends(connect_to_postgres)):
    """Delete a medical document"""
    try:
        with db.cursor() as cursor:
            cursor.execute("DELETE FROM medical_document WHERE id = %s", (document_id,))
            
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Medical document not found")
            
            db.commit()
            return {"message": "Medical document deleted successfully"}
            
    except psycopg2.Error as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

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
    """Upload a medical document file and create the document record."""
    try:
        # Save file
        filename = f"{patient_id}_{doctor_id}_{int(datetime.now().timestamp())}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        rel_path = file_path.replace('./', '/', 1) if file_path.startswith('./') else file_path
        # Create document record
        with db.cursor(cursor_factory=RealDictCursor) as cursor:
            # Get or create clinical folder
            cursor.execute("""
                INSERT INTO clinical_folder (patient_id)
                VALUES (%s)
                ON CONFLICT DO NOTHING
                RETURNING id
            """, (patient_id,))
            folder_result = cursor.fetchone()
            if not folder_result:
                cursor.execute("SELECT id FROM clinical_folder WHERE patient_id = %s", (patient_id,))
                folder_result = cursor.fetchone()
            folder_id = folder_result['id']
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
        raise HTTPException(status_code=500, detail=f"Errore upload documento: {str(e)}") 