"""
Modelli Pydantic per la gestione dei dati dei dottori.

Questo modulo definisce tutti i modelli di dati utilizzati dalle API dei dottori,
inclusi modelli per appuntamenti, cartelle cliniche, record medici,
prescrizioni e documenti medici.

I modelli garantiscono la validazione dei dati e la consistenza
delle informazioni scambiate tra frontend e backend.
"""

from pydantic import BaseModel, Field
from typing import List, Literal, Optional, Dict, Any
from datetime import datetime, date

# =========================================
# Modelli per la Gestione Appuntamenti
# =========================================

class AppointmentsRequest(BaseModel):
    """
    Modello per le richieste di appuntamenti.
    
    Utilizzato per identificare un dottore specifico
    nelle richieste relative agli appuntamenti.
    """
    doctor_id: int

class AppointmentInsert(BaseModel):
    """
    Modello per l'inserimento di nuovi appuntamenti.
    
    Definisce i dati necessari per creare un nuovo
    slot di appuntamento nel sistema.
    """
    doctor_id: int
    location_id: int
    date_time: str  # Formato ISO 8601
    status: str = 'waiting'  # Stato predefinito per nuovi appuntamenti

class AppointmentRemotion(BaseModel):
    """
    Modello per la rimozione di appuntamenti.
    
    Definisce i parametri necessari per identificare
    e rimuovere un appuntamento specifico.
    """
    doctor_id: int
    location_id: int
    date_time: str  # Formato ISO 8601

# =========================================
# Modelli per le Cartelle Cliniche
# =========================================

class VitalSigns(BaseModel):
    """
    Modello per i segni vitali del paziente.
    
    I valori sono memorizzati come stringhe per garantire
    maggiore flessibilità nella gestione dei dati medici.
    """
    blood_pressure: Optional[str] = None      # Pressione sanguigna
    temperature: Optional[str] = None         # Temperatura corporea
    heart_rate: Optional[str] = None          # Frequenza cardiaca
    respiratory_rate: Optional[str] = None    # Frequenza respiratoria
    weight: Optional[str] = None              # Peso corporeo
    height: Optional[str] = None              # Altezza

class MedicalRecordCreate(BaseModel):
    """
    Modello per la creazione di nuovi record medici.
    
    Definisce tutti i campi necessari per creare
    un nuovo record medico per un paziente.
    """
    patient_id: int
    appointment_id: Optional[int] = None      # ID dell'appuntamento associato
    symptoms: Optional[str] = None            # Sintomi riportati dal paziente
    diagnosis: Optional[str] = None           # Diagnosi formulata dal dottore
    treatment_plan: Optional[str] = None      # Piano di trattamento
    notes: Optional[str] = None               # Note aggiuntive
    vital_signs: Optional[VitalSigns] = None # Segni vitali rilevati

class MedicalRecordUpdate(BaseModel):
    """
    Modello per l'aggiornamento di record medici esistenti.
    
    Tutti i campi sono opzionali per permettere aggiornamenti
    parziali dei record medici.
    """
    symptoms: Optional[str] = None            # Sintomi aggiornati
    diagnosis: Optional[str] = None           # Diagnosi aggiornata
    treatment_plan: Optional[str] = None      # Piano di trattamento aggiornato
    notes: Optional[str] = None               # Note aggiornate
    vital_signs: Optional[VitalSigns] = None # Segni vitali aggiornati

# =========================================
# Modelli per le Prescrizioni
# =========================================

class PrescriptionCreate(BaseModel):
    """
    Modello per la creazione di nuove prescrizioni.
    
    Definisce i dati necessari per creare una nuova
    prescrizione medica per un paziente.
    """
    medical_record_id: int                    # ID del record medico associato
    medication_name: str = Field(..., min_length=1, max_length=255)  # Nome del farmaco
    dosage: str = Field(..., min_length=1, max_length=100)           # Dosaggio prescritto
    frequency: str = Field(..., min_length=1, max_length=100)        # Frequenza di assunzione
    duration: Optional[str] = None            # Durata del trattamento
    instructions: Optional[str] = None        # Istruzioni per l'assunzione

class PrescriptionUpdate(BaseModel):
    """
    Modello per l'aggiornamento di prescrizioni esistenti.
    
    Tutti i campi sono opzionali per permettere aggiornamenti
    parziali delle prescrizioni.
    """
    medication_name: Optional[str] = Field(None, min_length=1, max_length=255)
    dosage: Optional[str] = Field(None, min_length=1, max_length=100)
    frequency: Optional[str] = Field(None, min_length=1, max_length=100)
    duration: Optional[str] = None            # Durata aggiornata
    instructions: Optional[str] = None        # Istruzioni aggiornate
    is_active: Optional[bool] = None          # Stato di attivazione della prescrizione

# =========================================
# Modelli per i Documenti Medici
# =========================================

class MedicalDocumentCreate(BaseModel):
    """
    Modello per la creazione di nuovi documenti medici.
    
    Definisce i dati necessari per creare un nuovo
    documento medico nel sistema.
    """
    patient_id: int                           # ID del paziente proprietario
    document_type: str = Field(..., min_length=1, max_length=50)     # Tipo di documento
    title: str = Field(..., min_length=1, max_length=255)            # Titolo del documento
    description: Optional[str] = None          # Descrizione opzionale
    file_path: Optional[str] = None            # Percorso del file nel filesystem
    file_size: Optional[int] = None            # Dimensione del file in bytes
    mime_type: Optional[str] = None            # Tipo MIME del file

