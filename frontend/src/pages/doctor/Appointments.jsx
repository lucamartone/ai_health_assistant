import { useState, useEffect } from 'react';

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const doctorId = 1; // TODO: sostituire con id reale da auth

  useEffect(() => {
    async function fetchAppointments() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/profile/doctor/appointments?doctor_id=${doctorId}`);
        if (!res.ok) throw new Error('Errore nel recupero appuntamenti');
        const data = await res.json();
        setAppointments(data.appointments || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAppointments();
  }, [doctorId]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-2 mt-16">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Gestione appuntamenti</h1>
        {loading ? (
          <div className="text-blue-700">Caricamento...</div>
        ) : error ? (
          <div className="text-red-700">{error}</div>
        ) : appointments.length === 0 ? (
          <div className="text-gray-500">Nessun appuntamento trovato.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-gray-500 uppercase text-xs">
                  <th className="px-2 py-1">Data</th>
                  <th className="px-2 py-1">Paziente</th>
                  <th className="px-2 py-1">Luogo</th>
                  <th className="px-2 py-1">Prezzo</th>
                  <th className="px-2 py-1">Stato</th>
                  <th className="px-2 py-1">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((app) => {
                  let badgeColor = 'bg-gray-200 text-gray-700';
                  if (app.state === 'booked') badgeColor = 'bg-blue-100 text-blue-800';
                  if (app.state === 'completed') badgeColor = 'bg-green-100 text-green-800';
                  if (app.state === 'cancelled') badgeColor = 'bg-red-100 text-red-800';
                  return (
                    <tr key={app.appointment_id} className="bg-white rounded shadow-sm">
                      <td className="px-2 py-1 whitespace-nowrap font-medium text-gray-900">
                        {new Date(app.date_time).toLocaleString()}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap">
                        {app.patient_name ? ` ${app.patient_name} ${app.patient_surname}` : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap">{app.address}, {app.city}</td>
                      <td className="px-2 py-1 whitespace-nowrap">{app.price}€</td>
                      <td className="px-2 py-1 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${badgeColor}`}>{app.state}</span>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap flex gap-2">
                        {app.state === 'booked' && (
                          <button className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition">Completa</button>
                        )}
                        {app.state === 'booked' && (
                          <button className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition">Cancella</button>
                        )}
                        <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-200 transition">Dettagli</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Appointments; 