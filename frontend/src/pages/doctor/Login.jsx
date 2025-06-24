import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { login } from '../../services/profile/fetch_profile';
import { useAuth } from '../../contexts/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await login(email, password);
      console.log('Login riuscito:', data);
      setUser(data);
      navigate('/doctor');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 via-blue-400 to-blue-600 px-4">
      <div className="bg-white px-6 py-6 rounded-2xl shadow-xl w-full max-w-md md:max-w-lg text-blue-900 mt-24 mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">Accedi</h2>
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
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-md bg-blue-50 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
    </div>
  );
}

export default Login;
