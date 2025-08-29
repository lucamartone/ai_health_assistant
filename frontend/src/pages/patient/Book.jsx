import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getAllDoctors, getRankedDoctors, bookAppointment } from '../../services/booking/book';
import { getCoordinatesFromAddress } from '../../services/maps/maps';
import BookingCalendar from '../../components/BookingCalendar';
import MapView from '../../components/MapView';
import { useAuth } from '../../contexts/AuthContext';
import BookingModal from '../../components/BookingModal';
import { Star, MapPin, Clock, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const SPECIALIZATIONS = [
  "Allergologia", "Anestesia e Rianimazione", "Cardiologia", "Chirurgia Generale",
  "Dermatologia", "Endocrinologia", "Gastroenterologia", "Ginecologia",
  "Medicina Generale", "Nefrologia", "Neurologia", "Oculistica", "Oncologia",
  "Ortopedia", "Otorinolaringoiatria", "Pediatria", "Psichiatria", "Psicologia",
  "Radiologia", "Urologia"
];

const SORT_OPTIONS = [
  { value: "comprehensive", label: "Ranking Completo" },
  { value: "distance", label: "Distanza" },
  { value: "rating", label: "Valutazioni" },
  { value: "experience", label: "Esperienza" },
  { value: "price", label: "Prezzo" },
  { value: "availability", label: "Disponibilità" }
];

function Book() {
  const location = useLocation();
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [city, setCity] = useState('');
  const [price, setPrice] = useState('');
  const [sortBy, setSortBy] = useState('comprehensive');
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [appointmentDetails, setAppointmentDetails] = useState(null);

  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const { account } = useAuth();

  // Handle state from chat suggestions
  useEffect(() => {
    if (location.state) {
      if (location.state.specialization) {
        setSpecialization(location.state.specialization);
      }
      if (location.state.city) {
        setCity(location.state.city);
      }
    }
  }, [location.state]);

  // Get user location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log('Geolocation not available:', error);
        }
      );
    }
  }, []);

  const handleSlotSelect = async (doctor, date, time, appointment_id) => {
    if (!account?.id) {
      alert('Devi essere autenticato come paziente per prenotare.');
      return;
    }
    try {
      await bookAppointment(appointment_id, account.id);
      setAppointmentDetails({
        name: doctor.name,
        surname: doctor.surname,
        date: date.toLocaleDateString(),
        time,
        city: doctor.city,
        address: doctor.address,
        price: doctor.price,
      });
    } catch (err) {
      alert('Errore durante la prenotazione: ' + (err.message || ''));
    }
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      let data;
      
      if (sortBy === 'comprehensive' || sortBy === 'distance' || sortBy === 'rating' || sortBy === 'experience' || sortBy === 'price' || sortBy === 'availability') {
        // Use ranked doctors endpoint
        const params = {
          sortBy,
          limit: 50
        };
        
        if (userLocation && (sortBy === 'distance' || sortBy === 'comprehensive')) {
          params.latitude = userLocation.latitude;
          params.longitude = userLocation.longitude;
        }
        
        if (specialization) {
          params.specialization = specialization;
        }
        
        if (price) {
          params.maxPrice = parseInt(price);
        }
        
        data = await getRankedDoctors(params);
      } else {
        // Use original endpoint
        data = await getAllDoctors();
      }
      
      console.log('Dottori recuperati:', data);
      if (Array.isArray(data)) {
        setDoctors(data);
      } else {
        setDoctors([]);
        setFetchError('Errore: risposta inattesa dal server.');
      }
    } catch (error) {
      setFetchError(error.message);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [sortBy, specialization, price, userLocation]);

  const filteredDoctors = Array.isArray(doctors)
    ? doctors.filter((doc) =>
        doc.name.toLowerCase().includes(search.toLowerCase()) &&
        (city === '' || doc.city === city)
      )
    : [];

  const handleDoctorClick = async (doctor) => {
    setSelectedDoctorId(doctor.id);
    if (doctor.address && doctor.city) {
      const coords = await getCoordinatesFromAddress(doctor.address, doctor.city);
      if (coords) {
        console.log("Coordinate da geocoding:", coords);
      }
    }
  };

  const renderDoctorCard = (doc, index) => (
    <motion.div
      key={doc.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      onClick={() => handleDoctorClick(doc)}
      className={`flex flex-row items-start gap-6 bg-white text-blue-900 p-4 rounded-xl shadow-md hover:ring-2 transition ${
        doc.id === selectedDoctorId ? 'ring-2 ring-white' : ''
      }`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-xl font-semibold">{doc.name} {doc.surname}</h3>
          {doc.avg_rating > 0 && (
            <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium text-yellow-700">{doc.avg_rating}</span>
              {doc.review_count > 0 && (
                <span className="text-xs text-yellow-600">({doc.review_count})</span>
              )}
            </div>
          )}
        </div>
        
        <p className="text-blue-700 font-medium">{doc.specialization}</p>
        
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
          {doc.city && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{doc.city}</span>
            </div>
          )}
          {doc.years_experience > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{doc.years_experience} anni</span>
            </div>
          )}
          {doc.available_slots > 0 && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{doc.available_slots} slot disponibili</span>
            </div>
          )}
        </div>
        
        {doc.distance_km && (
          <p className="text-sm text-green-600 mt-1">
            📍 {doc.distance_km} km da te
          </p>
        )}
        
        <p className="text-sm mt-1 font-medium">Prezzo: {doc.price ? `${doc.price}€` : 'N/D'}</p>
        
        <button
          className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Prenota
        </button>
      </div>
      
      <div className="min-w-[320px]">
        <BookingCalendar onSlotSelect={handleSlotSelect} doctor={doc}/>
      </div>
    </motion.div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex items-start justify-center min-h-screen bg-gradient-to-br from-blue-200 via-blue-400 to-blue-600 px-4 py-20"
    >
      <div className="flex flex-row w-full max-w-7xl gap-6">
        {/* Colonna sinistra */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="flex-1 bg-blue-700 text-white rounded-2xl p-8 shadow-xl flex flex-col"
        >
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="text-3xl font-bold mb-4 text-center"
          >
            PRENOTA UN APPUNTAMENTO
          </motion.h2>

          {fetchError && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="mb-4 p-2 bg-red-200 text-red-800 rounded text-center"
            >
              {fetchError}
            </motion.div>
          )}

          {/* Filtri */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            className="sticky top-0 bg-blue-700 z-10 pb-4"
          >
            <div className="mb-4">
              <input
                type="text"
                placeholder="Cerca nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-blue-100 text-blue-900 placeholder-blue-600 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
            <div className="flex flex-wrap md:flex-nowrap gap-3">
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="flex-1 min-w-[150px] px-4 py-2 rounded-md bg-blue-100 text-blue-900"
              >
                <option value="">Specializzazioni</option>
                {SPECIALIZATIONS.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="flex-1 min-w-[150px] px-4 py-2 rounded-md bg-blue-100 text-blue-900"
              >
                <option value="">Città</option>
                <option value="Milano">Milano</option>
                <option value="Roma">Roma</option>
                <option value="Torino">Torino</option>
              </select>
              <select
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="flex-1 min-w-[150px] px-4 py-2 rounded-md bg-blue-100 text-blue-900"
              >
                <option value="">Prezzo</option>
                <option value="50">Fino a 50€</option>
                <option value="100">Fino a 100€</option>
              </select>
            </div>
            
            {/* Ranking options */}
            <div className="mt-6 mb-3">
              <label className="block text-sm font-medium text-blue-100 mb-2">
                Ordina per:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-blue-100 text-blue-900"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {!userLocation && (sortBy === 'distance' || sortBy === 'comprehensive') && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="mb-3 p-2 bg-yellow-100 text-yellow-800 rounded text-sm"
              >
                📍 Abilita la geolocalizzazione per ordinare per distanza
              </motion.div>
            )}
          </motion.div>

          {/* Lista dottori */}
          <div className="mt-4 space-y-4 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 400px)' }}>
            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center py-8"
              >
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                <p className="mt-2 text-blue-100">Caricamento dottori...</p>
              </motion.div>
            )}
            
            {!loading && filteredDoctors.length === 0 && !fetchError && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="text-blue-100 text-center"
              >
                Nessun dottore trovato.
              </motion.p>
            )}
            
            {!loading && filteredDoctors.map((doc, index) => renderDoctorCard(doc, index))}
          </div>
        </motion.div>

        {/* Mappa */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="w-[35%] flex items-start"
        >
          {Array.isArray(filteredDoctors) && filteredDoctors.length > 0 && (
            <MapView doctors={filteredDoctors} selectedDoctorId={selectedDoctorId} />
          )}
        </motion.div>
      </div>

      {/* Modale di conferma appuntamento */}
      <BookingModal
        appointmentDetails={appointmentDetails}
        onClose={() => {
          setAppointmentDetails(null);
        }}
      />
    </motion.div>
  );
}

export default Book;
