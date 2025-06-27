import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

const useApi = () => {
  const { refreshToken, isRefreshing } = useAuth();

  const apiCall = useCallback(async (url, options = {}) => {
    const defaultOptions = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      const response = await fetch(url, finalOptions);

      // Se la risposta è 401 e non stiamo già facendo refresh
      if (response.status === 401 && !isRefreshing) {
        const refreshed = await refreshToken();
        if (refreshed) {
          // Riprova la chiamata originale
          return await fetch(url, finalOptions);
        }
      }

      return response;
    } catch (error) {
      console.error('Errore nella chiamata API:', error);
      throw error;
    }
  }, [refreshToken, isRefreshing]);

  const get = useCallback((url, options = {}) => {
    return apiCall(url, { ...options, method: 'GET' });
  }, [apiCall]);

  const post = useCallback((url, data, options = {}) => {
    return apiCall(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }, [apiCall]);

  const put = useCallback((url, data, options = {}) => {
    return apiCall(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }, [apiCall]);

  const del = useCallback((url, options = {}) => {
    return apiCall(url, { ...options, method: 'DELETE' });
  }, [apiCall]);

  return {
    apiCall,
    get,
    post,
    put,
    delete: del,
  };
};

export default useApi; 