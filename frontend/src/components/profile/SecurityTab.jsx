// src/pages/tabs/SecurityTab.jsx
import { useState } from 'react';

function SecurityTab() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (password.length < 8) {
      setMessage('La password deve contenere almeno 8 caratteri.');
      return;
    }

    if (password !== confirm) {
      setMessage('Le password non coincidono.');
      return;
    }

    setLoading(true);
    try {
      // Simulazione chiamata API
      await new Promise((res) => setTimeout(res, 1000));
      setMessage('Password aggiornata con successo!');
      setPassword('');
      setConfirm('');
    } catch {
      setMessage('Errore durante l\'aggiornamento della password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Sicurezza Account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-semibold">Nuova Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            minLength={8}
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-semibold">Conferma Password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            minLength={8}
          />
        </div>
        {message && (
          <p className={`text-sm ${message.includes('successo') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          disabled={loading}
        >
          {loading ? 'Aggiornando...' : 'Aggiorna Password'}
        </button>
      </form>
    </div>
  );
}

export default SecurityTab;
