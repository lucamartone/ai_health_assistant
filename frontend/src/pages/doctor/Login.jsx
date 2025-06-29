import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { login_doctor } from '../../services/profile/fetch_profile';
import { useAuth } from '../../contexts/AuthContext';
import LoginModal from '../../components/LoginModal';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setAccount } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await login_doctor(email, password);
      setAccount(data.account);
      navigate('/doctor');
    } catch (err) {
      if (err.message === 'Account non registrato') {
        setModalMessage('Nessun account trovato con questa email. Per favore, registrati.');
      }
      else if (err.message === 'Password errata') {
        setModalMessage('La password inserita è errata. Riprova.');
      } else {
        setModalMessage('Si è verificato un errore durante il login. Riprova più tardi.');
      }
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 via-blue-400 to-blue-600 px-4">
      <div className="bg-white px-6 py-6 rounded-2xl shadow-xl w-full max-w-md md:max-w-lg text-blue-900 mt-24 mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">Accedi come dottore</h2>
        <p className="text-center text-sm md:text-base text-blue-600 mb-4">
          Inserisci le tue credenziali per continuare
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-md bg-blue-50 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7s4-7 9-7c1.13 0 2.21.19 3.22.54M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18M9.88 9.88A3 3 0 0112 9c1.66 0 3 1.34 3 3 0 .53-.14 1.03-.38 1.46M6.1 6.1C4.07 7.58 2.5 9.94 2.5 12c0 1.06.42 2.07 1.1 2.9m3.4 3.4A9.97 9.97 0 0012 19c5 0 9-4 9-7 0-1.06-.42-2.07-1.1-2.9" /></svg>
              )}
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition"
          >
            Accedi
          </button>
        </form>

        <p className="text-center text-sm text-blue-600 mt-4">
          Non hai un account?{' '}
          <span
            onClick={() => navigate('/doctor/register')}
            className="text-blue-800 font-medium underline hover:text-blue-900 cursor-pointer"
          >
            Registrati
          </span>
        </p>
      </div>
      <LoginModal message={modalMessage} onClose={() => setModalMessage('')} />
    </div>
  );
}

export default Login;
