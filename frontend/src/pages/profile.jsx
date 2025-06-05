import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: 'Marco Rossi',
    email: 'marco.rossi@email.com',
    role: 'Paziente',
    joined: '01/05/2024',
    avatar: 'https://i.pravatar.cc/150?img=47',
  });

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Modifiche salvate!');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 via-blue-400 to-blue-600 px-4">
      <div className="bg-blue-100 text-blue-900 p-6 rounded-xl shadow-xl max-w-3xl w-full flex flex-col md:flex-row gap-6 items-start md:items-center">
        {/* Foto profilo */}
        <div className="flex-shrink-0">
          <img
            src={user.avatar}
            alt="Foto profilo"
            className="w-32 h-32 rounded-lg border-4 border-white shadow-md object-cover"
          />
        </div>

        {/* Dati utente */}
        <form onSubmit={handleSubmit} className="flex-1 w-full space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-blue-700">Nome</label>
              <input
                type="text"
                name="name"
                value={user.name}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md bg-white border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-blue-700">Email</label>
              <input
                type="email"
                name="email"
                value={user.email}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md bg-white border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-blue-700">Ruolo</label>
              <input
                type="text"
                name="role"
                value={user.role}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md bg-white border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-blue-700">Data registrazione</label>
              <input
                type="text"
                name="joined"
                value={user.joined}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md bg-white border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Pulsanti */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
            <button
              type="submit"
              className="bg-blue-700 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-800 transition"
            >
              Salva modifiche
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="bg-white text-blue-700 border border-blue-700 px-6 py-2 rounded-md font-semibold hover:bg-blue-100 transition"
            >
              Torna alla Home
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
