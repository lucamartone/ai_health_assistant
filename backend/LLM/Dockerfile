FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

# Configure Ollama to listen on all interfaces
ENV OLLAMA_HOST=0.0.0.0

# Copy Python requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose ports
EXPOSE 5001 11434

# Start both services
COPY start.sh /start.sh
RUN chmod +x /start.sh
CMD ["/start.sh"]
