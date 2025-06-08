const LLM_API_URL = 'http://localhost:5001/api';

export const llmService = {
    async askHealthQuestion(query, context = '') {
        try {
            const response = await fetch(`${LLM_API_URL}/health-query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    context
                })
            });

            if (!response.ok) {
                throw new Error('Errore nella risposta del server');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Errore nella chiamata al servizio LLM:', error);
            throw error;
        }
    }
}; 