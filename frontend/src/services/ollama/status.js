import api from '../../hooks/useApi';

export async function checkLLMStatus() {
    return await api.get('/llm/get_status');
};