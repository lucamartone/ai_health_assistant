import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 via-blue-400 to-blue-600 px-4">
      <div className="bg-blue-700 p-10 rounded-2xl shadow-xl w-full max-w-md md:max-w-lg text-white">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Registrati</h2>
        <p className="text-center text-sm md:text-base text-blue-100 mb-6">
          Crea un nuovo account per accedere ai servizi
        </p>
        <form className="space-y-5">
          <input
            type="text"
            placeholder="Nome completo"
            className="w-full px-4 py-3 rounded-md bg-blue-100 text-blue-900 placeholder-blue-600 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 rounded-md bg-blue-100 text-blue-900 placeholder-blue-600 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded-md bg-blue-100 text-blue-900 placeholder-blue-600 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <input
            type="password"
            placeholder="Conferma Password"
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
