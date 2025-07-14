import { CalendarIcon, ClockIcon, MapPinIcon, UserIcon, EuroIcon } from 'lucide-react';

function BookingModal({ message, onClose, appointmentDetails = null }) {
  if (!message && !appointmentDetails) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-blue-900">
        <h2 className="text-xl font-bold text-center mb-4">✅ Prenotazione Confermata</h2>

        {/* Dettagli appuntamento */}
        {appointmentDetails ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b pb-1">
              <span className="flex items-center gap-2 font-semibold">
                <UserIcon className="w-4 h-4" /> Dottore
              </span>
              <span>{appointmentDetails.name} {appointmentDetails.surname}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-1">
              <span className="flex items-center gap-2 font-semibold">
                <CalendarIcon className="w-4 h-4" /> Data
              </span>
              <span>{appointmentDetails.date}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-1">
              <span className="flex items-center gap-2 font-semibold">
                <ClockIcon className="w-4 h-4" /> Ora
              </span>
              <span>{appointmentDetails.time}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-1">
              <span className="flex items-center gap-2 font-semibold">
                <MapPinIcon className="w-4 h-4" /> Luogo
              </span>
              <span>{appointmentDetails.city}, {appointmentDetails.address || 'N/D'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 font-semibold">
                <EuroIcon className="w-4 h-4" /> Prezzo
              </span>
              <span>{appointmentDetails.price}€</span>
            </div>
          </div>
        ) : (
          <p className="text-center">{message}</p>
        )}

        <div className="flex justify-center mt-6">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookingModal;
