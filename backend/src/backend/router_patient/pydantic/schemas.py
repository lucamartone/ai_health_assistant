"""
Modelli Pydantic per la gestione dei dati dei pazienti.

Questo modulo definisce tutti i modelli di dati utilizzati dalle API dei pazienti,
inclusi modelli per appuntamenti, recensioni e richieste di prenotazione.

I modelli garantiscono la validazione dei dati e la consistenza
delle informazioni scambiate tra frontend e backend.
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime

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

class ReviewRequest(BaseModel):
    """
    Modello per le richieste di recensione.
    
    Definisce i dati necessari per creare o aggiornare
    una recensione per un appuntamento completato.
    """
    appointment_id: int               # ID dell'appuntamento da recensire
    stars: int                        # Rating in stelle (1-5)
    report: Optional[str] = None     # Commento opzionale della recensione

class BookAppointmentRequest(BaseModel):
    """
    Modello per le richieste di prenotazione appuntamenti.
    
    Definisce i dati necessari per prenotare
    un appuntamento disponibile.
    """
    appointment_id: int               # ID dell'appuntamento da prenotare
    patient_id: int                   # ID del paziente che prenota
