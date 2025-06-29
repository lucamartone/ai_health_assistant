const LLM_API_URL = 'http://localhost:8002/ai';

export const llmService = {
    async askHealthQuestion(message, conversationId = null, context = null) {
        try {
            const response = await fetch(`${LLM_API_URL}/chat/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    conversation_id: conversationId,
                    context
                })
            });

            if (!response.ok) {
                throw new Error('Errore nella risposta del server');
            }

            const data = await response.json();
            // The backend returns { message, ... } so we adapt for the frontend
            return { response: data.message };
        } catch (error) {
            console.error('Errore nella chiamata al servizio LLM:', error);
            throw error;
        }
    }
}; 