import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getProfile } from '../../services/profile/fetch_profile';

function Profile() {
  const { account, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !account) {
      navigate('/doctor/login');
    }
  }, [account, loading, navigate]);

  useEffect(() => {
    if (account) {
      getProfile()
        .then((data) => setProfile(data.profile))
        .catch((err) => setError(err.message));
    }
  }, [account]);

  if (loading || !account || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">Caricamento...</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-2 mt-16">
      <div className="w-full max-w-xl bg-white rounded-xl shadow p-8 flex flex-col items-center gap-4">
        <div className="w-24 h-24 rounded-full border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1112 21a8.963 8.963 0 01-6.879-3.196z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{profile.name} {profile.surname}</div>
          <div className="text-gray-500 text-sm">{profile.email}</div>
        </div>
        <div className="w-full mt-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <span className="block text-sm text-gray-500">Email</span>
              <span className="block text-lg font-medium text-gray-800">{profile.email}</span>
            </div>
            <div>
              <span className="block text-sm text-gray-500">Ruolo</span>
              <span className="block text-lg font-medium text-gray-800">{profile.role}</span>
            </div>
            {profile.specialization && (
              <div>
                <span className="block text-sm text-gray-500">Specializzazione</span>
                <span className="block text-lg font-medium text-gray-800">{profile.specialization}</span>
              </div>
            )}
            {profile.locations && profile.locations.length > 0 && (
              <div>
                <span className="block text-sm text-gray-500">Sedi</span>
                <ul className="list-disc list-inside text-gray-800 text-sm">
                  {profile.locations.map((loc) => (
                    <li key={loc.id}>{loc.address}</li>
                  ))}
                </ul>
              </div>
            )}
            {error && <div className="text-red-600">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
