import api from '../../hooks/useApi';

export async function ask(message, activeConversation, userContext, messageHistory) {
    const data = { 
        message, 
        conversation_id: activeConversation, 
        user_context: userContext, 
        message_history: messageHistory
    };
    return await api.post('/llm/chat/ask', data);
}