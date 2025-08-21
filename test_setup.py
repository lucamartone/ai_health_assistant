#!/usr/bin/env python3
"""
Script di test per verificare che tutto il setup funzioni correttamente
"""

import asyncio
import aiohttp
import time
import sys
import json

async def test_ollama_health():
    """Testa la salute di Ollama"""
    print("🔍 Test 1: Verifica salute di Ollama...")
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get('http://localhost:11434/api/tags') as response:
                if response.status == 200:
                    data = await response.json()
                    models = [model['name'] for model in data.get('models', [])]
                    if 'llama3.2:latest' in models:
                        print("✅ Ollama è sano e ha il modello llama3.2!")
                        return True
                    else:
                        print("⚠️  Ollama è sano ma non ha il modello llama3.2")
                        return False
                else:
                    print(f"❌ Ollama non risponde: {response.status}")
                    return False
    except Exception as e:
        print(f"❌ Errore nel test di Ollama: {e}")
        return False

async def test_chat_functionality():
    """Testa la funzionalità di chat"""
    print("🔍 Test 2: Test funzionalità di chat...")
    
    try:
        async with aiohttp.ClientSession() as session:
            payload = {
                "model": "llama3.2",
                "prompt": "Ciao, rispondi solo con 'OK'",
                "stream": False
            }
            
            async with session.post('http://localhost:11434/api/generate', 
                                  json=payload, 
                                  timeout=aiohttp.ClientTimeout(total=60)) as response:
                if response.status == 200:
                    data = await response.json()
                    if 'response' in data:
                        print("✅ Chat funziona correttamente!")
                        return True
                    else:
                        print("❌ Risposta non valida da Ollama")
                        return False
                else:
                    print(f"❌ Errore nella chat: {response.status}")
                    return False
    except Exception as e:
        print(f"❌ Errore nel test di chat: {e}")
        return False

async def test_frontend():
    """Testa il frontend"""
    print("🔍 Test 3: Verifica frontend...")
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get('http://localhost') as response:
                if response.status == 200:
                    print("✅ Frontend è accessibile!")
                    return True
                else:
                    print(f"❌ Frontend non risponde: {response.status}")
                    return False
    except Exception as e:
        print(f"❌ Errore nel test del frontend: {e}")
        return False

async def wait_for_services():
    """Aspetta che i servizi siano pronti"""
    print("⏳ Aspetto che i servizi siano pronti...")
    
    max_attempts = 30
    for attempt in range(max_attempts):
        try:
            async with aiohttp.ClientSession() as session:
                # Test Ollama
                async with session.get('http://localhost:11434/api/tags') as response:
                    if response.status == 200:
                        data = await response.json()
                        models = [model['name'] for model in data.get('models', [])]
                        if 'llama3.2:latest' in models:
                            print("✅ Ollama è pronto!")
                            break
                
                # Test Frontend
                async with session.get('http://localhost') as response:
                    if response.status == 200:
                        print("✅ Frontend è pronto!")
                        break
                        
        except Exception:
            pass
        
        print(f"⏳ Tentativo {attempt + 1}/{max_attempts}...")
        await asyncio.sleep(10)
    else:
        print("⚠️  Timeout nell'attesa dei servizi")

async def main():
    """Funzione principale"""
    print("🚀 Test Setup Completo - MediFlow")
    print("=" * 50)
    
    # Aspetta che i servizi siano pronti
    await wait_for_services()
    
    # Esegui i test
    tests = [
        test_ollama_health(),
        test_chat_functionality(),
        test_frontend()
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
    
    if passed == total:
        print("🎉 Setup completato con successo!")
        print("\n📋 L'applicazione è pronta:")
        print("   🌐 Frontend: http://localhost")
        print("   🤖 Ollama: http://localhost:11434")
        print("   📊 Backend: http://localhost:8001")
        print("\n💡 Ora puoi usare l'applicazione con modelli locali!")
    else:
        print("⚠️  Alcuni test sono falliti. Controlla i log.")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
