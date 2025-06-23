import { useEffect, useRef, useState } from 'react';
import loader from '../services/maps/loader';

function MapView({ doctors, selectedDoctorId }) {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [mapReady, setMapReady] = useState(false);


  useEffect(() => {
    loader.load().then(() => {
      mapRef.current = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 45.4642, lng: 9.19 },
        zoom: 6,
        mapId: 'f606eee6e7ca5e231298b2a1',
      });
    });
    setMapReady(true);
  }, []);

  // Crea o aggiorna i marker
  useEffect(() => {
    if (!mapRef.current || !window.google?.maps?.marker) return;

    // Pulisci marker precedenti
    markersRef.current.forEach((m) => m.map = null);
    markersRef.current = [];

    doctors.forEach((doctor) => {
      if (!doctor.latitude || !doctor.longitude) return;

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
          lng: Number(doctor.longitude),
        },
        title: doctor.name,
        content: pin.element,
      });

      markersRef.current.push(marker);
    });
  }, [doctors, selectedDoctorId]);

  // 👉 Centra e zooma sulla posizione del medico selezionato
  useEffect(() => {
    if (!mapReady || !mapRef.current || !selectedDoctorId) return;

    const selected = doctors.find((d) => d.id === selectedDoctorId);
    if (selected && selected.latitude && selected.longitude) {
        mapRef.current.setZoom(17);
        mapRef.current.setCenter({
        lat: Number(selected.latitude),
        lng: Number(selected.longitude),
        });
    }
  }, [selectedDoctorId, doctors, mapReady]);

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden shadow-xl bg-white">
      <div id="map" className="w-full h-full" />
    </div>
  );
}

export default MapView;
