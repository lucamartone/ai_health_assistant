import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Funzione per chiamare l'endpoint /me con gestione automatica del refresh
  const fetchUserData = useCallback(async (isRefreshAttempt = false) => {
    try {
      const response = await fetch('http://localhost:8001/profile/cookies/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.account) {
          console.log('Utente ricevuto:', data.account);
          setAccount(data.account);
          return true;
        }
      } else if (response.status === 401 && !isRefreshAttempt) {
        // Token scaduto, prova a fare refresh
        return await refreshToken();
      }
      
      setAccount(null);
      return false;
    } catch (error) {
      console.error('Errore nel fetch dei dati utente:', error);
      setAccount(null);
      return false;
    }
  }, []);

  // Funzione per refresh del token
  const refreshToken = useCallback(async () => {
    if (isRefreshing) return false;
    
    setIsRefreshing(true);
    try {
      const response = await fetch('http://localhost:8001/profile/cookies/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        // Token refreshato con successo, riprova a ottenere i dati utente
        return await fetchUserData(true);
      } else {
        // Refresh fallito, utente deve fare login
        setAccount(null);
        return false;
      }
    } catch (error) {
      console.error('Errore nel refresh del token:', error);
      setAccount(null);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchUserData, isRefreshing]);

  // Funzione per logout
  const logout = useCallback(async () => {
    try {
      await fetch('http://localhost:8001/profile/account/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Errore durante il logout:', error);
    } finally {
      setAccount(null);
    }
  }, []);

  // Inizializzazione e setup del refresh automatico
  useEffect(() => {
    console.log('Chiamo /me...');
    fetchUserData().finally(() => setLoading(false));

    // Setup refresh automatico ogni 50 minuti (prima che scada l'access token)
    const refreshInterval = setInterval(() => {
      if (account) {
        refreshToken();
      }
    }, 50 * 60 * 1000); // 50 minuti

    return () => clearInterval(refreshInterval);
  }, [fetchUserData, refreshToken, account]);

  // Interceptor per gestire automaticamente i 401 nelle chiamate API
  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      // Se la risposta è 401 e non stiamo già facendo refresh
      if (response.status === 401 && !isRefreshing && args[0].includes('localhost:8001')) {
        const refreshed = await refreshToken();
        if (refreshed) {
          // Riprova la chiamata originale
          return await originalFetch(...args);
        }
      }
      
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [refreshToken, isRefreshing]);

  return (
    <AuthContext.Provider value={{ 
      account, 
      setAccount, 
      loading, 
      logout,
      refreshToken,
      isRefreshing 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
