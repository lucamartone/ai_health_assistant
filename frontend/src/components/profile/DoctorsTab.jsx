import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatientDoctors } from '../../services/profile/fetch_profile';
import { Stethoscope, MapPin, Mail } from 'lucide-react';

function DoctorsTab({ account }) {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!account?.id) return;

    setLoading(true);
    getPatientDoctors(account.id)
      .then((data) => setDoctors(data.doctors || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [account]);

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">I Miei Dottori</h2>
      <p className="text-gray-600 mb-6">Elenco dei medici con cui hai interagito.</p>

      {loading ? (
        <div className="text-center text-gray-600">Caricamento dottori...</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : doctors.length === 0 ? (
        <div className="text-center bg-blue-50 p-6 rounded-lg">
          <Stethoscope className="h-12 w-12 text-blue-600 mx-auto mb-2" />
          <p className="text-gray-700 mb-2">Non hai ancora dottori associati.</p>
          <button
            onClick={() => navigate('/book')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Prenota Visita
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow p-4 hover:shadow-md transition">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full text-white font-bold flex items-center justify-center mr-3">
                  {doctor.name?.charAt(0)}
                  {doctor.surname?.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Dr. {doctor.name} {doctor.surname}</p>
                  <p className="text-sm text-blue-600">{doctor.specialization}</p>
                </div>
              </div>
              <div className="text-sm text-gray-700 space-y-1 mb-3">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{doctor.locations?.join(', ') || 'N/A'}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>{doctor.email}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/book')}
                  className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-lg"
                >
                  Prenota Visita
                </button>
                <button
                  onClick={() => navigate('/profile/clinical-folder')}
                  className="bg-green-600 text-white text-sm py-2 px-3 rounded-lg"
                >
                  Cartella
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DoctorsTab;
