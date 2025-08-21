FROM ollama/ollama:latest

# Installa curl e dos2unix (per normalizzare CRLF->LF), poi pulisci
RUN apt-get update && apt-get install -y --no-install-recommends \
      curl dos2unix \
    && rm -rf /var/lib/apt/lists/*

# Copia lo script (assicurati che esista nel build context!)
COPY init-ollama.sh /init-ollama.sh

# Normalizza line endings e rendi eseguibile
RUN dos2unix /init-ollama.sh && chmod +x /init-ollama.sh

# (facoltativo) debug: verifica che il file esista
# RUN ls -l /init-ollama.sh && head -n 2 /init-ollama.sh

ENTRYPOINT ["/init-ollama.sh"]

