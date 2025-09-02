"""
Servizio di gestione email per l'applicazione MediFlow.

Questo modulo fornisce tutte le funzionalità necessarie per:
- Configurazione del server SMTP per l'invio di email
- Invio di email di reset password con token di sicurezza
- Gestione degli errori di invio email
- Template HTML personalizzati per le email

Il sistema utilizza FastAPI-Mail per la gestione asincrona
delle email e supporta configurazioni SMTP personalizzabili.
"""

import os
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from typing import Optional
from pydantic import EmailStr

# Configurazione del servizio email tramite variabili d'ambiente
MAIL_USERNAME = os.getenv("MAIL_USERNAME", "your-email@gmail.com")      # Username per l'autenticazione SMTP
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "your-app-password")         # Password per l'autenticazione SMTP
MAIL_FROM = os.getenv("MAIL_FROM", "your-email@gmail.com")              # Indirizzo email mittente
MAIL_PORT = int(os.getenv("MAIL_PORT", "587"))                           # Porta SMTP (default: 587 per STARTTLS)
MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")                 # Server SMTP (default: Gmail)
MAIL_FROM_NAME = os.getenv("MAIL_FROM_NAME", "MediFlow")                 # Nome visualizzato del mittente

# Configurazione della connessione SMTP con FastAPI-Mail
conf = ConnectionConfig(
    MAIL_USERNAME=MAIL_USERNAME,          # Username per l'autenticazione
    MAIL_PASSWORD=MAIL_PASSWORD,          # Password per l'autenticazione
    MAIL_FROM=MAIL_FROM,                  # Indirizzo email mittente
    MAIL_PORT=MAIL_PORT,                  # Porta del server SMTP
    MAIL_SERVER=MAIL_SERVER,              # Indirizzo del server SMTP
    MAIL_FROM_NAME=MAIL_FROM_NAME,        # Nome visualizzato del mittente
    MAIL_STARTTLS=True,                   # Abilita STARTTLS per la sicurezza
    MAIL_SSL_TLS=False,                   # Disabilita SSL/TLS (usa STARTTLS)
    USE_CREDENTIALS=True,                 # Utilizza credenziali per l'autenticazione
    VALIDATE_CERTS=True                   # Valida i certificati SSL/TLS
)

async def send_password_reset_email(email: EmailStr, reset_token: str, frontend_url: str = "http://localhost:5173"):
    """
    Invia un'email di reset password con token di sicurezza.
    
    Questa funzione crea e invia un'email HTML personalizzata contenente:
    - Un pulsante cliccabile per il reset della password
    - Il link diretto per il reset
    - Avvisi di sicurezza e scadenza del token
    - Template professionale con branding MediFlow
    
    Args:
        email: Indirizzo email del destinatario
        reset_token: Token di reset generato per la sicurezza
        frontend_url: URL base del frontend per costruire il link di reset
        
    Returns:
        bool: True se l'email è stata inviata con successo, False altrimenti
        
    Note:
        Il token di reset scade automaticamente dopo 1 ora per motivi di sicurezza.
        L'email include sia un pulsante cliccabile che un link testuale per compatibilità.
    """
    try:
        # Costruzione dell'URL completo per il reset della password
        reset_url = f"{frontend_url}/reset-password?token={reset_token}"
        
        # Creazione del messaggio email con template HTML personalizzato
        message = MessageSchema(
            subject="Reset della Password - MediFlow",
            recipients=[email],
            body=f"""
            <html>
                <body>
                    <h2>Reset della Password</h2>
                    <p>Hai richiesto il reset della password per il tuo account MediFlow.</p>
                    <p>Clicca sul pulsante seguente per reimpostare la tua password:</p>
                    <p><a href="{reset_url}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reimposta Password</a></p>
                    <p>Oppure copia questo link nel browser:</p>
                    <p>{reset_url}</p>
                    <p><strong>Attenzione:</strong> Questo link scade tra 1 ora per motivi di sicurezza.</p>
                    <p>Se non hai richiesto tu questo reset, ignora questa email.</p>
                    <br>
                    <p>Cordiali saluti,<br>Team MediFlow</p>
                </body>
            </html>
            """,
            subtype="html"  # Specifica che il contenuto è HTML
        )
        
        # Inizializzazione del client FastAPI-Mail e invio dell'email
        fm = FastMail(conf)
        await fm.send_message(message)
        return True
        
    except Exception as e:
        # Gestione degli errori di invio email con logging
        print(f"Errore nell'invio dell'email: {e}")
        return False
