import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';
import AppPatient from './AppPatient';
import AppDoctor from './AppDoctor';
import AppAdmin from './AppAdmin';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { account, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Se l'utente è stato caricato e siamo sulla root, decidi dove mandarlo
    if (!loading && account) {
      if (location.pathname === '/') {
        if (account.role === 'admin') {
          navigate('/admin/', { replace: true });
        } else if (account.role === 'doctor') {
          navigate('/doctor/', { replace: true });
        }
        // Altrimenti resta su /
      }
    }
  }, [account, loading, navigate, location.pathname]);

  return (
    <>
      <Routes>
        <Route path="/*" element={<AppPatient />} />
        <Route path="/doctor/*" element={<AppDoctor />} />
        <Route path="/admin/*" element={<AppAdmin />} />
      </Routes>
    </>
  );
}

export default App;
