import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasAttemptedRefresh, setHasAttemptedRefresh] = useState(false);

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
          setHasAttemptedRefresh(false); // Reset del flag
          return true;
        }
      } else if (response.status === 401 && !isRefreshAttempt && !hasAttemptedRefresh) {
        // Token scaduto, prova a fare refresh solo una volta
        console.log('Token scaduto, tentativo di refresh...');
        return await refreshToken();
      }
      
      setAccount(null);
      return false;
    } catch (error) {
      console.error('Errore nel fetch dei dati utente:', error);
      setAccount(null);
      return false;
    }
  }, [hasAttemptedRefresh]);

  // Funzione per refresh del token
  const refreshToken = useCallback(async () => {
    if (isRefreshing || hasAttemptedRefresh) {
      console.log('Refresh già in corso o già tentato');
      return false;
    }
    
    setIsRefreshing(true);
    setHasAttemptedRefresh(true);
    
    try {
      console.log('Tentativo di refresh del token...');
      const response = await fetch('http://localhost:8001/profile/cookies/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        console.log('Token refreshato con successo');
        // Token refreshato con successo, riprova a ottenere i dati utente
        return await fetchUserData(true);
      } else {
        console.log('Refresh fallito, utente deve fare login');
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
  }, [fetchUserData, isRefreshing, hasAttemptedRefresh]);

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
      setHasAttemptedRefresh(false); // Reset del flag
    }
  }, []);

  // Inizializzazione
  useEffect(() => {
    console.log('Inizializzazione AuthContext...');
    fetchUserData().finally(() => setLoading(false));
  }, [fetchUserData]);

  // Setup refresh automatico ogni 50 minuti (solo se l'utente è autenticato)
  useEffect(() => {
    if (!account) return;

    const refreshInterval = setInterval(() => {
      console.log('Refresh automatico del token...');
      refreshToken();
    }, 50 * 60 * 1000); // 50 minuti

    return () => clearInterval(refreshInterval);
  }, [account, refreshToken]);

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
