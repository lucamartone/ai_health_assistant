# Configurazione Google AI Studio (Gemini)

Questo microservizio AI supporta Google AI Studio (Gemini) come provider AI principale.

## 🚀 Setup Rapido

### 1. Ottieni una API Key di Google AI Studio

1. Vai su [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea un nuovo progetto o seleziona uno esistente
3. Genera una nuova API key
4. Copia la chiave API

### 2. Configura le Variabili d'Ambiente

Crea un file `.env` nella directory `ai_service/` con il seguente contenuto:

```env
# AI Provider Configuration
AI_PROVIDER=google

# Google AI Studio (Gemini) Configuration
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_MODEL=gemini-pro
GOOGLE_MAX_TOKENS=1000
GOOGLE_TEMPERATURE=0.7

# Server Configuration
HOST=0.0.0.0
PORT=8002
DEBUG=false
```

### 3. Avvia il Servizio

```bash
cd ai_service
pip install -r requirements.txt
python -m uvicorn src.main:app --host 0.0.0.0 --port 8002
```

## 🔧 Configurazione Avanzata

### Modelli Disponibili

- `gemini-pro`: Modello generale per conversazioni
- `gemini-pro-vision`: Modello con supporto per immagini (non utilizzato in questo servizio)

### Parametri di Configurazione

| Parametro | Descrizione | Default | Range |
|-----------|-------------|---------|-------|
| `GOOGLE_MODEL` | Modello Gemini da utilizzare | `gemini-pro` | `gemini-pro`, `gemini-pro-vision` |
| `GOOGLE_MAX_TOKENS` | Numero massimo di token nella risposta | `1000` | `1-8192` |
| `GOOGLE_TEMPERATURE` | Creatività delle risposte | `0.7` | `0.0-1.0` |

### Esempio di Configurazione Completa

```env
# AI Provider
AI_PROVIDER=google

# Google AI Studio
GOOGLE_API_KEY=AIzaSyC...
GOOGLE_MODEL=gemini-pro
GOOGLE_MAX_TOKENS=1500
GOOGLE_TEMPERATURE=0.8

# Server
HOST=0.0.0.0
PORT=8002
DEBUG=true

# Database
POSTGRES_HOST=database
POSTGRES_PORT=5432
POSTGRES_DB=HealthDB
POSTGRES_USER=admin
POSTGRES_PASSWORD=userpwd

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0

# Security
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Logging
LOG_LEVEL=INFO
```

## 🧪 Test del Servizio

### Test della Chat

```bash
curl -X POST "http://localhost:8002/ai/chat/" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Ciao, ho mal di testa da ieri",
    "conversation_id": "test-123"
  }'
```

### Test dei Consigli Sanitari

```bash
curl -X POST "http://localhost:8002/ai/health-advice/" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "alimentazione sana",
    "user_profile": {"age": 30, "activity_level": "moderate"},
    "specific_concerns": ["perdita di peso", "energia"]
  }'
```

## 🔄 Fallback Automatico

Se Google AI Studio non è disponibile o non è configurato correttamente, il servizio utilizza automaticamente risposte mock per garantire la continuità del servizio.

## 📊 Monitoraggio

Il servizio include logging dettagliato per monitorare:

- Inizializzazione del client Google AI
- Richieste e risposte API
- Errori e fallback
- Performance e latenza

## 🛠️ Risoluzione Problemi

### Errore: "Google API key not provided"
- Verifica che `GOOGLE_API_KEY` sia impostato nel file `.env`
- Assicurati che la chiave API sia valida

### Errore: "Failed to initialize Google AI client"
- Verifica la connessione internet
- Controlla che la chiave API abbia i permessi corretti
- Verifica che il modello specificato sia disponibile

### Risposte Mock
- Se vedi risposte generiche, significa che il servizio sta usando il fallback
- Controlla i log per identificare il problema con Google AI

## 🔒 Sicurezza

- Non committare mai la chiave API nel codice
- Usa variabili d'ambiente per le configurazioni sensibili
- Limita l'accesso alla chiave API solo ai servizi necessari
- Monitora l'uso della chiave API per evitare costi inaspettati

## 💰 Costi

Google AI Studio offre:
- **Free Tier**: 15 richieste al minuto per `gemini-pro`
- **Pricing**: $0.0005 per 1K caratteri di input, $0.0015 per 1K caratteri di output

Per maggiori informazioni sui costi, visita la [pagina dei prezzi di Google AI](https://ai.google.dev/pricing). 