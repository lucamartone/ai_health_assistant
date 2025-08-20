import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Star, ArrowLeft, User, Calendar, MapPin, Send } from 'lucide-react';
import { getToRankAppointments, reviewAppointment } from '../../services/booking/reviews';
import { getDoctors } from '../../services/profile/patient_profile';

const Reviews = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { account, loading } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Protezione: redirect se non autenticato
  useEffect(() => {
    if (!loading && !account) {
      navigate('/login');
    }
  }, [account, loading, navigate]);

  // Carica i dati del dottore
  useEffect(() => {
    const loadDoctor = async () => {
      if (!account?.id) return;
      
      try {
        const data = await getDoctors(account.id);
        const foundDoctor = data.doctors?.find(d => d.id === parseInt(doctorId));
        setDoctor(foundDoctor);
      } catch (err) {
        console.error('Errore caricamento dottore:', err);
      }
    };

    loadDoctor();
  }, [account?.id, doctorId]);

  // Carica gli appuntamenti da recensire
  useEffect(() => {
    const loadAppointments = async () => {
      if (!account?.id) return;
      
      setLoadingAppointments(true);
      try {
        const data = await getToRankAppointments(account.id);
        // Filtra solo gli appuntamenti del dottore specifico
        const doctorAppointments = data.appointments?.filter(apt => apt.doctor_id === parseInt(doctorId)) || [];
        setAppointments(doctorAppointments);
      } catch (err) {
        console.error('Errore caricamento appuntamenti:', err);
        setError('Errore nel caricamento degli appuntamenti');
      } finally {
        setLoadingAppointments(false);
      }
    };

    if (doctor) {
      loadAppointments();
    }
  }, [account?.id, doctor, doctorId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRatingClick = (star) => {
    setRating(star);
  };

  const handleSubmitReview = async () => {
    if (!selectedAppointment || rating === 0) {
      setError('Seleziona un appuntamento e dai una valutazione');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await reviewAppointment(selectedAppointment.id, rating, comment);
      setSuccess(true);
      setRating(0);
      setComment('');
      setSelectedAppointment(null);
      
      // Ricarica gli appuntamenti
      const data = await getToRankAppointments(account.id);
      const doctorAppointments = data.appointments?.filter(apt => apt.doctor_id === parseInt(doctorId)) || [];
      setAppointments(doctorAppointments);
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError('Errore nell\'invio della recensione: ' + (err.message || 'Errore sconosciuto'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-blue-800 font-medium">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/clinical-folder')}
                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Lascia una Recensione</h1>
                <p className="text-gray-600">Valuta la tua esperienza con il dottore</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
              ✅ Recensione inviata con successo!
            </div>
          )}

          {/* Info dottore */}
          {doctor && (
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Dr. {doctor.name} {doctor.surname}
                  </h2>
                  <p className="text-blue-600 font-medium">{doctor.specialization}</p>
                  {doctor.locations && doctor.locations.length > 0 && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <MapPin className="h-4 w-4" />
                      <span>{doctor.locations.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Contenuto principale */}
        {loadingAppointments ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Caricamento appuntamenti...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-blue-50 rounded-xl p-8 max-w-md mx-auto">
              <div className="text-6xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nessun appuntamento da recensire</h3>
              <p className="text-gray-600 mb-4">
                Non ci sono appuntamenti completati con questo dottore che richiedono una recensione.
              </p>
              <button
                onClick={() => navigate('/clinical-folder')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Torna alle Cartelle Cliniche
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Selezione appuntamento */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seleziona un Appuntamento</h3>
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    onClick={() => setSelectedAppointment(appointment)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedAppointment?.id === appointment.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">
                            Visita del {formatDate(appointment.date_time)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {appointment.address}, {appointment.city}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{appointment.price}€</p>
                        <p className="text-sm text-gray-500">{appointment.specialization}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Form recensione */}
            {selectedAppointment && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl p-8"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Lascia la tua Recensione</h3>
                
                {/* Valutazione stelle */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Valutazione *
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRatingClick(star)}
                        className={`text-3xl transition-colors ${
                          star <= rating
                            ? 'text-yellow-400'
                            : 'text-gray-300 hover:text-yellow-300'
                        }`}
                      >
                        <Star className="h-8 w-8 fill-current" />
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {rating === 0 && 'Clicca sulle stelle per valutare'}
                    {rating === 1 && 'Pessimo'}
                    {rating === 2 && 'Scarso'}
                    {rating === 3 && 'Discreto'}
                    {rating === 4 && 'Buono'}
                    {rating === 5 && 'Eccellente'}
                  </p>
                </div>

                {/* Commento */}
                <div className="mb-6">
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-3">
                    Commento (opzionale)
                  </label>
                  <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Racconta la tua esperienza con questo dottore..."
                  />
                </div>

                {/* Pulsante invio */}
                <button
                  onClick={handleSubmitReview}
                  disabled={submitting || rating === 0}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    submitting || rating === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Invio in corso...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Invia Recensione
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
