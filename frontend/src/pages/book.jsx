import { useState, useEffect } from 'react';

function Book() {
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [city, setCity] = useState('');
  const [price, setPrice] = useState('');
  const [doctors, setDoctors] = useState([
    {
      id: 1,
      name: 'Dott.ssa Anna Bianchi',
      specialization: 'Cardiologa',
      city: 'Milano',
      address: 'Via Roma 10, Milano',
      price: 80,
    },
    {
      id: 2,
      name: 'Dott. Marco Verdi',
      specialization: 'Dermatologo',
      city: 'Roma',
      address: 'Via Appia 42, Roma',
      price: 40,
    },
  ]);

  const filteredDoctors = doctors.filter((doc) =>
    doc.name.toLowerCase().includes(search.toLowerCase()) &&
    (specialization === '' || doc.specialization === specialization) &&
    (city === '' || doc.city === city) &&
    (price === '' || doc.price <= parseInt(price))
  );

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDAGaYhV489MILIGcJUD_lg-y8mMXdcii4&callback=initMap`;
    script.async = true;
    window.initMap = function () {
      new window.google.maps.Map(document.getElementById('map'), {
        center: { lat: 45.4642, lng: 9.19 },
        zoom: 6,
      });
    };
    document.body.appendChild(script);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 via-blue-400 to-blue-600 px-4 py-20">
      <div className="flex flex-col md:flex-row w-full max-w-7xl gap-6">
        {/* Sezione dottori */}
        <div className="flex-1 bg-blue-700 text-white rounded-2xl p-8 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-4 text-center">PRENOTA UN APPUNTAMENTO</h2>

            {/* Cerca nome */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Cerca nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-blue-100 text-blue-900 placeholder-blue-600 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>

            {/* Filtri su una sola riga */}
            <div className="flex flex-wrap md:flex-nowrap gap-3 mb-6">
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

            {/* Card scrollabili */}
            <div className="overflow-y-auto max-h-[400px] pr-2 space-y-4">
              {filteredDoctors.length === 0 && (
                <p className="text-blue-100 text-center">Nessun dottore trovato.</p>
              )}
              {filteredDoctors.map((doc) => (
                <div key={doc.id} className="bg-white text-blue-900 p-4 rounded-xl shadow-md">
                  <h3 className="text-xl font-semibold">{doc.name}</h3>
                  <p>{doc.specialization} — {doc.city}</p>
                  <p className="text-sm text-gray-600">{doc.address}</p>
                  <p className="text-sm mt-1 font-medium">Prezzo: {doc.price}€</p>
                  <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                    Prenota
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mappa ingrandita e centrata */}
        <div className="w-full md:w-[35%] flex items-center">
          <div className="h-[480px] w-full rounded-2xl overflow-hidden shadow-xl bg-white">
            <div id="map" className="w-full h-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Book;
