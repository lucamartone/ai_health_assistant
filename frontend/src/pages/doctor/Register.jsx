import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { register } from '../../services/profile/doctor_profile';
import AddressAutocomplete from '../../components/AddressAutocomplete';
import SimpleModal from '../../components/SimpleModal';

const SPECIALIZATIONS = [
  "Allergologia", "Anestesia e Rianimazione", "Cardiologia", "Chirurgia Generale",
  "Dermatologia", "Endocrinologia", "Gastroenterologia", "Ginecologia",
  "Medicina Generale", "Nefrologia", "Neurologia", "Oculistica", "Oncologia",
  "Ortopedia", "Otorinolaringoiatria", "Pediatria", "Psichiatria", "Psicologia",
  "Radiologia", "Urologia"
];

function Register() {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sex, setSex] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [locations, setLocations] = useState([{ address: '', latitude: null, longitude: null }]);
  const [passwordError, setPasswordError] = useState('');
  const [modalMessage, setModalMessage] = useState('');


  const navigate = useNavigate();

  const validatePassword = (pwd) => {
    if (pwd.length < 8) return 'La password deve contenere almeno 8 caratteri';
    if (!/[A-Z]/.test(pwd)) return 'La password deve contenere almeno una lettera maiuscola';
    if (!/[a-z]/.test(pwd)) return 'La password deve contenere almeno una lettera minuscola';
    if (!/[0-9]/.test(pwd)) return 'La password deve contenere almeno un numero';
    return '';
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    setPasswordError(validatePassword(value));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (passwordError) return;
    try {
      const data = await register(name, surname, email, password, sex, locations, specialization);
      console.log('Registrazione riuscita:', data);
      navigate('/doctor/login');
    } catch (err) {
      if (err.message === "Email già registrata") {
        setModalMessage("Email già registrata. Prova con un'altra email.");
      }
      else if (err.message === "Errore durante la creazione dell'utente") {
        setModalMessage("Si è verificato un errore durante la creazione dell'utente. Riprova più tardi.");
      } else {
        setModalMessage("Fornisci tutti i campi.");
      }
    }
  };

  const handleLocationsChange = (index, newVal) => {
    const updated = [...locations];
    updated[index] = newVal;
    setLocations(updated);
  };

  const addLocationsField = () => {
    setLocations([...locations, { address: '', latitude: null, longitude: null }]);
  };

  const removeLocationsField = (index) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 via-blue-400 to-blue-600 px-4">
      <div className="bg-white px-8 py-8 rounded-2xl shadow-xl w-full max-w-4xl text-blue-900 max-h-[80vh] mt-24 mb-12 overflow-y-auto">
        <h2 className="text-3xl font-bold text-center mb-2">Registrati come dottore</h2>
        <p className="text-center text-sm text-blue-600 mb-4">
          Crea un nuovo profilo per fornire i tuoi servizi
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3 rounded-md bg-blue-50 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 rounded-md bg-blue-50 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 focus:outline-none"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Nascondi password" : "Mostra password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7s4-7 9-7c1.13 0 2.21.19 3.22.54M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18M9.88 9.88A3 3 0 0112 9c1.66 0 3 1.34 3 3 0 .53-.14 1.03-.38 1.46M6.1 6.1C4.07 7.58 2.5 9.94 2.5 12c0 1.06.42 2.07 1.1 2.9m3.4 3.4A9.97 9.97 0 0012 19c5 0 9-4 9-7 0-1.06-.42-2.07-1.1-2.9" />
                  </svg>
                )}
              </button>
              {password && passwordError && (
                <p className="text-sm text-red-500 mt-1">{passwordError}</p>
              )}
            </div>
          </div>

          {/* Specializzazione + Sesso */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-blue-50 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleziona Specializzazione</option>
              {SPECIALIZATIONS.map((spec) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>

            <div className="flex items-center justify-between bg-blue-50 px-4 py-3 rounded-md text-blue-900">
              <span className="font-medium mr-4">Sesso</span>
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sex === 'M'}
                    onChange={() => setSex('M')}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="text-sm font-medium">Maschio</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sex === 'F'}
                    onChange={() => setSex('F')}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="text-sm font-medium">Femmina</span>
                </label>
              </div>
            </div>
          </div>

          {/* Indirizzi */}
          {locations.map((address, index) => (
            <div key={index} className="flex items-center gap-2">
              <AddressAutocomplete
                value={address}
                onChange={(val) => handleLocationsChange(index, val)}
              />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeLocationsField(index)}
                  className="text-blue-600 hover:text-red-500"
                  title="Rimuovi sede"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}

          <div className="text-right">
            <button
              type="button"
              onClick={addLocationsField}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              + Aggiungi sede
            </button>
          </div>

          <button
            type="submit"
            disabled={!!passwordError}
            className={`w-full py-3 rounded-md font-semibold transition ${
              passwordError
                ? 'bg-blue-300 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Registrati
          </button>
        </form>

        <p className="text-center text-sm text-blue-600 mt-4">
          Hai già un account?{' '}
          <span
            onClick={() => navigate('/doctor/login')}
            className="text-blue-800 font-medium hover:text-blue-900 cursor-pointer"
          >
            Accedi
          </span>
        </p>
        <p className="text-center text-sm text-blue-600 mt-1">
          Sei un paziente?{' '}
          <span
            onClick={() => navigate('/register')}
            className="text-blue-800 font-medium hover:text-blue-900 cursor-pointer"
          >
            Registrati come paziente
          </span>
        </p>
      </div>
      <SimpleModal message={modalMessage} onClose={() => setModalMessage('')} />
    </div>
  );
}

export default Register;
