import { useState, useEffect } from 'react';
import { getFreeDoctors } from '../../services/book/fetch_book';
import { getCoordinatesFromAddress } from '../../services/maps/fetch_maps';
import BookingCalendar from '../../components/BookingCalendar';
import MapView from '../../components/MapView'; //

function Book() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [city, setCity] = useState('');
  const [price, setPrice] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);

  const handleSlotSelect = (doctor, date, time) => {
    alert(`Prenotato con ${doctor.name} il ${date.toLocaleDateString()} alle ${time}`);
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await getFreeDoctors();
        console.log('Dottori recuperati:', data);
        setDoctors(data);
      } catch (error) {
        console.error('Errore durante il fetch dei dottori:', error);
      }
    };

    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter((doc) =>
    doc.name.toLowerCase().includes(search.toLowerCase()) &&
    (specialization === '' || doc.specialization === specialization) &&
    (city === '' || doc.city === city) &&
    (price === '' || doc.price <= parseInt(price))
  );

  const handleDoctorClick = async (doctor) => {
    setSelectedDoctorId(doctor.id);

    // (opzionale) geocoding per logging o altre funzioni
    if (doctor.address && doctor.city) {
      const coords = await getCoordinatesFromAddress(doctor.address, doctor.city);
      if (coords) {
        console.log("Coordinate da geocoding:", coords);
      }
    }
  };

  return (
    <div className="flex items-start justify-center min-h-screen bg-gradient-to-br from-blue-200 via-blue-400 to-blue-600 px-4 py-20">
      <div className="flex flex-row w-full max-w-7xl gap-6">
        {/* Colonna sinistra */}
        <div className="flex-1 bg-blue-700 text-white rounded-2xl p-8 shadow-xl flex flex-col">
          <h2 className="text-3xl font-bold mb-4 text-center">PRENOTA UN APPUNTAMENTO</h2>

          {/* Filtri */}
          <div className="sticky top-0 bg-blue-700 z-10 pb-4">
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
                <option value="Cardiologa">Cardiologa</option>
                <option value="Dermatologo">Dermatologo</option>
                <option value="Neurologo">Neurologo</option>
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
          </div>

          {/* Lista dottori */}
          <div className="mt-4 space-y-4 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            {filteredDoctors.length === 0 && (
              <p className="text-blue-100 text-center">Nessun dottore trovato.</p>
            )}
            {filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                onClick={() => handleDoctorClick(doc)}
                className={`flex flex-row items-start gap-6 bg-white text-blue-900 p-4 rounded-xl shadow-md hover:ring-2 transition ${
                  doc.id === selectedDoctorId ? 'ring-2 ring-white' : ''
                }`}
              >
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{doc.name} {doc.surname}</h3>
                  <p>{doc.specialization} — {doc.city || 'N/D'}</p>
                  <p className="text-sm text-gray-600">{doc.address || 'Indirizzo non disponibile'}</p>
                  <p className="text-sm mt-1 font-medium">Prezzo: {doc.price ? `${doc.price}€` : 'N/D'}</p>
                  <button
                    className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                  >
                    Prenota
                  </button>
                </div>
                <div className="min-w-[320px]">
                  <BookingCalendar onSlotSelect={(date, time) => handleSlotSelect(doc, date, time)} doctor={doc} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Colonna destra: mappa */}
        <div className="w-[35%] flex items-start">
          <MapView doctors={filteredDoctors} selectedDoctorId={selectedDoctorId} />
        </div>
      </div>
    </div>
  );
}

export default Book;
