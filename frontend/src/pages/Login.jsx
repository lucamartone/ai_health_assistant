import React from 'react';

function Login() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 via-blue-400 to-blue-600">
      <div className="bg-blue-700 p-8 rounded-xl shadow-lg w-full max-w-sm text-white">
        <h2 className="text-2xl font-bold text-center mb-4">Accedi</h2>
        <p className="text-center text-sm text-blue-100 mb-6">
          Inserisci le tue credenziali
        </p>
        <form className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 rounded-md bg-blue-100 text-blue-900 placeholder-blue-600 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 rounded-md bg-blue-100 text-blue-900 placeholder-blue-600 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <button
            type="submit"
            className="w-full bg-white text-blue-700 py-2 rounded-md font-semibold hover:bg-blue-100 transition"
          >
            Accedi
          </button>
        </form>
        <p className="text-center text-sm text-blue-100 mt-4">
          Non hai un account?{' '}
          <a href="/register" className="text-white font-medium underline hover:text-blue-300">
            Registrati
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
