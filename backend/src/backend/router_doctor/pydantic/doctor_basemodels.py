from pydantic import BaseModel, Field
from typing import List, Literal, Optional, Dict, Any
from datetime import datetime, date

class AppointmentsRequest(BaseModel):
    doctor_id: int

class AppointmentInsert(BaseModel):
    doctor_id: int
    location_id: int
    date_time: str  # ISO 8601 format
    status: str = 'waiting'  # Default state for new appointments

class AppointmentRemotion(BaseModel):
    doctor_id: int
    location_id: int
    date_time: str  # ISO 8601 format

# Clinical Folder Models
class VitalSigns(BaseModel):
    blood_pressure: Optional[str] = None
    temperature: Optional[str] = None  # Cambiato da float a str per maggiore flessibilità
    heart_rate: Optional[str] = None   # Cambiato da int a str per maggiore flessibilità
    respiratory_rate: Optional[str] = None  # Cambiato da int a str per maggiore flessibilità
    weight: Optional[str] = None       # Cambiato da float a str per maggiore flessibilità
    height: Optional[str] = None       # Cambiato da float a str per maggiore flessibilità

class MedicalRecordCreate(BaseModel):
    patient_id: int
    appointment_id: Optional[int] = None
    symptoms: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment_plan: Optional[str] = None
    notes: Optional[str] = None
    vital_signs: Optional[VitalSigns] = None

class MedicalRecordUpdate(BaseModel):
    symptoms: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment_plan: Optional[str] = None
    notes: Optional[str] = None
    vital_signs: Optional[VitalSigns] = None

class PrescriptionCreate(BaseModel):
    medical_record_id: int
    medication_name: str = Field(..., min_length=1, max_length=255)
    dosage: str = Field(..., min_length=1, max_length=100)
    frequency: str = Field(..., min_length=1, max_length=100)
    duration: Optional[str] = None
    instructions: Optional[str] = None

class PrescriptionUpdate(BaseModel):
    medication_name: Optional[str] = Field(None, min_length=1, max_length=255)
    dosage: Optional[str] = Field(None, min_length=1, max_length=100)
    frequency: Optional[str] = Field(None, min_length=1, max_length=100)
    duration: Optional[str] = None
    instructions: Optional[str] = None
    is_active: Optional[bool] = None

class MedicalDocumentCreate(BaseModel):
    patient_id: int
    document_type: str = Field(..., min_length=1, max_length=50)
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    file_path: Optional[str] = None
    file_size: Optional[int] = None
    mime_type: Optional[str] = None

class MedicalDocumentUpdate(BaseModel):
    document_type: Optional[str] = Field(None, min_length=1, max_length=50)
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None

# Response Models
class MedicalRecordResponse(BaseModel):
    id: int
    clinical_folder_id: int
    doctor_id: int
    appointment_id: Optional[int]
    record_date: datetime
    symptoms: Optional[str]
    diagnosis: Optional[str]
    treatment_plan: Optional[str]
    notes: Optional[str]
    vital_signs: Optional[Dict[str, Any]]
    created_at: datetime
    doctor_name: str
    doctor_surname: str

class PrescriptionResponse(BaseModel):
    id: int
    medical_record_id: int
    medication_name: str
    dosage: str
    frequency: str
    duration: Optional[str]
    instructions: Optional[str]
    prescribed_date: datetime
    is_active: bool

class MedicalDocumentResponse(BaseModel):
    id: int
    clinical_folder_id: int
    doctor_id: int
    document_type: str
    title: str
    description: Optional[str]
    file_path: Optional[str]
    file_size: Optional[int]
    mime_type: Optional[str]
    uploaded_at: datetime
    doctor_name: str
    doctor_surname: str
    download_url: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    appointment_id: int
    stars: int
    report: Optional[str]
    created_at: datetime
    appointment_date: datetime

class ClinicalFolderResponse(BaseModel):
    id: int
    patient_id: int
    patient_name: str
    patient_surname: str
    patient_age: Optional[int] = None
    patient_sex: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    medical_records: List[MedicalRecordResponse] = []
    documents: List[MedicalDocumentResponse] = []
    reviews: List[ReviewResponse] = []


class BulkGenerateSlots(BaseModel):
    doctor_id: int
    location_ids: List[int]
    start_date: date  # inclusive
    end_date: date    # inclusive
    weekdays: List[int]  # Python weekday indices: 0=Mon .. 6=Sun
    start_time: str  # 'HH:MM'
    end_time: str    # 'HH:MM'
    slot_minutes: int = Field(60, ge=5, le=480)


class BulkClearSlots(BaseModel):
    doctor_id: int
    location_ids: Optional[List[int]] = None
    start_date: date
    end_date: date
    only_status: Optional[str] = 'waiting'

