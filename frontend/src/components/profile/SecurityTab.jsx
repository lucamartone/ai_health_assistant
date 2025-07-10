import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword, logout } from '../../services/profile/fetch_profile';
import { useAuth } from '../../contexts/AuthContext';
import SimpleModal from '../SimpleModal';

function SecurityTab() {
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const { account } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validazione base
    if (!password || !newPassword) {
      setModalMessage('Compila entrambi i campi.');
      return;
    }
    if (newPassword.length < 8) {
      setModalMessage('La nuova password deve contenere almeno 8 caratteri.');
      return;
    }
    if (password === newPassword) {
      setModalMessage('La nuova password deve essere diversa da quella attuale.');
      return;
    }

    setLoading(true);
    try {
      const data = await changePassword(password, newPassword, account.email);
      if (data.message) {
        setModalMessage('Password aggiornata con successo!');
        setPassword('');
        setNewPassword('');
        setPasswordChangeSuccess(true);
      }
    } catch (err) {
       setModalMessage(err.detail);
       setPasswordChangeSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = async () => {
    setModalMessage('');
    if (passwordChangeSuccess) {
      navigate('/');
      await logout();
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Sicurezza Account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-semibold">Vecchia Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            minLength={8}
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-semibold">Nuova Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            minLength={8}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          disabled={loading}
        >
          {loading ? 'Aggiornando...' : 'Aggiorna Password'}
        </button>
      </form>

      {/* Modale gestito solo se c'è un messaggio */}
      {modalMessage && (
        <SimpleModal message={modalMessage} onClose={handleCloseModal} />
      )}
    </div>
  );
}

export default SecurityTab;