class MedicalDocumentUpdate(BaseModel):
    """
    Modello per l'aggiornamento di documenti medici esistenti.
    
    Permette di aggiornare i metadati dei documenti
    senza modificare i file associati.
    """
    document_type: Optional[str] = Field(None, min_length=1, max_length=50)
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None          # Descrizione aggiornata

# =========================================
# Modelli di Risposta
# =========================================

class MedicalRecordResponse(BaseModel):
    """
    Modello di risposta per i record medici.
    
    Include tutti i dati del record medico più le informazioni
    del dottore che ha creato il record.
    """
    id: int                                   # ID univoco del record
    clinical_folder_id: int                   # ID della cartella clinica
    doctor_id: int                            # ID del dottore
    appointment_id: Optional[int]             # ID dell'appuntamento associato
    record_date: datetime                     # Data del record medico
    symptoms: Optional[str]                   # Sintomi registrati
    diagnosis: Optional[str]                  # Diagnosi formulata
    treatment_plan: Optional[str]             # Piano di trattamento
    notes: Optional[str]                      # Note aggiuntive
    vital_signs: Optional[Dict[str, Any]]     # Segni vitali in formato JSON
    created_at: datetime                      # Data di creazione del record
    doctor_name: str                          # Nome del dottore
    doctor_surname: str                       # Cognome del dottore

class PrescriptionResponse(BaseModel):
    """
    Modello di risposta per le prescrizioni.
    
    Include tutti i dati della prescrizione più
    informazioni sulla data di prescrizione e stato attivo.
    """
    id: int                                   # ID univoco della prescrizione
    medical_record_id: int                    # ID del record medico associato
    medication_name: str                      # Nome del farmaco
    dosage: str                               # Dosaggio prescritto
    frequency: str                            # Frequenza di assunzione
    duration: Optional[str]                   # Durata del trattamento
    instructions: Optional[str]               # Istruzioni per l'assunzione
    prescribed_date: datetime                 # Data di prescrizione
    is_active: bool                           # Stato di attivazione

class MedicalDocumentResponse(BaseModel):
    """
    Modello di risposta per i documenti medici.
    
    Include tutti i metadati del documento più
    le informazioni del dottore che ha caricato il documento.
    """
    id: int                                   # ID univoco del documento
    clinical_folder_id: int                   # ID della cartella clinica
    doctor_id: int                            # ID del dottore che ha caricato il documento
    document_type: str                        # Tipo di documento
    title: str                                # Titolo del documento
    description: Optional[str]                # Descrizione del documento
    file_path: Optional[str]                  # Percorso del file
    file_size: Optional[int]                  # Dimensione del file
    mime_type: Optional[str]                  # Tipo MIME
    uploaded_at: datetime                     # Data di caricamento
    created_at: datetime                      # Data di creazione del record
    doctor_name: str                          # Nome del dottore
    doctor_surname: str                       # Cognome del dottore

class ClinicalFolderResponse(BaseModel):
    """
    Modello di risposta per le cartelle cliniche complete.
    
    Include tutte le informazioni del paziente, la cartella clinica
    e le liste complete di record medici e documenti.
    """
    id: int                                   # ID della cartella clinica
    patient_id: int                           # ID del paziente
    patient_name: str                         # Nome del paziente
    patient_surname: str                      # Cognome del paziente
    patient_age: Optional[int]                # Età calcolata del paziente
    patient_sex: Optional[str]                # Sesso del paziente
    created_at: datetime                      # Data di creazione della cartella
    updated_at: datetime                      # Data dell'ultimo aggiornamento
    medical_records: List[MedicalRecordResponse]  # Lista dei record medici
    documents: List[MedicalDocumentResponse]      # Lista dei documenti medici

# =========================================
# Modelli per la Generazione di Slot
# =========================================

class BulkGenerateSlots(BaseModel):
    """
    Modello per la generazione in blocco di slot di appuntamenti.
    
    Definisce tutti i parametri necessari per generare automaticamente
    slot di appuntamenti disponibili per un dottore.
    """
    doctor_id: int                            # ID del dottore
    location_ids: List[int]                   # Lista degli ID delle sedi
    start_date: date                          # Data di inizio per la generazione
    end_date: date                            # Data di fine per la generazione
    weekdays: List[int]                       # Giorni della settimana (0=Lunedì, 6=Domenica)
    start_time: str                           # Orario di inizio (formato HH:MM)
    end_time: str                             # Orario di fine (formato HH:MM)
    slot_minutes: int = Field(60, ge=5, le=480)   # Durata di ogni slot in minuti


class BulkClearSlots(BaseModel):
    """
    Modello per la rimozione in blocco di slot di appuntamenti.
    
    Definisce i parametri per rimuovere slot di appuntamenti
    in un determinato range di date e sedi.
    """
    doctor_id: int                            # ID del dottore
    location_ids: Optional[List[int]] = None  # Lista opzionale degli ID delle sedi
    start_date: date                          # Data di inizio per la rimozione
    end_date: date                            # Data di fine per la rimozione
    only_status: Optional[str] = 'waiting'         # Status specifico da rimuovere (default: 'waiting')

