import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  console.log('Chiamo /me...');
  fetch(`${import.meta.env.VITE_BACKEND_URL}/profile/cookies/me`, {
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
      if (data?.account) {
        console.log('Utente ricevuto:', data.account);
        setAccount(data.account);
      }
    })
    .catch((err) => {
      console.log('Errore:', err);
      setAccount(null);
    })
    .finally(() => setLoading(false));
  }, []);


  return (
    <AuthContext.Provider value={{ account, setAccount, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
