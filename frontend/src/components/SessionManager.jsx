import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const SessionManager = () => {
  const { account, logout, refreshToken } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!account) return;

    // Controlla la sessione ogni minuto
    const sessionCheckInterval = setInterval(() => {
      // Simula il controllo della scadenza (in produzione dovresti controllare il token)
      const tokenExpiry = localStorage.getItem('tokenExpiry');
      if (tokenExpiry) {
        const expiryTime = new Date(tokenExpiry).getTime();
        const now = new Date().getTime();
        const timeUntilExpiry = expiryTime - now;

        if (timeUntilExpiry <= 5 * 60 * 1000 && timeUntilExpiry > 0) {
          // Mostra warning 5 minuti prima della scadenza
          setShowWarning(true);
          setTimeLeft(Math.ceil(timeUntilExpiry / 1000 / 60));
        } else if (timeUntilExpiry <= 0) {
          // Sessione scaduta
          logout();
        }
      }
    }, 60000); // Controlla ogni minuto

    return () => clearInterval(sessionCheckInterval);
  }, [account, logout]);

  const handleExtendSession = async () => {
    try {
      await refreshToken();
      setShowWarning(false);
    } catch (error) {
      console.error('Errore nel refresh della sessione:', error);
      logout();
    }
  };

  const handleLogout = () => {
    setShowWarning(false);
    logout();
  };

  if (!showWarning) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed top-4 right-4 z-50 max-w-sm w-full"
      >
        <div className="bg-amber-50 border border-amber-200 rounded-lg shadow-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-amber-800">
                Sessione in scadenza
              </h3>
              <div className="mt-1 text-sm text-amber-700">
                <p>
                  La tua sessione scadrà tra {timeLeft} minuti. 
                  Vuoi estendere la sessione?
                </p>
              </div>
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={handleExtendSession}
                  className="bg-amber-600 text-white px-3 py-1.5 text-xs font-medium rounded hover:bg-amber-700 transition-colors"
                >
                  Estendi sessione
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-gray-200 text-gray-800 px-3 py-1.5 text-xs font-medium rounded hover:bg-gray-300 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
            <div className="ml-3 flex-shrink-0">
              <button
                onClick={() => setShowWarning(false)}
                className="text-amber-400 hover:text-amber-600"
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SessionManager; 