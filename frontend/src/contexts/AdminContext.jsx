import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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
  const [doctorRequests, setDoctorRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

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

  // Carica le richieste salvate dal localStorage all'avvio
  useEffect(() => {
    const savedRequests = localStorage.getItem('admin_doctor_requests');
    if (savedRequests) {
      try {
        setDoctorRequests(JSON.parse(savedRequests));
      } catch (error) {
        console.error('Errore nel parsing richieste salvate:', error);
        localStorage.removeItem('admin_doctor_requests');
      }
    }
  }, []);

  // Salva le richieste nel localStorage quando cambiano
  useEffect(() => {
    if (doctorRequests.length > 0) {
      localStorage.setItem('admin_doctor_requests', JSON.stringify(doctorRequests));
    }
  }, [doctorRequests]);

  const fetchDoctorRequests = useCallback(async () => {
    setRequestsLoading(true);
    try {
      const response = await fetch('http://localhost:8001/admin/doctor-requests');
      if (response.ok) {
        const data = await response.json();
        const requests = data.pending_requests || [];
        
        // Salva nel localStorage
        localStorage.setItem('admin_doctor_requests', JSON.stringify(requests));
        setDoctorRequests(requests);
        
        return requests;
      } else {
        console.error('Errore nel caricamento delle richieste:', response.status);
        return [];
      }
    } catch (error) {
      console.error('Errore di rete:', error);
      return [];
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  const updateDoctorRequest = useCallback((requestId, newStatus, adminNotes = '') => {
    setDoctorRequests(prev => {
      const updated = prev.map(req => 
        req.id === requestId 
          ? { ...req, status: newStatus, admin_notes: adminNotes }
          : req
      );
      
      // Aggiorna il localStorage
      localStorage.setItem('admin_doctor_requests', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const approveDoctorRequest = useCallback(async (requestId, adminNotes) => {
    try {
      const formData = new FormData();
      formData.append('admin_notes', adminNotes);

      const response = await fetch(`http://localhost:8001/admin/approve-doctor/${requestId}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        updateDoctorRequest(requestId, 'approved', adminNotes);
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.detail };
      }
    } catch (error) {
      console.error('Errore durante l\'approvazione:', error);
      return { success: false, error: 'Errore di rete durante l\'operazione' };
    }
  }, [updateDoctorRequest]);

  const rejectDoctorRequest = useCallback(async (requestId, adminNotes) => {
    try {
      const formData = new FormData();
      formData.append('admin_notes', adminNotes);

      const response = await fetch(`http://localhost:8001/admin/reject-doctor/${requestId}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        updateDoctorRequest(requestId, 'rejected', adminNotes);
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.detail };
      }
    } catch (error) {
      console.error('Errore durante il rifiuto:', error);
      return { success: false, error: 'Errore di rete durante l\'operazione' };
    }
  }, [updateDoctorRequest]);

  const login = useCallback(async (email, password) => {
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
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('admin');
    localStorage.removeItem('admin_doctor_requests');
    setAdmin(null);
    setDoctorRequests([]);
  }, []);

  const isAuthenticated = useCallback(() => {
    return admin !== null;
  }, [admin]);

  return (
    <AdminContext.Provider value={{
      admin,
      loading,
      doctorRequests,
      requestsLoading,
      fetchDoctorRequests,
      approveDoctorRequest,
      rejectDoctorRequest,
      updateDoctorRequest,
      login,
      logout,
      isAuthenticated
    }}>
      {children}
    </AdminContext.Provider>
  );
}; 