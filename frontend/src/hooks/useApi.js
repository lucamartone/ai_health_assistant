import { useCallback } from 'react';

const API_BASE_URL = 'http://localhost:8001';

const apiCall = async (url, options = {}) => {
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const finalOptions = { ...defaultOptions, ...options };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, finalOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Errore nella chiamata API:', error);
    throw error;
  }
};

// Istanza diretta dell'API (per uso fuori dai componenti React)
const api = {
  get: (url, options = {}) => {
    return apiCall(url, { ...options, method: 'GET' });
  },

  post: (url, data, options = {}) => {
    return apiCall(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put: (url, data, options = {}) => {
    return apiCall(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: (url, options = {}) => {
    return apiCall(url, { ...options, method: 'DELETE' });
  },
};

// Hook React (per uso dentro i componenti)
const useApi = () => {
  const apiCallHook = useCallback(async (url, options = {}) => {
    return apiCall(url, options);
  }, []);

  const get = useCallback((url, options = {}) => {
    return apiCall(url, { ...options, method: 'GET' });
  }, []);

  const post = useCallback((url, data, options = {}) => {
    return apiCall(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }, []);

  const put = useCallback((url, data, options = {}) => {
    return apiCall(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }, []);

  const del = useCallback((url, options = {}) => {
    return apiCall(url, { ...options, method: 'DELETE' });
  }, []);

  return {
    apiCall: apiCallHook,
    get,
    post,
    put,
    delete: del,
  };
};

// Esporta sia l'hook che l'istanza diretta
export { useApi };
export default api; 