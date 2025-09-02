# Setup su Nuova Macchina - MediFlow

Questa guida ti mostra come configurare MediFlow su una nuova macchina in pochi minuti.

## Prerequisiti

1. **Docker** installato
2. **Docker Compose** installato
3. **4GB di RAM** libera
4. **5GB di spazio disco** libero
5. **Connessione internet** (solo per il primo avvio)

## Setup Rapido

### 1. Avvia tutto con un comando
```bash
docker-compose up --build
```

### 2. Aspetta il completamento
Il sistema impiegherà circa **5-10 minuti** per:
- Scaricare le immagini Docker
- Avviare il database PostgreSQL
- Scaricare il modello AI llama3.2 (2GB)
- Configurare tutti i servizi

### 3. Verifica il setup
```bash
python test_setup.py
```

### 4. Accedi all'applicazione
Apri il browser e vai su: **http://localhost**

## Cosa succede automaticamente

1. **Database**: Si avvia con dati di test preconfigurati
2. **Backend**: API FastAPI per gestire l'applicazione
3. **Ollama**: Scarica automaticamente il modello llama3.2
4. **Frontend**: Interfaccia React moderna 

## Credenziali di Accesso

### Paziente
- Email: `patient@test.com`
- Password: `password123`

### Medico
- Email: `doctor@test.com`
- Password: `password123`

### Admin
- Email: `admin@mediflow.com`
- Password: `admin123`

**Nota importante per l'accesso admin**: 
- L'account amministratore viene creato automaticamente durante l'inizializzazione del database
- Utilizza le credenziali specifiche per l'amministratore
- L'accesso admin ti permette di gestire le richieste di registrazione dei dottori
- Puoi approvare o rifiutare le nuove richieste di registrazione
- Hai accesso completo al sistema di amministrazione

## Verifica del Setup

### Controlla lo stato dei container
```bash
docker-compose ps
```

Dovresti vedere tutti i container con status "Up" e Ollama con "healthy".

**Nota**: L'account amministratore (`admin@mediflow.com`) viene creato automaticamente e sarà disponibile per l'accesso.

### Controlla i log
```bash
# Tutti i servizi
docker-compose logs

# Solo Ollama
docker-compose logs ollama

# Solo frontend
docker-compose logs frontend
```

### Testa la funzionalità AI
```bash
# Verifica che Ollama risponda
curl http://localhost:11434/api/tags

# Testa una conversazione
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model": "llama3.2", "prompt": "Ciao!", "stream": false}'
```

## Comandi Utili

```bash
# Ferma tutto
docker-compose down

# Riavvia tutto
docker-compose restart

# Ricostruisci (se necessario)
docker-compose up -d --build

# Visualizza uso risorse
docker stats

# Pulisci tutto (ATTENZIONE: cancella tutti i dati)
docker-compose down -v
docker system prune -a
```

## Endpoint Disponibili

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8001
- **Ollama API**: http://localhost:11434
- **Database**: localhost:5433

## Risoluzione Problemi

### Ollama non scarica il modello
```bash
# Entra nel container
docker exec -it ollama bash

# Scarica manualmente
ollama pull llama3.2

# Verifica i modelli
ollama list
```

### Frontend non carica
```bash
# Verifica che tutti i servizi siano pronti
docker-compose ps

# Ricostruisci il frontend
docker-compose up -d --build frontend
```

### Database non si connette
```bash
# Riavvia il database
docker-compose restart database

# Verifica i log
docker-compose logs database
```

## Monitoraggio

### Stato dei servizi
```bash
docker-compose ps
```

### Log in tempo reale
```bash
docker-compose logs -f
```

### Uso delle risorse
```bash
docker stats
```

## Successo!

Se tutto funziona correttamente:

1. Tutti i container sono "Up"
2. Ollama è "healthy"
3. Il test setup passa tutti i controlli
4. L'applicazione è accessibile su http://localhost

**Congratulazioni!** Il tuo assistente sanitario AI è pronto per l'uso!

---

**MediFlow** - Assistente Sanitario Intelligente
