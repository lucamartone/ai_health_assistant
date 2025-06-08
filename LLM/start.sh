#!/bin/bash

# Start Ollama in the background
ollama serve &

# Wait for Ollama to be ready
sleep 5

# Pull the Mistral model (lighter than Mixtral)
ollama pull mistral

# Start the FastAPI application
uvicorn main:app --host 0.0.0.0 --port 5001 