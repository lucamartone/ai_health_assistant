import { useCallback } from 'react';

const useApi = () => {
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
      return response;
    } catch (error) {
      console.error('Errore nella chiamata API:', error);
      throw error;
    }
  }, []);

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