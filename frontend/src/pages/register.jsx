import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { register } from '../services/auth_profile';

function Register() {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sex, setSex] = useState('');

  const navigate = useNavigate();

  const handleRegister = async (e) => {
      e.preventDefault(); // blocca il reload della pagina
      try {
        const data = await register(name, surname, email, password, sex);
        console.log('Login riuscito:', data);
        navigate('/login'); // redirige se va a buon fine
      } catch (err) {
        alert(err.message); // gestisce l'errore
      }
    };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 via-blue-400 to-blue-600 px-4">
      <div className="bg-blue-700 p-10 rounded-2xl shadow-xl w-full max-w-md md:max-w-lg text-white">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Registrati</h2>
        <p className="text-center text-sm md:text-base text-blue-100 mb-6">
          Crea un nuovo account per accedere ai servizi
        </p>
        <form onSubmit={ handleRegister }className="space-y-5">
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
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-md bg-blue-100 text-blue-900 placeholder-blue-600 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <input
            type="password"
            placeholder="Conferma Password"
            value={sex}
            onChange={(e) => setSex(e.target.value)}
            className="w-full px-4 py-3 rounded-md bg-blue-100 text-blue-900 placeholder-blue-600 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <button
            type="submit"
            className="w-full bg-white text-blue-700 py-3 rounded-md font-semibold hover:bg-blue-100 transition"
          >
            Registrati
          </button>
        </form>
        <p className="text-center text-sm text-blue-100 mt-6">
          Hai già un account?{' '}
          <a
            onClick={() => navigate('/login')}
            className="text-white font-medium underline hover:text-blue-300 cursor-pointer"
          >
            Accedi
          </a>
        </p>
      </div>
    </div>
  );
}

export default Register;
