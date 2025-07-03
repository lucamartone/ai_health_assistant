// src/pages/tabs/ProfileTab.jsx
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

function ProfileTab() {
  const { account, setAccount } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const updated = { ...account, [e.target.name]: e.target.value };
    setAccount(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // API call here (simulata)
      await new Promise(r => setTimeout(r, 1000));
      setSuccessMsg('Dati aggiornati con successo');
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg('Errore durante l\'aggiornamento');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Dati Personali</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          {isEditing ? 'Annulla' : 'Modifica'}
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm">Nome</label>
          <input
            name="name"
            type="text"
            value={account.name}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm">Cognome</label>
          <input
            name="surname"
            type="text"
            value={account.surname}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm">Telefono</label>
          <input
            name="phone"
            type="tel"
            value={account.phone || ''}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        {isEditing && (
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? 'Salvando...' : 'Salva'}
          </button>
        )}
        {successMsg && <p className="text-green-600 text-sm">{successMsg}</p>}
        {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}
      </form>
    </div>
  );
}

export default ProfileTab;
