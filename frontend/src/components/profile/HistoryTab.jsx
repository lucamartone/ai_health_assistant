import { useEffect, useState } from 'react';
import { getHistory } from '../../services/appointments/fetch_appointments';

function HistoryTab({ account }) {
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!account?.id) {
      return;
    }
    setLoadingAppointments(true);
    setError('');

    getHistory(account.id)
      .then(data =>{
        setAppointments(data.appointments || [])})
      .catch(err => {
        setError(err.message);
      } )
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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Cronologia Appunamenti</h2>

      {loadingAppointments ? (
        <div className="text-center py-6 text-gray-600">Caricamento...</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : appointments.length === 0 ? (
        <div className="text-center text-gray-600">Nessuno appuntamento trovato.</div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt, index) => {
            const dateObj = new Date(apt.date_time);
            const formattedDate = formatDate(dateObj);
            const formattedTime = dateObj.toLocaleTimeString('it-IT', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div key={index} className="bg-gray-50 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800">
                  Dott. {apt.doctor_surname} ({apt.specialization})
                </p>
                <p className="text-sm text-gray-500">
                  {formattedDate} - {formattedTime}
                </p>
                <p className="text-sm text-gray-500">
                  Luogo: {apt.address}, {apt.city}
                </p>
                <p className="text-sm text-gray-500">Prezzo: €{apt.price}</p>
              </div>
              <span className="px-3 py-1 text-sm rounded-full font-medium bg-blue-100 text-blue-800">
                {apt.status}
              </span>
            </div>
          </div>
            );
          })}
        </div>
      )}
    </div>
  );
  }

export default HistoryTab;
