"""
Modelli Pydantic per la gestione dei dati dei pazienti.

Questo modulo definisce tutti i modelli di dati utilizzati dalle API dei pazienti,
inclusi modelli per appuntamenti, recensioni, prenotazioni e ricerche.

I modelli garantiscono la validazione dei dati e la consistenza
delle informazioni scambiate tra frontend e backend.
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# =========================================
# Modelli per la Gestione Appuntamenti
# =========================================

class Appointment(BaseModel):
    """
    Modello per gli appuntamenti dei pazienti.
    
    Definisce la struttura completa di un appuntamento
    con tutte le informazioni necessarie per la gestione
    e la visualizzazione da parte del paziente.
    """
    id: int                           # ID univoco dell'appuntamento
    doctor_id: int                    # ID del dottore
    doctor_name: str                  # Nome del dottore
    doctor_surname: str               # Cognome del dottore
    specialization: str               # Specializzazione medica del dottore
    address: str                      # Indirizzo della sede
    city: str                         # Città della sede
    date_time: datetime               # Data e ora dell'appuntamento
    price: float                      # Prezzo della visita
    status: str                       # Stato dell'appuntamento (waiting, booked, completed)
    created_at: datetime              # Data di creazione dell'appuntamento

# =========================================
# Modelli per Recensioni
# =========================================

class ReviewRequest(BaseModel):
    """
    Modello per le richieste di recensione.
    
    Definisce i dati necessari per creare o aggiornare
    una recensione per un appuntamento completato.
    """
    appointment_id: int               # ID dell'appuntamento da recensire
    stars: int                        # Rating in stelle (1-5)
    report: Optional[str] = None      # Commento opzionale della recensione

# =========================================
# Modelli per Prenotazioni e Cancellazioni
# =========================================

class BookAppointmentRequest(BaseModel):
    """
    Modello per le richieste di prenotazione appuntamenti.
    
    Definisce i dati necessari per prenotare
    un appuntamento disponibile.
    """
    appointment_id: int               # ID dell'appuntamento da prenotare
    patient_id: int                   # ID del paziente che prenota

class CancelAppointmentRequest(BaseModel):
    """
    Modello per le richieste di cancellazione appuntamenti.
    
    Definisce i dati necessari per cancellare
    un appuntamento prenotato.
    """
    appointment_id: int               # ID dell'appuntamento da cancellare
    patient_id: int                   # ID del paziente che cancella
    reason: Optional[str] = None      # Motivo opzionale della cancellazione

# =========================================
# Modelli per Informazioni Paziente
# =========================================

class PatientInfoRequest(BaseModel):
    """
    Modello per le richieste di informazioni sul paziente.

    Definisce i dati necessari per recuperare
    le informazioni di un paziente.
    """
    patient_id: int                   # ID del paziente

# =========================================
# Modelli per Disponibilità Dottori
# =========================================

class DoctorSlotsRequest(BaseModel):
    """
    Modello per le richieste di disponibilità degli slot del dottore.

    Definisce i dati necessari per recuperare
    gli slot disponibili per un dottore specifico.
    """
    doctor_id: int                    # ID del dottore
    start_date: Optional[datetime] = None  # Finestra temporale (inizio)
    end_date: Optional[datetime] = None    # Finestra temporale (fine)
    limit: Optional[int] = 50              # Numero massimo di risultati

# =========================================
# Modelli per Limitazioni e Ricerca Dottori
# =========================================

class LimitInfo(BaseModel):
    """
    Modello per le richieste di limitazione dei risultati.

    Definisce i dati necessari per applicare
    limiti ai risultati delle query.
    """
    limit: Optional[int]              # Numero massimo di risultati

class DoctorQueryRequest(BaseModel):
    """
    Modello per le richieste di ricerca dottori.

    Definisce i dati necessari per cercare dottori
    in base a diversi criteri.
    """
    latitude: Optional[float] = None       # Latitudine per calcolo distanza
    longitude: Optional[float] = None      # Longitudine per calcolo distanza
    radius_km: Optional[float] = 10.0      # Raggio di ricerca in km
    specialization: Optional[str] = None   # Specializzazione richiesta
    min_price: Optional[float] = None      # Prezzo minimo
    max_price: Optional[float] = None      # Prezzo massimo
    sort_by: Optional[str] = None          # Campo di ordinamento
    limit: Optional[int] = 50              # Numero massimo di risultati
