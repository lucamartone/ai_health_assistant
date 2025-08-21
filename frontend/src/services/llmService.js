// Usa localhost quando eseguito nel browser, ollama quando nel container
const OLLAMA_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:11434' 
  : 'http://ollama:11434';

// URL del backend per verificare lo stato di Ollama
const BACKEND_URL = 'http://localhost:8001';

export const llmService = {
  // Verifica lo stato di Ollama
  async checkOllamaStatus() {
    try {
      const response = await fetch(`${BACKEND_URL}/ollama/status`);
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
            console.log('🤖 Invio richiesta a Ollama:', { message, conversationId, context, historyLength: messageHistory.length });
            
            // Prepare system prompt for health context
            const systemPrompt = `Sei un assistente sanitario AI professionale e compassionevole. Il tuo ruolo è:
1. Fornire informazioni sanitarie accurate e basate su evidenze
2. Aiutare a comprendere sintomi e condizioni mediche
3. Suggerire quando consultare un medico
4. Offrire consigli su stili di vita sani
5. Riconoscere situazioni di emergenza e guidare verso assistenza medica immediata
6. Suggerire specializzazioni mediche in base alla diagnosi

Rispondi sempre in italiano e sii utile ma cauto nelle raccomandazioni mediche.

${context ? `Contesto utente: ${JSON.stringify(context, null, 2)}` : ''}`;

            // Costruisci l'array dei messaggi includendo la cronologia
            const messages = [
                {
                    role: "system",
                    content: systemPrompt
                }
            ];

            // Aggiungi la cronologia dei messaggi precedenti
            if (messageHistory && messageHistory.length > 0) {
                messageHistory.forEach(msg => {
                    messages.push({
                        role: msg.role || (msg.sender === 'user' ? 'user' : 'assistant'),
                        content: msg.content || msg.text || msg.message
                    });
                });
            }

            // Aggiungi il messaggio corrente
            messages.push({
                role: "user",
                content: message
            });

            const payload = {
                model: "llama3.2",
                messages: messages,
                stream: false,
                options: {
                    temperature: 0.7,
                    num_predict: 1000,
                    top_k: 40,
                    top_p: 0.9,
                    repeat_penalty: 1.1
                }
            };
            
            const response = await fetch(`${OLLAMA_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Errore Ollama API:', response.status, errorText);
                throw new Error(`Errore Ollama: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Risposta da Ollama:', data);
            
            return { 
                response: data.message?.content || data.message || "Mi dispiace, non ho ricevuto una risposta valida.",
                confidence: 0.9,
                suggestions: [],
                provider: 'ollama',
                model: 'llama3.2',
                usage: {
                    prompt_tokens: data.prompt_eval_count || 0,
                    completion_tokens: data.eval_count || 0,
                    total_tokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
                }
            };
        } catch (error) {
            console.error('❌ Errore nella chiamata a Ollama:', error);
            throw error;
        }
    },

    async getHealthAdvice(prompt) {
        try {
            console.log('🏥 Richiesta consiglio sanitario:', prompt);
            
            const systemPrompt = `Sei un esperto di salute pubblica. Fornisci consigli sanitari:
1. Basati su evidenze scientifiche
2. Sicuri e pratici
3. Adattati al contesto italiano
4. Con disclaimer appropriati
5. Che incoraggino la consultazione medica quando necessario
Usa un tono informativo ma accessibile.`;

            const payload = {
                model: "llama3.2",
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                stream: false,
                options: {
                    temperature: 0.7,
                    num_predict: 1000
                }
            };
            
            const response = await fetch(`${OLLAMA_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Errore nella risposta di Ollama');
            }

            const data = await response.json();
            console.log('✅ Consiglio sanitario ricevuto:', data);
            
            return { response: data.message?.content || data.message || "Non è possibile fornire consigli al momento." };
        } catch (error) {
            console.error('❌ Errore nella richiesta di consiglio sanitario:', error);
            throw error;
        }
    },

    async checkAIServiceStatus() {
        try {
            const response = await fetch(`${OLLAMA_URL}/api/tags`);
            if (response.ok) {
                const data = await response.json();
                const models = data.models || [];
                const hasLlama = models.some(model => model.name.includes('llama'));
                
                return {
                    status: hasLlama ? 'healthy' : 'warning',
                    provider: 'ollama',
                    model: 'llama3.2',
                    available_models: models.map(m => m.name)
                };
            }
            return { status: 'unhealthy', provider: 'ollama' };
        } catch (error) {
            console.error('❌ Errore nel controllo dello stato di Ollama:', error);
            return { status: 'error', provider: 'ollama', error: error.message };
        }
    }
}; 