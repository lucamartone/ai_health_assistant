import api from '../../hooks/useApi';

export async function ask(message, activeConversation, userContext, messageHistory) {
    const data = { message, activeConversation, userContext, messageHistory};
    return await api.post('/llm/chat/ask', data);
}