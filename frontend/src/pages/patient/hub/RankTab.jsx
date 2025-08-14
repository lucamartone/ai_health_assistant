import { useEffect, useState } from 'react';
import { getToRankAppointments, reviewAppointment } from '../../../services/booking/reviews';
import { useAuth } from '../../../contexts/AuthContext';
import { Star } from 'lucide-react';

function RankTab() {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [error, setError] = useState('');
  const { account } = useAuth();

  const openModalForRank = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setRating(0);
    setReviewText('');
  };

  const handleSubmitReview = async () => {
    if (!selectedAppointmentId || rating === 0) {
      alert("Seleziona una valutazione con le stelle.");
      return;
    }

    try {
      await reviewAppointment(selectedAppointmentId, rating, reviewText);
      // Rimuove l'appuntamento dalla lista dopo l'invio
      setAppointments((prev) => prev.filter((a) => a.id !== selectedAppointmentId));
      setSelectedAppointmentId(null);
    } catch (err) {
      console.error(err);
      alert("Errore durante l'invio della valutazione.");
    }
  };

  const handleStarClick = (index) => {
    setRating(index + 1);
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
    getToRankAppointments(account.id)
      .then((data) => setAppointments(data.appointments || []))
      .catch((err) => setError(err.message));
  }, [account]);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Appuntamenti da valutare</h2>

      {error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : appointments.length === 0 ? (
        <div className="text-center text-gray-600">Nessun appuntamento da valutare.</div>
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

                  {!isSelected && (
                    <button
                      onClick={() => openModalForRank(apt.id)}
                      className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      Valuta
                    </button>
                  )}
                </div>

                {isSelected && (
                  <div className="mt-6 border-t pt-6 flex justify-center">
                    <div className="w-full max-w-md text-center">
                      <div className="flex justify-center items-center gap-2 mb-3">
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
                      <button
                        className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                        onClick={handleSubmitReview}
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
