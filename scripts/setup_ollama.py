#!/usr/bin/env python3
"""
Script per configurare Ollama e scaricare i modelli necessari
"""
import asyncio
import httpx
import time
import sys

OLLAMA_URL = "http://localhost:11434"
MODEL_NAME = "llama3.2"  # Modello di default

async def check_ollama_health():
    """Verifica se Ollama è in esecuzione"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{OLLAMA_URL}/api/tags")
            if response.status_code == 200:
                print("✅ Ollama è in esecuzione")
                return True
            else:
                print(f"❌ Ollama non risponde correttamente: {response.status_code}")
                return False
    except Exception as e:
        print(f"❌ Errore di connessione a Ollama: {e}")
        return False

async def list_models():
    """Lista i modelli disponibili"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{OLLAMA_URL}/api/tags")
            if response.status_code == 200:
                data = response.json()
                models = [model["name"] for model in data.get("models", [])]
                print(f"📋 Modelli disponibili: {models}")
                return models
            else:
                print("❌ Impossibile ottenere la lista dei modelli")
                return []
    except Exception as e:
        print(f"❌ Errore nel listare i modelli: {e}")
        return []

async def pull_model(model_name: str):
    """Scarica un modello"""
    try:
        print(f"📥 Scaricamento del modello {model_name}...")
        async with httpx.AsyncClient(timeout=300.0) as client:  # Timeout più lungo per il download
            response = await client.post(
                f"{OLLAMA_URL}/api/pull",
                json={"name": model_name}
            )
            if response.status_code == 200:
                print(f"✅ Modello {model_name} scaricato con successo")
                return True
            else:
                print(f"❌ Errore nel scaricare il modello: {response.status_code}")
                return False
    except Exception as e:
        print(f"❌ Errore nel scaricare il modello {model_name}: {e}")
        return False

async def test_model(model_name: str):
    """Testa un modello con una richiesta semplice"""
    try:
        print(f"🧪 Test del modello {model_name}...")
        async with httpx.AsyncClient(timeout=30.0) as client:
            payload = {
                "model": model_name,
                "messages": [
                    {
                        "role": "user",
                        "content": "Ciao! Come stai?"
                    }
                ],
                "stream": False
            }
            response = await client.post(f"{OLLAMA_URL}/api/chat", json=payload)
            if response.status_code == 200:
                data = response.json()
                message = data.get("message", {}).get("content", "")
                print(f"✅ Test riuscito! Risposta: {message[:100]}...")
                return True
            else:
                print(f"❌ Test fallito: {response.status_code}")
                return False
    except Exception as e:
        print(f"❌ Errore nel testare il modello: {e}")
        return False

async def main():
    """Funzione principale"""
    print("Setup Ollama per MedFlow")
    print("=" * 40)
    
    # Verifica che Ollama sia in esecuzione
    print("\n1️⃣ Verifica connessione Ollama...")
    if not await check_ollama_health():
        print("❌ Ollama non è in esecuzione. Avvia Ollama prima di continuare.")
        print("   Puoi usare: docker-compose up ollama")
        sys.exit(1)
    
    # Lista modelli esistenti
    print("\n2️⃣ Verifica modelli esistenti...")
    existing_models = await list_models()
    
    # Verifica se il modello richiesto è già presente
    if MODEL_NAME in existing_models:
        print(f"✅ Il modello {MODEL_NAME} è già presente")
    else:
        print(f"📥 Il modello {MODEL_NAME} non è presente, lo scarico...")
        if not await pull_model(MODEL_NAME):
            print("❌ Impossibile scaricare il modello")
            sys.exit(1)
    
    # Test del modello
    print(f"\n3️⃣ Test del modello {MODEL_NAME}...")
    if not await test_model(MODEL_NAME):
        print("❌ Test del modello fallito")
        sys.exit(1)
    
    print("\n🎉 Setup completato con successo!")
    print(f"✅ Ollama è configurato e il modello {MODEL_NAME} è pronto per l'uso")
    print("\n📋 Prossimi passi:")
    print("   1. Avvia l'applicazione: docker-compose up -d")
    print("   2. Testa la chat AI nell'interfaccia web")
    print("   3. Il modello risponderà in italiano per le domande sulla salute")

if __name__ == "__main__":
    asyncio.run(main())
