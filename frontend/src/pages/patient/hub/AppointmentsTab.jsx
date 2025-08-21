import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { getUpcomingAppointments, getPastAppointments } from '../../../services/booking/appointments';

function AppointmentsTab() {
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'past'
  const { account } = useAuth();

  useEffect(() => {
    if (!account?.id) return;

    setLoadingAppointments(true);
    setError('');
    
    // Carica appuntamenti prossimi
    getUpcomingAppointments(account.id)
      .then(data => {
        const sorted = (data.appointments || []).sort((a, b) => new Date(a.date_time) - new Date(b.date_time));
        setUpcomingAppointments(sorted);
      })
      .catch(err => console.error('Errore appuntamenti prossimi:', err));
    
    // Carica appuntamenti passati
    getPastAppointments(account.id)
      .then(data => {
        const sorted = (data.appointments || []).sort((a, b) => new Date(b.date_time) - new Date(a.date_time));
        setPastAppointments(sorted);
      })
      .catch(err => console.error('Errore appuntamenti passati:', err))
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

  const groupedUpcomingAppointments = groupByDate(upcomingAppointments);
  const groupedPastAppointments = groupByDate(pastAppointments);

  return (
    <div className="max-w-full px-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">I Miei Appuntamenti</h2>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-6">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Prossimi ({upcomingAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'past'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Passati ({pastAppointments.length})
          </button>
        </div>
      </div>

      {loadingAppointments ? (
        <div className="text-center py-6 text-gray-600">Caricamento...</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : (
        <>
          {/* Prossimi Appuntamenti */}
          {activeTab === 'upcoming' && (
            <>
              {upcomingAppointments.length === 0 ? (
                <div className="text-center text-gray-600">Nessun appuntamento futuro.</div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="flex gap-6 pb-4">
                    {Object.entries(groupedUpcomingAppointments).map(([date, dayAppointments], idx) => (
                      <div key={idx} className="min-w-[280px] bg-white border rounded-lg shadow-md p-4">
                        <h3 className="text-blue-700 font-semibold mb-3 text-center">{date}</h3>
                        <div className="space-y-4">
                          {dayAppointments.map((apt, i) => (
                            <div key={i} className="bg-green-50 p-3 rounded-lg border border-green-200">
                              <p className="font-medium text-gray-800">
                                Dott. {apt.doctor_surname} ({apt.specialization})
                              </p>
                              <p className="text-sm text-gray-500">Ore: {formatTime(apt.date_time)}</p>
                              <p className="text-sm text-gray-500">Luogo: {apt.address}, {apt.city}</p>
                              <p className="text-sm text-gray-500">Prezzo: €{apt.price}</p>
                              <p className="text-sm text-green-600 font-medium">Stato: {apt.status}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Appuntamenti Passati */}
          {activeTab === 'past' && (
            <>
              {pastAppointments.length === 0 ? (
                <div className="text-center text-gray-600">Nessun appuntamento passato.</div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="flex gap-6 pb-4">
                    {Object.entries(groupedPastAppointments).map(([date, dayAppointments], idx) => (
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
                              {apt.has_review ? (
                                <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                                  <p className="text-sm text-yellow-800">
                                    ⭐ {apt.review_stars} stelle: {apt.review_report}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-sm text-orange-600 font-medium">Recensione non ancora lasciata</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default AppointmentsTab;
