import { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { getFreeDoctors } from '../services/book/fetch_book';
import BookingCalendar from '../components/BookingCalendar';

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

  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    const loader = new Loader({
      apiKey: 'AIzaSyDAGaYhV489MILIGcJUD_lg-y8mMXdcii4',
      version: 'weekly',
      libraries: ['marker'],
    });

    loader.load().then(() => {
      mapRef.current = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 45.4642, lng: 9.19 },
        zoom: 6,
        mapId: 'f606eee6e7ca5e231298b2a1',
      });
    });
  }, []);

  useEffect(() => {
    if (!mapRef.current || !window.google?.maps?.marker) return;

    markersRef.current.forEach((m) => m.map = null);
    markersRef.current = [];

    filteredDoctors.forEach((doctor) => {
      const pinColor = doctor.id === selectedDoctorId ? '#1e40af' : '#3b82f6';

      const pin = new google.maps.marker.PinElement({
        background: pinColor,
        glyphColor: 'white',
        borderColor: '#1e3a8a',
      });

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: mapRef.current,
        position: {
          lat: Number(doctor.latitude),
          lng: Number(doctor.longitude)
        },

        title: doctor.name,
        content: pin.element,
      });

      markersRef.current.push(marker);
    });
  }, [filteredDoctors, selectedDoctorId]);

  const handleDoctorClick = (doctor) => {
    setSelectedDoctorId(doctor.id);
    if (mapRef.current) {
      mapRef.current.setZoom(17);
      mapRef.current.setCenter({ lat: Number(doctor.latitude), lng: Number(doctor.longitude) });
    }
  };

  return (
    <div className="flex items-start justify-center min-h-screen bg-gradient-to-br from-blue-200 via-blue-400 to-blue-600 px-4 py-20">
      <div className="flex flex-row w-full max-w-7xl gap-6">
        <div className="flex-1 bg-blue-700 text-white rounded-2xl p-8 shadow-xl flex flex-col">
          <h2 className="text-3xl font-bold mb-4 text-center">PRENOTA UN APPUNTAMENTO</h2>

          {/* Filtri fissi */}
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

          {/* Lista scrollabile */}
          <div className="mt-4 space-y-4 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            {filteredDoctors.length === 0 && (
              <p className="text-blue-100 text-center">Nessun dottore trovato.</p>
            )}
            {filteredDoctors.map((doc) => (
              <div
                key={doc.doctor_id}
                onClick={() => handleDoctorClick(doc)}
                className={`flex flex-row items-start gap-6 bg-white text-blue-900 p-4 rounded-xl shadow-md hover:ring-2 transition ${
                  doc.doctor_id === selectedDoctorId ? 'ring-2 ring-white' : ''
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

        <div className="w-[35%] flex items-start">
          <div className="h-full w-full rounded-2xl overflow-hidden shadow-xl bg-white">
            <div id="map" className="w-full h-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Book;