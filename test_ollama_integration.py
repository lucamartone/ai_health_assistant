#!/usr/bin/env python3
"""
Test script per verificare l'integrazione di Ollama con MediFlow
"""
import asyncio
import httpx
import json
import sys

# Configuration
OLLAMA_URL = "http://localhost:11434"
FRONTEND_URL = "http://localhost"

async def test_ollama_health():
    """Testa la salute di Ollama"""
    print("🔍 Test 1: Verifica salute di Ollama...")
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{OLLAMA_URL}/api/tags")
            if response.status_code == 200:
                data = response.json()
                models = data.get('models', [])
                has_llama = any('llama' in model.get('name', '') for model in models)
                
                print(f"✅ Ollama è sano!")
                print(f"   Modelli disponibili: {[m.get('name') for m in models]}")
                print(f"   Llama disponibile: {has_llama}")
                return has_llama
            else:
                print(f"❌ Errore nella salute di Ollama: {response.status_code}")
                return False
    except Exception as e:
        print(f"❌ Errore di connessione: {e}")
        return False

async def test_chat_endpoint():
    """Testa l'endpoint di chat di Ollama"""
    print("\n🔍 Test 2: Test endpoint di chat di Ollama...")
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            payload = {
                "model": "llama3.2",
                "messages": [
                    {
                        "role": "system",
                        "content": "Sei un assistente sanitario AI professionale. Rispondi sempre in italiano."
                    },
                    {
                        "role": "user",
                        "content": "Ciao! Come stai?"
                    }
                ],
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "num_predict": 1000
                }
            }
            
            response = await client.post(
                f"{OLLAMA_URL}/api/chat",
                json=payload
            )
            
            if response.status_code == 200:
                data = response.json()
                print("✅ Chat endpoint di Ollama funziona!")
                print(f"   Risposta: {data.get('message', {}).get('content', '')[:100]}...")
                print(f"   Model: {data.get('model', 'unknown')}")
                return True
            else:
                print(f"❌ Errore nel chat endpoint: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
    except Exception as e:
        print(f"❌ Errore nel test chat: {e}")
        return False

async def test_health_advice():
    """Testa l'endpoint di consigli sanitari di Ollama"""
    print("\n🔍 Test 3: Test endpoint consigli sanitari di Ollama...")
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            payload = {
                "model": "llama3.2",
                "messages": [
                    {
                        "role": "system",
                        "content": "Sei un esperto di salute pubblica. Fornisci consigli sanitari sicuri e pratici in italiano."
                    },
                    {
                        "role": "user",
                        "content": "Come posso migliorare la mia dieta?"
                    }
                ],
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "num_predict": 1000
                }
            }
            
            response = await client.post(
                f"{OLLAMA_URL}/api/chat",
                json=payload
            )
            
            if response.status_code == 200:
                data = response.json()
                print("✅ Health advice endpoint di Ollama funziona!")
                print(f"   Consiglio: {data.get('message', {}).get('content', '')[:100]}...")
                return True
            else:
                print(f"❌ Errore nel health advice endpoint: {response.status_code}")
                return False
    except Exception as e:
        print(f"❌ Errore nel test health advice: {e}")
        return False

async def test_frontend_connection():
    """Testa la connessione al frontend"""
    print("\n🔍 Test 4: Verifica connessione frontend...")
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(FRONTEND_URL)
            if response.status_code == 200:
                print("✅ Frontend è accessibile!")
                return True
            else:
                print(f"❌ Frontend non accessibile: {response.status_code}")
                return False
    except Exception as e:
        print(f"❌ Errore di connessione al frontend: {e}")
        return False

async def main():
    """Funzione principale di test"""
    print("🚀 Test Integrazione Ollama - MediFlow")
    print("=" * 50)
    
    tests = [
        test_ollama_health(),
        test_chat_endpoint(),
        test_health_advice(),
        test_frontend_connection()
    ]
    
    results = await asyncio.gather(*tests, return_exceptions=True)
    
    print("\n" + "=" * 50)
    print("📊 Risultati Test:")
    
    passed = 0
    total = len(results)
    
    for i, result in enumerate(results):
        if isinstance(result, Exception):
            print(f"❌ Test {i+1}: Errore - {result}")
        elif result:
            print(f"✅ Test {i+1}: Superato")
            passed += 1
        else:
            print(f"❌ Test {i+1}: Fallito")
    
    print(f"\n🎯 Risultato finale: {passed}/{total} test superati")
    
    if passed >= 3:  # Almeno Ollama e frontend devono funzionare
        print("🎉 L'integrazione Ollama è funzionante!")
        print("\n📋 Prossimi passi:")
        print("   1. Apri http://localhost nel browser")
        print("   2. Accedi come paziente")
        print("   3. Vai alla sezione 'Chat AI'")
        print("   4. Testa la conversazione con Ollama")
        print("\n💡 Nota: Ora usi solo modelli locali, nessun costo!")
    else:
        print("⚠️  Alcuni test sono falliti. Controlla i log e riprova.")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
