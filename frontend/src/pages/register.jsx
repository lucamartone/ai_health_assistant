function Register() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Registrati</h2>
        <form className="space-y-4">
          <input
            types="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded"
          />
          <input
            type="geolocalization"
            placeholder="adress"
            className="w-full px-4 py-2 border rounded"
          />
          <input
            type="gender"
            placeholder="M/F"
            className="w-full px-4 py-2 border rounded"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Accedi
          </button>
        </form>
      </div>
    </div>
  );
}
export default Login;