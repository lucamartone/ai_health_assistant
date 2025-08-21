#!/usr/bin/env python3
"""
Test per verificare che la cronologia della chat funzioni correttamente
"""

import asyncio
import aiohttp
import json

async def test_chat_with_history():
    """Testa la chat con cronologia"""
    print("🧪 Test Chat con Cronologia")
    print("=" * 50)
    
    # Simula una conversazione con cronologia
    conversation_history = [
        {"role": "user", "content": "Ho mal di testa da ieri"},
        {"role": "assistant", "content": "Il mal di testa può avere diverse cause. Puoi descrivermi meglio i sintomi? È un dolore pulsante, sordo, o localizzato in una zona specifica?"},
        {"role": "user", "content": "È un dolore pulsante sulla fronte"}
    ]
    
    # Nuovo messaggio che dovrebbe fare riferimento alla cronologia
    new_message = "Il dolore è peggiorato oggi"
    
    try:
        async with aiohttp.ClientSession() as session:
            # Prepara il payload con la cronologia
            payload = {
                "model": "llama3.2",
                "messages": [
                    {
                        "role": "system",
                        "content": "Sei un assistente sanitario AI professionale. Rispondi sempre in italiano."
                    }
                ] + conversation_history + [
                    {
                        "role": "user",
                        "content": new_message
                    }
                ],
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "num_predict": 500
                }
            }
            
            print(f"📤 Invio messaggio: '{new_message}'")
            print(f"📚 Cronologia: {len(conversation_history)} messaggi precedenti")
            
            async with session.post(
                'http://localhost:11434/api/chat',
                json=payload,
                timeout=aiohttp.ClientTimeout(total=60)
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    ai_response = data.get('message', {}).get('content', '')
                    
                    print(f"✅ Risposta ricevuta ({len(ai_response)} caratteri)")
                    print(f"🤖 AI: {ai_response[:200]}...")
                    
                    # Verifica che la risposta faccia riferimento al contesto precedente
                    context_keywords = ['mal di testa', 'dolore', 'fronte', 'pulsante']
                    has_context = any(keyword in ai_response.lower() for keyword in context_keywords)
                    
                    if has_context:
                        print("✅ La risposta fa riferimento al contesto precedente!")
                        return True
                    else:
                        print("⚠️  La risposta non sembra fare riferimento al contesto precedente")
                        return False
                        
                else:
                    print(f"❌ Errore nella risposta: {response.status}")
                    return False
                    
    except Exception as e:
        print(f"❌ Errore nel test: {e}")
        return False

async def test_chat_without_history():
    """Testa la chat senza cronologia per confronto"""
    print("\n🧪 Test Chat Senza Cronologia")
    print("=" * 50)
    
    # Messaggio isolato senza cronologia
    message = "Il dolore è peggiorato oggi"
    
    try:
        async with aiohttp.ClientSession() as session:
            payload = {
                "model": "llama3.2",
                "messages": [
                    {
                        "role": "system",
                        "content": "Sei un assistente sanitario AI professionale. Rispondi sempre in italiano."
                    },
                    {
                        "role": "user",
                        "content": message
                    }
                ],
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "num_predict": 500
                }
            }
            
            print(f"📤 Invio messaggio: '{message}'")
            print("📚 Nessuna cronologia")
            
            async with session.post(
                'http://localhost:11434/api/chat',
                json=payload,
                timeout=aiohttp.ClientTimeout(total=60)
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    ai_response = data.get('message', {}).get('content', '')
                    
                    print(f"✅ Risposta ricevuta ({len(ai_response)} caratteri)")
                    print(f"🤖 AI: {ai_response[:200]}...")
                    
                    return True
                else:
                    print(f"❌ Errore nella risposta: {response.status}")
                    return False
                    
    except Exception as e:
        print(f"❌ Errore nel test: {e}")
        return False

async def main():
    """Funzione principale"""
    print("🚀 Test Cronologia Chat - MediFlow")
    print("=" * 60)
    
    # Test con cronologia
    result_with_history = await test_chat_with_history()
    
    # Test senza cronologia
    result_without_history = await test_chat_without_history()
    
    print("\n" + "=" * 60)
    print("📊 Risultati Test:")
    print(f"✅ Test con cronologia: {'Superato' if result_with_history else 'Fallito'}")
    print(f"✅ Test senza cronologia: {'Superato' if result_without_history else 'Fallito'}")
    
    if result_with_history and result_without_history:
        print("\n🎉 Tutti i test sono stati superati!")
        print("💡 La cronologia della chat funziona correttamente!")
    else:
        print("\n⚠️  Alcuni test sono falliti.")
        print("🔧 Controlla la configurazione della chat.")

if __name__ == "__main__":
    asyncio.run(main())
