import { useEffect, useState } from 'react';
import { getPastAppointments } from '../../../services/booking/appointments';
import { getPatientReviews } from '../../../services/booking/reviews';
import { useAuth } from '../../../contexts/AuthContext';

function HistoryTab() {
  const [appointments, setAppointments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' or 'reviews'
  const { account } = useAuth();

  useEffect(() => {
    if (!account?.id) {
      return;
    }
    setLoadingAppointments(true);
    setLoadingReviews(true);
    setError('');

    // Carica appuntamenti passati
    getPastAppointments(account.id)
      .then(data => {
        setAppointments(data.appointments || []);
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => setLoadingAppointments(false));

    // Carica recensioni
    getPatientReviews(account.id)
      .then(data => {
        setReviews(data.reviews || []);
      })
      .catch(err => {
        console.error('Errore caricamento recensioni:', err);
      })
      .finally(() => setLoadingReviews(false));

  }, [account]);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Cronologia e Recensioni</h2>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-6">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'appointments'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Appuntamenti ({appointments.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'reviews'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Recensioni ({reviews.length})
          </button>
        </div>
      </div>

      {/* Appuntamenti Passati */}
      {activeTab === 'appointments' && (
        <>
          {loadingAppointments ? (
            <div className="text-center py-6 text-gray-600">Caricamento appuntamenti...</div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : appointments.length === 0 ? (
            <div className="text-center text-gray-600">Nessun appuntamento passato trovato.</div>
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
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
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
                        {apt.has_review && (
                          <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                            <div className="flex items-center gap-2 mb-1">
                              {renderStars(apt.review_stars)}
                              <span className="text-sm text-yellow-800 font-medium">
                                {apt.review_stars} stelle
                              </span>
                            </div>
                            <p className="text-sm text-yellow-800">{apt.review_report}</p>
                          </div>
                        )}
                      </div>
                      <span className="px-3 py-1 text-sm rounded-full font-medium bg-green-100 text-green-800">
                        Completato
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Recensioni */}
      {activeTab === 'reviews' && (
        <>
          {loadingReviews ? (
            <div className="text-center py-6 text-gray-600">Caricamento recensioni...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center text-gray-600">Nessuna recensione trovata.</div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review, index) => {
                const dateObj = new Date(review.appointment_date);
                const formattedDate = formatDate(dateObj);

                return (
                  <div key={index} className="bg-white rounded-lg p-6 shadow-md border">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Dr. {review.doctor_name} {review.doctor_surname}
                        </h3>
                        <p className="text-sm text-gray-600">{review.specialization}</p>
                        <p className="text-sm text-gray-500">{formattedDate}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {renderStars(review.stars)}
                        <span className="text-sm font-medium text-gray-700">
                          {review.stars}/5
                        </span>
                      </div>
                    </div>
                    {review.report && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-gray-800 italic">"{review.report}"</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
  }

export default HistoryTab;
