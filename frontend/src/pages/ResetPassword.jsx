import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import SimpleModal from '../components/SimpleModal';
import PasswordValidator from '../components/PasswordValidator';
import { resetPassword } from '../services/profile/profile';

function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setModalMessage('Link non valido o scaduto.');
      return;
    }
    if (!isPasswordValid) {
      setModalMessage('La password non rispetta i requisiti di sicurezza.');
      return;
    }
    if (!password || password !== confirm) {
      setModalMessage('Le password non coincidono.');
      return;
    }
    try {
      setLoading(true);
      await resetPassword(token, password);
      setModalMessage('Password reimpostata con successo. Ora puoi effettuare il login.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (e) {
      setModalMessage('Errore durante la reimpostazione della password.');
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = password && confirm && password === confirm;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 via-blue-400 to-blue-600 px-4">
      <div className="bg-white px-6 py-6 rounded-2xl shadow-xl w-full max-w-md md:max-w-lg text-blue-900 mt-24 mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">Reimposta password</h2>
        <p className="text-center text-sm md:text-base text-blue-600 mb-4">Inserisci la nuova password</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nuova password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Inserisci la nuova password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-md bg-blue-50 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 focus:outline-none"
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
            <PasswordValidator password={password} onValidationChange={setIsPasswordValid} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conferma password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Conferma la nuova password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={`w-full px-4 py-3 rounded-md bg-blue-50 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 pr-10 ${
                  confirm && !passwordsMatch ? 'focus:ring-red-500 border-red-300' : 'focus:ring-blue-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 focus:outline-none"
              >
                {showConfirm ? (
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
            {confirm && (
              <div className={`text-sm mt-1 ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                {passwordsMatch ? '✓ Le password coincidono' : '✗ Le password non coincidono'}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !isPasswordValid || !passwordsMatch}
            className={`w-full text-white py-3 rounded-md font-semibold transition ${
              loading || !isPasswordValid || !passwordsMatch
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Reimpostazione...' : 'Reimposta Password'}
          </button>
        </form>
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-blue-800 font-medium underline hover:text-blue-900"
          >
            Torna al login
          </button>
        </div>
      </div>
      <SimpleModal message={modalMessage} onClose={() => setModalMessage('')} />
    </div>
  );
}

export default ResetPassword;


