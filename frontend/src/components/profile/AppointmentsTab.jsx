// src/pages/tabs/AppointmentsTab.jsx
import { useEffect, useState } from 'react';

function AppointmentsTab({ account }) {
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!account?.id) return;
    setLoadingAppointments(true);
    setError('');

    fetch(`/profile/patient/appointments/history?patient_id=${account.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Errore nel recupero appuntamenti');
        return res.json();
      })
      .then(data => setAppointments(data.history || []))
      .catch(err => setError(err.message))
      .finally(() => setLoadingAppointments(false));
  }, [account]);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Prossimi Appuntamenti</h2>

      {loadingAppointments ? (
        <div className="text-center py-6 text-gray-600">Caricamento...</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : appointments.length === 0 ? (
        <div className="text-center text-gray-600">Nessun appuntamento trovato.</div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">Dr. {apt.doctor_name || 'N/A'}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(apt.date)} - {apt.time}
                  </p>
                </div>
                <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                  apt.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : apt.status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {apt.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AppointmentsTab;
