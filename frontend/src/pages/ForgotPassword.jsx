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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setModalMessage('Inserisci un indirizzo email valido.');
      return;
    }
    try {
      setLoading(true);
      await requestPasswordReset(email);
      setModalMessage(
        'Se l’email è registrata, ti abbiamo inviato un link per reimpostare la password. Controlla la casella di posta (e lo spam).'
      );
    } catch (err) {
      if (err?.message === 'Account non registrato') {
        // Mantieni risposta “neutra” per non rivelare esistenza account, ma puoi anche essere esplicito se preferisci
        setModalMessage('Se l’email è registrata, riceverai un link di reimpostazione.');
      } else {
        setModalMessage('Si è verificato un errore. Riprova più tardi.');
      }
    } finally {
      setLoading(false);
    }
  };

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
            onClick={() => navigate('/doctor/login')}
            className="text-blue-800 font-medium underline hover:text-blue-900"
          >
            Torna al login
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!email) {
                setModalMessage('Inserisci prima la tua email.');
                return;
              }
              try {
                setLoading(true);
                await requestPasswordReset(email);
                setModalMessage('Nuova email inviata (se l’account esiste).');
              } catch {
                setModalMessage('Errore nell’invio. Riprova più tardi.');
              } finally {
                setLoading(false);
              }
            }}
            className="underline hover:text-blue-900"
          >
            Reinvia email
          </button>
        </div>
      </div>

      <SimpleModal message={modalMessage} onClose={() => setModalMessage('')} />
    </div>
  );
}

export default ForgotPassword;
