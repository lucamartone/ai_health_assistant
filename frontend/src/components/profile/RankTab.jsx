import { useEffect, useState } from 'react';
import { get_to_rank_appointments } from '../../services/appointments/fetch_appointments';
import { Star } from 'lucide-react';

function RankTab({ account }) {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [error, setError] = useState('');

  const openModalForRank = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setRating(0);
    setReviewText('');
  };

  const handleStarClick = (index) => {
    setRating(index + 1); // index è 0-based
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  useEffect(() => {
    if (!account?.id) return;

    setError('');
    get_to_rank_appointments(account.id)
      .then((data) => setAppointments(data.appointments || []))
      .catch((err) => setError(err.message));
  }, [account]);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Appuntamenti da valutare</h2>

      {error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : appointments.length === 0 ? (
        <div className="text-center text-gray-600">Nessun appuntamento trovato.</div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => {
            const dateObj = new Date(apt.date_time);
            const formattedDate = formatDate(dateObj);
            const formattedTime = dateObj.toLocaleTimeString('it-IT', {
              hour: '2-digit',
              minute: '2-digit',
            });

            const isSelected = selectedAppointmentId === apt.id;

            return (
              <div key={apt.id} className="bg-gray-50 rounded-lg p-4 shadow-sm">
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
                  <button
                    onClick={() => openModalForRank(apt.id)}
                    className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Valuta
                  </button>
                </div>

                {isSelected && (
                  <div className="mt-4 border-t pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      {[...Array(5)].map((_, index) => (
                        <Star
                          key={index}
                          className={`w-6 h-6 cursor-pointer ${
                            index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'
                          }`}
                          onClick={() => handleStarClick(index)}
                        />
                      ))}
                    </div>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Scrivi una recensione opzionale..."
                      className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                      rows={3}
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                        onClick={() => {
                          // TODO: invio della valutazione al backend
                          console.log({
                            appointmentId: apt.id,
                            rating,
                            review: reviewText,
                          });
                          alert('Valutazione inviata (mock)');
                          setSelectedAppointmentId(null);
                        }}
                      >
                        Invia valutazione
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RankTab;
