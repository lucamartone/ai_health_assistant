#!/usr/bin/env python3
"""
Test script per verificare l'implementazione AI nel backend
"""

import requests
import json
import time

BACKEND_URL = "http://localhost:8001"

def test_ollama_status():
    """Test dello stato di Ollama"""
    print("🔍 Testando lo stato di Ollama...")
    try:
        response = requests.get(f"{BACKEND_URL}/llm/status/get_status")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Stato Ollama: {data}")
            return data
        else:
            print(f"❌ Errore nel controllo dello stato: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Errore di connessione: {e}")
        return None

def test_chat_endpoint():
    """Test dell'endpoint di chat"""
    print("\n🤖 Testando l'endpoint di chat...")
    
    # Test con un messaggio semplice
    payload = {
        "message": "Ciao, come stai?",
        "conversation_id": "test_123",
        "user_context": {
            "eta": 30,
            "sesso": "maschio",
            "patologie": ["ipertensione"]
        },
        "message_history": []
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/llm/chat/ask",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Risposta ricevuta:")
            print(f"   - Risposta: {data.get('response', 'N/A')[:100]}...")
            print(f"   - Modello: {data.get('model', 'N/A')}")
            print(f"   - Provider: {data.get('provider', 'N/A')}")
            print(f"   - Suggerimenti: {data.get('suggestions', [])}")
            return True
        else:
            print(f"❌ Errore nella chat: {response.status_code}")
            print(f"   Risposta: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Errore di connessione: {e}")
        return False

def test_health_advice():
    """Test di consiglio sanitario"""
    print("\n🏥 Testando consiglio sanitario...")
    
    payload = {
        "message": "Ho mal di testa da due giorni, cosa dovrei fare?",
        "conversation_id": "health_test",
        "user_context": None,
        "message_history": []
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/llm/chat/ask",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Consiglio sanitario ricevuto:")
            print(f"   - Risposta: {data.get('response', 'N/A')[:150]}...")
            return True
        else:
            print(f"❌ Errore nel consiglio sanitario: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Errore di connessione: {e}")
        return False

def main():
    """Funzione principale di test"""
    print("🚀 Avvio test dell'implementazione AI nel backend")
    print("=" * 50)
    
    # Test 1: Stato di Ollama
    status = test_ollama_status()
    
    if status and status.get('status') == 'ready':
        print("\n✅ Ollama è pronto, procedendo con i test di chat...")
        
        # Test 2: Chat semplice
        chat_success = test_chat_endpoint()
        
        # Test 3: Consiglio sanitario
        health_success = test_health_advice()
        
        if chat_success and health_success:
            print("\n🎉 Tutti i test sono passati con successo!")
            print("✅ L'implementazione AI nel backend funziona correttamente")
        else:
            print("\n⚠️  Alcuni test sono falliti")
    else:
        print("\n⚠️  Ollama non è pronto. Assicurati che:")
        print("   1. Il backend sia in esecuzione")
        print("   2. Ollama sia in esecuzione")
        print("   3. Il modello llama3.2 sia scaricato")

if __name__ == "__main__":
    main()
