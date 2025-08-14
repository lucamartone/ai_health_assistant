import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { get_booked_appointments } from '../../../services/booking/appointments';

function AppointmentsTab() {
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [error, setError] = useState('');
  const { account } = useAuth();

  useEffect(() => {
    if (!account?.id) return;

    setLoadingAppointments(true);
    setError('');
    get_booked_appointments(account.id)
      .then(data => {
        const sorted = (data.appointments || []).sort((a, b) => new Date(a.date_time) - new Date(b.date_time));
        setAppointments(sorted);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoadingAppointments(false));
  }, [account]);

  const groupByDate = (appointments) => {
    const grouped = {};
    appointments.forEach((apt) => {
      const date = new Date(apt.date_time).toLocaleDateString('it-IT', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(apt);
    });
    return grouped;
  };

  const formatTime = (datetime) =>
    new Date(datetime).toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const groupedAppointments = groupByDate(appointments);

  return (
    <div className="max-w-full px-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Prossimi Appuntamenti</h2>

      {loadingAppointments ? (
        <div className="text-center py-6 text-gray-600">Caricamento...</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : appointments.length === 0 ? (
        <div className="text-center text-gray-600">Nessun appuntamento trovato.</div>
      ) : (
        <div className="overflow-x-auto">
          <div className="flex gap-6 pb-4">
            {Object.entries(groupedAppointments).map(([date, dayAppointments], idx) => (
              <div key={idx} className="min-w-[280px] bg-white border rounded-lg shadow-md p-4">
                <h3 className="text-blue-700 font-semibold mb-3 text-center">{date}</h3>
                <div className="space-y-4">
                  {dayAppointments.map((apt, i) => (
                    <div key={i} className="bg-gray-50 p-3 rounded-lg border">
                      <p className="font-medium text-gray-800">
                        Dott. {apt.doctor_surname} ({apt.specialization})
                      </p>
                      <p className="text-sm text-gray-500">Ore: {formatTime(apt.date_time)}</p>
                      <p className="text-sm text-gray-500">Luogo: {apt.address}, {apt.city}</p>
                      <p className="text-sm text-gray-500">Prezzo: €{apt.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AppointmentsTab;
