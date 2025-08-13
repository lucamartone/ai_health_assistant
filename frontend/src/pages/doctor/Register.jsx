import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Trash2, Upload, File, X } from 'lucide-react';
import AddressAutocomplete from '../../components/AddressAutocomplete';
import SimpleModal from '../../components/SimpleModal';

const SPECIALIZATIONS = [
  "Allergologia", "Anestesia e Rianimazione", "Cardiologia", "Chirurgia Generale",
  "Dermatologia", "Endocrinologia", "Gastroenterologia", "Ginecologia",
  "Medicina Generale", "Nefrologia", "Neurologia", "Oculistica", "Oncologia",
  "Ortopedia", "Otorinolaringoiatria", "Pediatria", "Psichiatria", "Psicologia",
  "Radiologia", "Urologia"
];

const DOCUMENT_TYPES = [
  { value: 'cv', label: 'Curriculum Vitae' },
  { value: 'laurea', label: 'Laurea' },
  { value: 'abilitazione', label: 'Abilitazione' },
  { value: 'specializzazione', label: 'Specializzazione' },
  { value: 'altro', label: 'Altro' }
];

function Register() {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sex, setSex] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [locations, setLocations] = useState([{ address: '', latitude: null, longitude: null }]);
  const [documents, setDocuments] = useState([]);
  const [passwordError, setPasswordError] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const validatePassword = (pwd) => {
    if (pwd.length < 8) return 'La password deve contenere almeno 8 caratteri';
    if (!/[A-Z]/.test(pwd)) return 'La password deve contenere almeno una lettera maiuscola';
    if (!/[a-z]/.test(pwd)) return 'La password deve contenere almeno una lettera minuscola';
    if (!/[0-9]/.test(pwd)) return 'La password deve contenere almeno un numero';
    return '';
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    setPasswordError(validatePassword(value));
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setModalMessage('Il file è troppo grande. Dimensione massima: 10MB');
        return;
      }
      
      const newDocument = {
        id: Date.now(),
        file: file,
        type: 'altro', // Default type
        name: file.name
      };
      
      setDocuments(prev => [...prev, newDocument]);
    }
  };

  const removeDocument = (documentId) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const updateDocumentType = (documentId, newType) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId ? { ...doc, type: newType } : doc
    ));
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (passwordError) return;
    
    if (documents.length === 0) {
      setModalMessage('Carica almeno un documento per procedere con la richiesta');
      return;
    }

    // Validazione campi obbligatori
    if (!name || !surname || !email || !password || !sex || !birthDate || !phone || !specialization) {
      setModalMessage('Compila tutti i campi obbligatori');
      return;
    }

    // Validazione locations
    if (locations.length === 0 || locations[0].address === '') {
      setModalMessage('Inserisci almeno una sede di lavoro');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('surname', surname);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('sex', sex);
      formData.append('birth_date', birthDate);
      formData.append('phone', phone);
      formData.append('specialization', specialization);
      formData.append('locations', JSON.stringify(locations));
      
      // Add documents
      documents.forEach(doc => {
        formData.append('documents', doc.file);
      });

      // Debug log
      console.log('Invio richiesta con dati:', {
        name, surname, email, sex, birthDate, phone, specialization,
        locations, documentsCount: documents.length
      });

      const response = await fetch('http://localhost:8001/doctor/registration/request', {
        method: 'POST',
        body: formData
      });

      console.log('Risposta ricevuta:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Dati risposta:', data);
        setModalMessage(`Richiesta inviata con successo! ID richiesta: ${data.request_id}. Riceverai una notifica via email quando la richiesta verrà esaminata.`);
        
        // Reset form
        setTimeout(() => {
          setName('');
          setSurname('');
          setEmail('');
          setPassword('');
          setSex('');
          setBirthDate('');
          setPhone('');
          setSpecialization('');
          setLocations([{ address: '', latitude: null, longitude: null }]);
          setDocuments([]);
          setModalMessage('');
        }, 3000);
      } else {
        const error = await response.json();
        console.error('Errore risposta:', error);
        setModalMessage(error.detail || 'Errore durante l\'invio della richiesta');
      }
    } catch (err) {
      console.error('Errore di rete:', err);
      setModalMessage('Errore di rete. Riprova più tardi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocationsChange = (index, newVal) => {
    const updated = [...locations];
    updated[index] = newVal;
    setLocations(updated);
  };

  const addLocationsField = () => {
    setLocations([...locations, { address: '', latitude: null, longitude: null }]);
  };

  const removeLocationsField = (index) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 via-blue-400 to-blue-600 px-4">
      <div className="bg-white px-8 py-8 rounded-2xl shadow-xl w-full max-w-4xl text-blue-900 max-h-[90vh] mt-16 mb-12 overflow-y-auto">
        <h2 className="text-3xl font-bold text-center mb-2">Richiesta di Registrazione Dottore</h2>
        <p className="text-center text-sm text-blue-600 mb-6">
          Invia la tua richiesta di registrazione. Verrà esaminata da un amministratore.
        </p>

        <form onSubmit={handleSubmitRequest} className="space-y-6">
          {/* Nome + Cognome */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome"
              required
              className="w-full px-4 py-3 rounded-md bg-blue-50 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              placeholder="Cognome"
              required
              className="w-full px-4 py-3 rounded-md bg-blue-50 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email + Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full px-4 py-3 rounded-md bg-blue-50 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="Password"
                required
                className="w-full px-4 py-3 rounded-md bg-blue-50 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 focus:outline-none"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Nascondi password" : "Mostra password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7s4-7 9-7c1.13 0 2.21.19 3.22.54M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18M9.88 9.88A3 3 0 0112 9c1.66 0 3 1.34 3 3 0 .53-.14 1.03-.38 1.46M6.1 6.1C4.07 7.58 2.5 9.94 2.5 12c0 1.06.42 2.07 1.1 2.9m3.4 3.4A9.97 9.97 0 0012 19c5 0 9-4 9-7 0-1.06-.42-2.07-1.1-2.9" />
                  </svg>
                )}
              </button>
              {password && passwordError && (
                <p className="text-sm text-red-500 mt-1">{passwordError}</p>
              )}
            </div>
          </div>

          {/* Data di nascita + Telefono */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-md bg-blue-50 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Telefono"
              required
              className="w-full px-4 py-3 rounded-md bg-blue-50 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Specializzazione + Sesso */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-md bg-blue-50 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleziona Specializzazione</option>
              {SPECIALIZATIONS.map((spec) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>

            <div className="flex items-center justify-between bg-blue-50 px-4 py-3 rounded-md text-blue-900">
              <span className="font-medium mr-4">Sesso</span>
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sex"
                    value="M"
                    checked={sex === 'M'}
                    onChange={() => setSex('M')}
                    required
                    className="form-radio h-5 w-5 text-blue-600"
                  />
                  <span className="text-sm font-medium">Maschio</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sex"
                    value="F"
                    checked={sex === 'F'}
                    onChange={() => setSex('F')}
                    required
                    className="form-radio h-5 w-5 text-blue-600"
                  />
                  <span className="text-sm font-medium">Femmina</span>
                </label>
              </div>
            </div>
          </div>

          {/* Indirizzi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sedi di lavoro
            </label>
            {locations.map((address, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <AddressAutocomplete
                  value={address}
                  onChange={(val) => handleLocationsChange(index, val)}
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeLocationsField(index)}
                    className="text-blue-600 hover:text-red-500"
                    title="Rimuovi sede"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
            <div className="text-right">
              <button
                type="button"
                onClick={addLocationsField}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                + Aggiungi sede
              </button>
            </div>
          </div>

          {/* Documenti */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Documenti richiesti *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                <Upload className="h-5 w-5 mr-2" />
                Carica Documento
              </label>
              <p className="mt-2 text-sm text-gray-500">
                PDF, DOC, DOCX, JPG, PNG (max 10MB)
              </p>
            </div>

            {/* Lista documenti caricati */}
            {documents.length > 0 && (
              <div className="mt-4 space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    <div className="flex items-center space-x-3">
                      <File className="h-5 w-5 text-blue-500" />
                      <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(doc.file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select
                        value={doc.type}
                        onChange={(e) => updateDocumentType(doc.id, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        {DOCUMENT_TYPES.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeDocument(doc.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!!passwordError || isSubmitting}
            className={`w-full py-3 rounded-md font-semibold transition ${
              passwordError || isSubmitting
                ? 'bg-blue-300 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Invio in corso...' : 'Invia Richiesta di Registrazione'}
          </button>
        </form>

        <p className="text-center text-sm text-blue-600 mt-4">
          Hai già un account?{' '}
          <span
            onClick={() => navigate('/doctor/login')}
            className="text-blue-800 font-medium hover:text-blue-900 cursor-pointer"
          >
            Accedi
          </span>
        </p>
        <p className="text-center text-sm text-blue-600 mt-1">
          Sei un paziente?{' '}
          <span
            onClick={() => navigate('/register')}
            className="text-blue-800 font-medium hover:text-blue-900 cursor-pointer"
          >
            Registrati come paziente
          </span>
        </p>
      </div>
      <SimpleModal message={modalMessage} onClose={() => setModalMessage('')} />
    </div>
  );
}

export default Register;
