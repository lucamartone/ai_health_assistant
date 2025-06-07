import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);         // es: { id, email, name, ... }
  const [loading, setLoading] = useState(true);   // per mostrare "caricamento" iniziale

  useEffect(() => {
    // Verifica se l'utente è loggato tramite cookie al primo caricamento
    fetch('http://localhost:8001/profile/cookies/me', {
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
