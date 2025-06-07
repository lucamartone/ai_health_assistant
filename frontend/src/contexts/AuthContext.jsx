import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  console.log('Chiamo /me...');
  fetch('http://localhost:8001/profile/cookies/me', {
    credentials: 'include', // 🔥 obbligatorio per inviare il cookie
  })
    .then((res) => {
      if (!res.ok) {
        if (res.status === 401) return null;
        throw new Error();
      }
      return res.json();
    })
    .then((data) => {
      if (data?.user) {
        console.log('Utente ricevuto:', data.user);
        setUser(data.user);
      }
    })
    .catch((err) => {
      console.log('Errore:', err);
      setUser(null);
    })
    .finally(() => setLoading(false));
  }, []);


  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
