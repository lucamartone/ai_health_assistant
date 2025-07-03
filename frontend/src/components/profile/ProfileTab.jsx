// src/pages/tabs/ProfileTab.jsx
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { modify_profile } from '../../services/profile/fetch_profile';

function ProfileTab() {
  const { account, setAccount } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState(account.name || '');
  const [surname, setSurname] = useState(account.surname || '');
  const [phone, setPhone] = useState(account.phone || '');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      //modifica il profile ul click del bott di modifica
      const data = await modify_profile(name, surname, phone, account.email);
      console.log("dati");
      setSuccessMsg('Dati aggiornati con successo');
      setAccount({ ...account, name, surname, phone });
      navigate(location.pathname, { replace: true });
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isEditing}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm">Cognome</label>
          <input
            name="surname"
            type="text"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            disabled={!isEditing}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm">Telefono</label>
          <input
            name="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
