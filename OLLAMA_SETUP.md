# 🚀 Setup Ollama per MediFlow

Questa guida ti aiuterà a configurare Ollama per utilizzare modelli AI locali con MediFlow, eliminando i costi delle API esterne e permettendo un prototipo funzionante.

## 📋 Prerequisiti

- Docker e Docker Compose installati
- Almeno 8GB di RAM disponibili (per i modelli più grandi)
- Connessione internet per scaricare i modelli

## 🛠️ Installazione

### 1. Avvia Ollama

```bash
# Avvia solo il servizio Ollama
docker-compose up ollama -d
```

### 2. Configura il Modello

```bash
# Esegui lo script di setup
python scripts/setup_ollama.py
```

Lo script:
- Verifica che Ollama sia in esecuzione
- Scarica il modello `llama3.2` (circa 4GB)
- Testa la connessione

### 3. Avvia l'Applicazione Completa

```bash
# Avvia tutti i servizi
docker-compose up -d
```

## 🔧 Configurazione

### Modelli Disponibili

Puoi utilizzare diversi modelli Ollama. Ecco alcuni consigliati:

| Modello | Dimensione | Qualità | Lingua |
|---------|------------|---------|--------|
| `llama3.2` | ~4GB | Buona | Multilingue |
| `llama3.2:3b` | ~2GB | Media | Multilingue |
| `mistral` | ~4GB | Eccellente | Multilingue |
| `codellama` | ~4GB | Buona per codice | Multilingue |
| `llama3.2:8b` | ~5GB | Molto buona | Multilingue |

### Cambiare Modello

1. Modifica il file `ai_service/src/utils/config.py`:
```python
ollama_model: str = "mistral"  # Cambia qui
```

2. Modifica il file `docker-compose.yml`:
```yaml
- OLLAMA_MODEL=${OLLAMA_MODEL:-mistral}
```

3. Scarica il nuovo modello:
```bash
python scripts/setup_ollama.py
```

## 🧪 Test

### Test Manuale

```bash
# Testa la connessione a Ollama
curl http://localhost:11434/api/tags

# Testa una richiesta
curl -X POST http://localhost:11434/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3.2",
    "messages": [
      {
        "role": "user",
        "content": "Ciao! Come stai?"
      }
    ],
    "stream": false
  }'
```

### Test nell'Interfaccia Web

1. Apri http://localhost
2. Accedi come paziente
3. Vai alla sezione "Chat AI"
4. Fai una domanda sulla salute

## 🔄 Migrazione da Google AI

Se stavi usando Google AI, la migrazione è automatica:

1. Il sistema ora usa Ollama di default
2. Le conversazioni esistenti sono mantenute
3. Il prompt di sistema è ottimizzato per la salute

## 🚨 Risoluzione Problemi

### Ollama non risponde

```bash
# Verifica che Ollama sia in esecuzione
docker-compose ps ollama

# Riavvia Ollama
docker-compose restart ollama

# Controlla i log
docker-compose logs ollama
```

### Modello non trovato

```bash
# Lista i modelli disponibili
curl http://localhost:11434/api/tags

# Scarica manualmente un modello
curl -X POST http://localhost:11434/api/pull \
  -H "Content-Type: application/json" \
  -d '{"name": "llama3.2"}'
```

### Memoria insufficiente

Se hai problemi di memoria:

1. Usa un modello più piccolo:
   ```bash
   # Modifica in config.py
   ollama_model: str = "llama3.2:3b"
   ```

2. Aumenta la RAM di Docker:
   - Docker Desktop → Settings → Resources → Memory → 8GB+

### Risposte lente

I modelli locali possono essere più lenti delle API cloud. Per migliorare le performance:

1. Usa un modello più piccolo
2. Aumenta la RAM
3. Usa un SSD per i modelli
4. Considera l'uso di GPU (se disponibile)

## 🔮 Prossimi Passi

### Migrazione a GPT-5 (Futuro)

Quando GPT-5 sarà disponibile, potrai facilmente migrare:

1. Modifica `ai_provider` da `"ollama"` a `"openai"`
2. Configura le credenziali OpenAI
3. Il resto del codice rimane invariato

### Ottimizzazioni

- **Fine-tuning**: Addestra il modello su dati medici specifici
- **Prompt Engineering**: Ottimizza i prompt per la salute
- **Caching**: Implementa cache per risposte frequenti
- **Streaming**: Abilita risposte in tempo reale

## 📊 Monitoraggio

### Log di Ollama

```bash
# Visualizza i log in tempo reale
docker-compose logs -f ollama

# Log del servizio AI
docker-compose logs -f ai_service
```

### Metriche

- **Tempo di risposta**: Monitora le performance
- **Qualità delle risposte**: Valuta l'accuratezza
- **Utilizzo memoria**: Controlla l'uso delle risorse

## 🎯 Vantaggi di Ollama

✅ **Costi zero**: Nessuna API da pagare  
✅ **Privacy**: Tutti i dati rimangono locali  
✅ **Controllo**: Pieno controllo sui modelli  
✅ **Offline**: Funziona senza internet  
✅ **Scalabilità**: Facile migrazione a modelli cloud  

## 📞 Supporto

Se hai problemi:

1. Controlla i log: `docker-compose logs`
2. Verifica la connessione: `curl http://localhost:11434/api/tags`
3. Riavvia i servizi: `docker-compose restart`
4. Ricrea i container: `docker-compose down && docker-compose up -d`

---

**MediFlow** - La tua salute, il nostro flusso 🏥
