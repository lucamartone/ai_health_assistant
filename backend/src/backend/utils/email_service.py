import os
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from typing import Optional
from pydantic import EmailStr

# Email configuration
MAIL_USERNAME = os.getenv("MAIL_USERNAME", "your-email@gmail.com")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "your-app-password")
MAIL_FROM = os.getenv("MAIL_FROM", "your-email@gmail.com")
MAIL_PORT = int(os.getenv("MAIL_PORT", "587"))
MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
MAIL_FROM_NAME = os.getenv("MAIL_FROM_NAME", "AI Health Assistant")

conf = ConnectionConfig(
    MAIL_USERNAME=MAIL_USERNAME,
    MAIL_PASSWORD=MAIL_PASSWORD,
    MAIL_FROM=MAIL_FROM,
    MAIL_PORT=MAIL_PORT,
    MAIL_SERVER=MAIL_SERVER,
    MAIL_FROM_NAME=MAIL_FROM_NAME,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def send_password_reset_email(email: EmailStr, reset_token: str, frontend_url: str = "http://localhost:5173"):
    """Send password reset email with token."""
    try:
        reset_url = f"{frontend_url}/reset-password?token={reset_token}"
        
        message = MessageSchema(
            subject="Reset Password - AI Health Assistant",
            recipients=[email],
            body=f"""
            <html>
                <body>
                    <h2>Reset della Password</h2>
                    <p>Hai richiesto il reset della password per il tuo account AI Health Assistant.</p>
                    <p>Clicca sul link seguente per reimpostare la tua password:</p>
                    <p><a href="{reset_url}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reimposta Password</a></p>
                    <p>Oppure copia questo link nel browser:</p>
                    <p>{reset_url}</p>
                    <p><strong>Attenzione:</strong> Questo link scade tra 1 ora per motivi di sicurezza.</p>
                    <p>Se non hai richiesto tu questo reset, ignora questa email.</p>
                    <br>
                    <p>Cordiali saluti,<br>Team AI Health Assistant</p>
                </body>
            </html>
            """,
            subtype="html"
        )
        
        fm = FastMail(conf)
        await fm.send_message(message)
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False
