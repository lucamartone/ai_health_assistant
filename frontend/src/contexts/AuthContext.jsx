import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasAttemptedRefresh, setHasAttemptedRefresh] = useState(false);

  // Chiamata all'endpoint /me per ottenere i dati utente
  const fetchUserData = useCallback(async (isRefreshAttempt = false) => {
    try {
      const response = await fetch('http://localhost:8001/profile/cookies/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.account) {
          console.log('✅ Utente ricevuto:', data.account);
          setAccount(data.account);
          setHasAttemptedRefresh(false); // Reset del flag
          return true;
        }
      } else if (response.status === 401 && !isRefreshAttempt && !hasAttemptedRefresh) {
        console.log('🔁 Token scaduto, provo refresh...');
        return await refreshToken();
      }

      setAccount(null);
      return false;
    } catch (error) {
      console.error('  Errore nel fetch dei dati utente:', error);
      setAccount(null);
      return false;
    }
  }, [hasAttemptedRefresh]);

  // 🔁 Refresh del token se scaduto
  const refreshToken = useCallback(async () => {
    if (isRefreshing || hasAttemptedRefresh) {
      console.log('⚠️ Refresh già in corso o tentato');
      return false;
    }

    setIsRefreshing(true);
    setHasAttemptedRefresh(true);

    try {
      console.log('🔄 Tentativo di refresh del token...');
      const response = await fetch('http://localhost:8001/profile/cookies/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        console.log('✅ Token refreshato');
        return await fetchUserData(true);
      } else {
        console.log('  Refresh fallito, logout richiesto');
        setAccount(null);
        return false;
      }
    } catch (error) {
      console.error(' Errore durante il refresh del token:', error);
      setAccount(null);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchUserData, isRefreshing, hasAttemptedRefresh]);

  // Logout manuale
  const logout = useCallback(async () => {
    try {
      await fetch('http://localhost:8001/profile/account/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error(' Errore durante il logout:', error);
    } finally {
      setAccount(null);
      setHasAttemptedRefresh(false);
    }
  }, []);

  // ✅ Esposto pubblicamente: aggiorna l'account dal backend
  const refreshAccount = useCallback(async () => {
    const success = await fetchUserData();
    if (!success) {
      console.warn('⚠️ refreshAccount: impossibile aggiornare account dal backend');
    }
  }, [fetchUserData]);

  // ✅ Caricamento iniziale al mount
  useEffect(() => {
    console.log('🔧 Inizializzazione AuthContext...');
    fetchUserData().finally(() => setLoading(false));
  }, [fetchUserData]);

  // ⏱️ Auto-refresh token ogni 50 minuti (se loggato)
  useEffect(() => {
    if (!account) return;

    const refreshInterval = setInterval(() => {
      console.log('♻️ Auto-refresh del token...');
      refreshToken();
    }, 50 * 60 * 1000); // ogni 50 minuti

    return () => clearInterval(refreshInterval);
  }, [account, refreshToken]);

  return (
    <AuthContext.Provider value={{
      account,
      setAccount,
      loading,
      logout,
      refreshToken,
      isRefreshing,
      refreshAccount,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
