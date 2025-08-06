import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { register } from '../../services/profile/patient_profile';
import SimpleModal from '../../components/SimpleModal';

function Register() {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sex, setSex] = useState('');
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
    const error = validatePassword(value);
    setPasswordError(error);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (passwordError) return; // sicurezza in più
    try {
      const data = await register(name, surname, email, password, sex);
      console.log('Registrazione riuscita:', data);
      navigate('/login');
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 via-blue-400 to-blue-600 px-4">
      <div className="bg-blue-700 p-10 rounded-2xl shadow-xl w-full max-w-md md:max-w-lg text-white mt-24 mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Registrati come paziente</h2>
        <p className="text-center text-sm md:text-base text-blue-100 mb-6">
          Crea un nuovo account per accedere ai servizi
        </p>
        <form onSubmit={handleRegister} className="space-y-5">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome"
            className="w-full px-4 py-3 rounded-md bg-blue-100 text-blue-900 placeholder-blue-600 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <input
            type="text"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            placeholder="Cognome"
            className="w-full px-4 py-3 rounded-md bg-blue-100 text-blue-900 placeholder-blue-600 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-3 rounded-md bg-blue-100 text-blue-900 placeholder-blue-600 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 rounded-md bg-blue-100 text-blue-900 placeholder-blue-600 focus:outline-none focus:ring-2 focus:ring-white pr-10"
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-700 focus:outline-none"
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
          </div>

          {password && passwordError && (
            <p className="text-sm text-red-300 -mt-3">{passwordError}</p>
          )}

          <div className="flex items-center justify-between bg-blue-100 px-4 py-3 rounded-md text-blue-900">
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

          <button
            type="submit"
            disabled={!!passwordError}
            className={`w-full py-3 rounded-md font-semibold transition ${
              passwordError
                ? 'bg-blue-300 text-white cursor-not-allowed'
                : 'bg-white text-blue-700 hover:bg-blue-100'
            }`}
          >
            Registrati
          </button>
        </form>

        <p className="text-center text-sm text-blue-100 mt-6">
          Hai già un account?{' '}
          <span
            onClick={() => navigate('/login')}
            className="text-white font-medium underline hover:text-blue-300 cursor-pointer"
          >
            Accedi
          </span>
        </p>
        <p className="text-center text-sm text-blue-100 mt-2">
          Sei un dottore?{' '}
          <span
            onClick={() => navigate('/doctor/register')}
            className="text-white font-medium underline hover:text-blue-300 cursor-pointer"
          >
            Registrati come dottore
          </span>
        </p>
      </div>
      <SimpleModal message={modalMessage} onClose={() => setModalMessage('')} />
    </div>
  );
}

export default Register;
