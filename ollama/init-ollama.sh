#!/bin/sh

echo "Inizializzazione Ollama..."
echo "Avvio del servizio Ollama..."

# Avvia Ollama in background
ollama serve &

# Aspetta che Ollama sia pronto
echo "Attendo che Ollama sia pronto..."
sleep 15

# Verifica che Ollama sia in esecuzione
echo "Verifico che Ollama sia in esecuzione..."
until curl -f http://localhost:11434/api/tags > /dev/null 2>&1; do
    echo "Ollama non è ancora pronto, attendo..."
    sleep 5
done

echo "Ollama è in esecuzione!"

# Controlla se il modello esiste già
echo "Verifico se il modello llama3.2 è già presente..."
if ollama list | grep -q "llama3.2"; then
    echo "Modello llama3.2 già presente!"
else
    echo "Scaricamento modello llama3.2..."
    ollama pull llama3.2
    echo "Modello scaricato con successo!"
fi

echo "Ollama è pronto per l'uso!"
echo "Modelli disponibili:"
ollama list

# Mantieni il container in esecuzione
wait
