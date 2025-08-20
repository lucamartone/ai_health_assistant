import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleModal from '../components/SimpleModal';
import { Mail } from 'lucide-react';
import { requestPasswordReset } from '../services/profile/profile';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setModalMessage('Inserisci un indirizzo email valido.');
      return;
    }
    try {
      setLoading(true);
      const response = await requestPasswordReset(email);
      setEmailSent(true);
      setModalMessage(response.message || 'Email di reset inviata con successo. Controlla la tua casella di posta.');
    } catch (err) {
      if (err?.message?.includes('Errore nell\'invio')) {
        setModalMessage('Errore nell\'invio dell\'email. Riprova più tardi o contatta il supporto.');
      } else {
        setModalMessage('Se l\'email è registrata, riceverai un link di reimpostazione.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 via-blue-400 to-blue-600 px-4">
        <div className="bg-white px-6 py-6 rounded-2xl shadow-xl w-full max-w-md md:max-w-lg text-blue-900 mt-24 mb-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Email inviata!</h2>
            <p className="text-gray-600 mb-6">
              Abbiamo inviato un link di reimpostazione password al tuo indirizzo email.
              Controlla la tua casella di posta (e la cartella spam).
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition"
              >
                Torna al login
              </button>
              <button
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                  setModalMessage('');
                }}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-md font-semibold hover:bg-gray-200 transition"
              >
                Invia un'altra email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 via-blue-400 to-blue-600 px-4">
      <div className="bg-white px-6 py-6 rounded-2xl shadow-xl w-full max-w-md md:max-w-lg text-blue-900 mt-24 mb-12">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Mail className="h-6 w-6 text-blue-600" />
          <h2 className="text-3xl md:text-4xl font-bold text-center">Recupera password</h2>
        </div>
        <p className="text-center text-sm md:text-base text-blue-600 mb-4">
          Inserisci la tua email. Ti invieremo un link per reimpostare la password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-md bg-blue-50 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-3 rounded-md font-semibold transition
              ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'Invio in corso…' : 'Invia link di reimpostazione'}
          </button>
        </form>

        <div className="flex items-center justify-between text-sm text-blue-600 mt-4">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-blue-800 font-medium underline hover:text-blue-900"
          >
            Torna al login
          </button>
        </div>
      </div>

      <SimpleModal message={modalMessage} onClose={() => setModalMessage('')} />
    </div>
  );
}

export default ForgotPassword;
