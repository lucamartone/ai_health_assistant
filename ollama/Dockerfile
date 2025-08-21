FROM ollama/ollama:latest

# Installa curl per il healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copia lo script di inizializzazione
COPY init-ollama.sh /init-ollama.sh
RUN chmod +x /init-ollama.sh

# Usa lo script di inizializzazione come entrypoint
ENTRYPOINT ["/init-ollama.sh"]
