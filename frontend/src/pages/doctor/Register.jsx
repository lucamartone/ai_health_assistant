import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Trash2 } from 'lucide-react'; // Puoi usare anche una tua icona

function Register() {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sex, setSex] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [addresses, setAddresses] = useState(['']);

  const navigate = useNavigate();

  const handleAddressChange = (index, value) => {
    const newAddresses = [...addresses];
    newAddresses[index] = value;
    setAddresses(newAddresses);
  };

  const addAddressField = () => {
    setAddresses([...addresses, '']);
  };

  const removeAddressField = (index) => {
    const newAddresses = addresses.filter((_, i) => i !== index);
    setAddresses(newAddresses);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 via-blue-400 to-blue-600 px-4">
      <div className="bg-white px-6 py-6 rounded-2xl shadow-xl w-full max-w-2xl text-blue-900 max-h-[72vh] mt-24 mb-12 overflow-y-auto">
        <h2 className="text-3xl font-bold text-center mb-2">Registrazione Dottore</h2>
        <p className="text-center text-sm text-blue-600 mb-4">
          Crea un nuovo profilo per fornire i tuoi servizi
        </p>

        <form className="space-y-4">
          {/* Nome + Cognome */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome"
              className="w-full px-4 py-3 rounded-md bg-blue-50 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              placeholder="Cognome"
              className="w-full px-4 py-3 rounded-md bg-blue-50 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email + Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3 rounded-md bg-blue-50 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 rounded-md bg-blue-50 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Specializzazione + Sesso */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="Specializzazione"
              className="w-full px-4 py-3 rounded-md bg-blue-50 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex justify-center items-center bg-blue-50 px-4 py-3 rounded-md text-blue-900">
              <span className="font-medium mr-4">Sesso:</span>
              <label className="flex items-center space-x-1 mr-4 cursor-pointer">
                <input
                  type="radio"
                  name="sex"
                  checked={sex === 'M'}
                  onChange={() => setSex('M')}
                  className="form-radio text-blue-600"
                />
                <span className="text-sm">M</span>
              </label>
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  name="sex"
                  checked={sex === 'F'}
                  onChange={() => setSex('F')}
                  className="form-radio text-blue-600"
                />
                <span className="text-sm">F</span>
              </label>
            </div>
          </div>

          {/* Indirizzi */}
          {addresses.map((address, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={address}
                onChange={(e) => handleAddressChange(index, e.target.value)}
                placeholder={`Indirizzo sede #${index + 1}`}
                className="w-full px-4 py-3 rounded-md bg-blue-50 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeAddressField(index)}
                  className="text-blue-600 hover:text-red-500"
                  title="Rimuovi sede"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}

          {/* Pulsante Aggiungi sede */}
          <div className="text-right">
            <button
              type="button"
              onClick={addAddressField}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              + Aggiungi sede
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition"
          >
            Registrati
          </button>
        </form>

        {/* Link Accedi / Registrati come paziente */}
        <p className="text-center text-sm text-blue-600 mt-4">
          Hai già un account?{' '}
          <span
            onClick={() => navigate('login')}
            className="text-blue-800 font-medium hover:text-blue-900 cursor-pointer"
          >
            Accedi
          </span>
        </p>
        <p className="text-center text-sm text-blue-600 mt-1">
          Sei un paziente?{' '}
          <span
            onClick={() => navigate('register')}
            className="text-blue-800 font-medium hover:text-blue-900 cursor-pointer"
          >
            Registrati come paziente
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;
