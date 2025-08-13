import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Controlla se c'è un admin salvato nel localStorage
    const savedAdmin = localStorage.getItem('admin');
    if (savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin));
      } catch (error) {
        console.error('Errore nel parsing admin salvato:', error);
        localStorage.removeItem('admin');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:8001/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const adminData = data.admin;
        
        // Salva admin nel localStorage
        localStorage.setItem('admin', JSON.stringify(adminData));
        setAdmin(adminData);
        
        return { success: true, data: adminData };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.detail || 'Errore di login' };
      }
    } catch (error) {
      console.error('Errore di rete:', error);
      return { success: false, error: 'Errore di connessione al server' };
    }
  };

  const logout = () => {
    localStorage.removeItem('admin');
    setAdmin(null);
  };

  const isAuthenticated = () => {
    return admin !== null;
  };

  return (
    <AdminContext.Provider value={{
      admin,
      loading,
      login,
      logout,
      isAuthenticated
    }}>
      {children}
    </AdminContext.Provider>
  );
}; 