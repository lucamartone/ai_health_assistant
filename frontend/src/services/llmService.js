// URL del backend per tutte le operazioni AI
const BACKEND_URL = 'http://localhost:8001';

export const llmService = {
  // Verifica lo stato di Ollama tramite il backend
  async checkOllamaStatus() {
    try {
      const response = await fetch(`${BACKEND_URL}/llm/status/get_status`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Errore nel controllo dello stato di Ollama:', error);
      return {
        status: 'error',
        message: 'Impossibile verificare lo stato di Ollama'
      };
    }
  },

  async askHealthQuestion(message, conversationId = null, context = null, messageHistory = []) {
    try {
      console.log('🤖 Invio richiesta al backend:', { message, conversationId, context, historyLength: messageHistory.length });
      
      const payload = {
        message: message,
        conversation_id: conversationId,
        user_context: context,
        message_history: messageHistory
      };

      const response = await fetch(`${BACKEND_URL}/llm/chat/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Errore Backend API:', response.status, errorText);
        throw new Error(`Errore Backend: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Risposta dal backend:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Errore nella chiamata al backend:', error);
      throw error;
    }
  },

  async getHealthAdvice(prompt) {
    try {
      console.log('🏥 Richiesta consiglio sanitario:', prompt);
      
      const payload = {
        message: prompt,
        conversation_id: null,
        user_context: null,
        message_history: []
      };

      const response = await fetch(`${BACKEND_URL}/llm/chat/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Errore nella risposta del backend');
      }

      const data = await response.json();
      console.log('✅ Consiglio sanitario ricevuto:', data);
      
      return { response: data.response };
    } catch (error) {
      console.error('❌ Errore nella richiesta di consiglio sanitario:', error);
      throw error;
    }
  },

  async checkAIServiceStatus() {
    try {
      const response = await fetch(`${BACKEND_URL}/llm/status/get_status`);
      if (response.ok) {
        const data = await response.json();
        return {
          status: data.status === 'ready' ? 'healthy' : 'warning',
          provider: 'ollama',
          model: data.model || 'llama3.2',
          available_models: data.model ? [data.model] : []
        };
      }
      return { status: 'unhealthy', provider: 'ollama' };
    } catch (error) {
      console.error('❌ Errore nel controllo dello stato di Ollama:', error);
      return { status: 'error', provider: 'ollama', error: error.message };
    }
  }
}; 