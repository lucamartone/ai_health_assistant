"""
Modelli Pydantic per la gestione dei profili e dell'autenticazione.

Questo modulo definisce tutti i modelli di dati utilizzati dalle API dei profili,
inclusi modelli per registrazione, login, modifica profilo e gestione dati sanitari.

I modelli garantiscono la validazione dei dati e la consistenza
delle informazioni scambiate tra frontend e backend.
"""

from fastapi.params import Depends
from pydantic import BaseModel, EmailStr
from typing import List, Literal, Optional
from datetime import date

from backend.router_profile.cookies_login import get_current_account

# =========================================
# Modelli per Dati di Localizzazione
# =========================================

class LocationData(BaseModel):
    """
    Modello per i dati delle sedi/location.
    
    Definisce la struttura dei dati geografici
    per le sedi di lavoro dei dottori.
    """
    address: str                    # Indirizzo completo della sede
    latitude: Optional[float]       # Coordinate di latitudine
    longitude: Optional[float]      # Coordinate di longitudine

# =========================================
# Modelli per Registrazione ed Eliminazione
# =========================================

class RegisterRequest(BaseModel):
    """
    Modello per le richieste di registrazione generiche.
    
    Definisce i dati base richiesti per la registrazione
    di un nuovo account nel sistema.
    """
    name: str                       # Nome dell'utente
    surname: str                    # Cognome dell'utente
    email: EmailStr                 # Email dell'utente (validata)
    password: str                   # Password per l'account
    sex: Literal['M', 'F']          # Sesso (M o F)
    birth_date: Optional[date] = None  # Data di nascita opzionale

class RegisterDoctorRequest(BaseModel):
    """
    Modello per le richieste di registrazione specifiche per i dottori.
    
    Estende RegisterRequest con informazioni specifiche
    per la registrazione di account dottore.
    """
    name: str                       # Nome del dottore
    surname: str                    # Cognome del dottore
    email: EmailStr                 # Email del dottore (validata)
    password: str                   # Password per l'account
    sex: Literal['M', 'F']          # Sesso (M o F)
    specialization: str             # Specializzazione medica
    locations: List[LocationData]   # Lista delle sedi di lavoro

class DeleteRequest(BaseModel):
    """
    Modello per le richieste di eliminazione.
    """
    email: EmailStr                   # Email dell'elemento da eliminare
    password: str                     # Password per confermare l'eliminazione
    current_account: dict = Depends(get_current_account)  # Account autenticato

# =========================================
# Modelli per Autenticazione e Sicurezza
# =========================================

class LoginRequest(BaseModel):
    """
    Modello per le richieste di login.
    
    Definisce i dati necessari per l'autenticazione
    di un utente esistente.
    """
    email: str                      # Email dell'utente
    password: str                   # Password dell'utente

class ChangePasswordRequest(BaseModel):
    """
    Modello per le richieste di cambio password.
    
    Definisce i dati necessari per modificare
    la password di un account esistente.
    """
    old_password: str               # Password attuale
    new_password: str               # Nuova password desiderata
    account_email: EmailStr         # Email dell'account da modificare

class ResetPasswordRequest(BaseModel):
    """
    Modello per le richieste di reset password.
    
    Definisce i dati necessari per reimpostare
    la password di un account tramite token.
    """
    token: str                      # Token di reset password
    new_password: str               # Nuova password desiderata

class PreResetRequest(BaseModel):
    """
    Modello per le richieste di pre-reset password.
    
    Definisce i dati necessari per avviare il processo
    di reset della password.
    """
    email: EmailStr                 # Email dell'utente

# =========================================
# Modelli per Modifica Profilo
# =========================================

class ModifyProfileRequest(BaseModel):
    """
    Modello per le richieste di modifica del profilo.
    
    Definisce i campi modificabili del profilo utente,
    con supporto per informazioni specifiche dei dottori.
    """
    name: str                              # Nome aggiornato
    surname: str                           # Cognome aggiornato
    phone: Optional[str] = None            # Numero di telefono opzionale
    email: EmailStr                        # Email aggiornata (validata)
    specialization: Optional[str] = None   # Specializzazione (per dottori)
    addresses: Optional[List[LocationData]] = None  # Sedi aggiornate (per dottori)
    profile_img: Optional[str] = None      # Immagine profilo in base64

# =========================================
# Modelli per Dati Sanitari
# =========================================

class HealthDataInput(BaseModel):
    """
    Modello per l'inserimento di dati sanitari dei pazienti.
    
    Definisce i dati sanitari opzionali che possono
    essere associati a un profilo paziente.
    """
    patient_id: int                        # ID del paziente
    blood_type: Optional[str] = None       # Gruppo sanguigno
    allergies: Optional[List[str]] = None  # Lista delle allergie
    chronic_conditions: Optional[List[str]] = None  # Condizioni croniche

# =========================================
# Modelli per Preferenze e Info Account
# =========================================

class PreferencesPayload(BaseModel):
    """
    Modello per le preferenze dell'utente.
    
    Definisce le preferenze configurabili per
    notifiche e privacy dell'utente.
    """
    notifications: Optional[dict] = None    # Preferenze notifiche
    privacy: Optional[dict] = None          # Preferenze privacy
    account_id: Optional[int] = None        # ID dell'account associato

class AccountInfo(BaseModel):
    """
    Modello per le informazioni dell'account.
    
    Definisce l'ID associato a un account utente.
    """
    account_id: int                         # ID univoco dell'account

# =========================================
# Modelli per Richieste di Identificazione
# =========================================

class DoctorInfoRequest(BaseModel):
    """
    Modello per fornire l'ID di un dottore.
    """
    doctor_id: int                          # ID del dottore

class PatientInfoRequest(BaseModel):
    """
    Modello per fornire l'ID di un paziente.
    """
    patient_id: int                         # ID del paziente
