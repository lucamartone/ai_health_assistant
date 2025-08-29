import { useState, useEffect } from 'react';
import { getFreeSlots } from '../services/booking/book';
import { getNewDate } from '../services/booking/aux_book';

function BookingCalendar({ onSlotSelect, doctor }) {
  console.log(doctor);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [slots, setSlots] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!doctor) return;
      setLoading(true);
      try {
        const data = await getFreeSlots(doctor.id);
        console.log('Slot disponibili:', data);
        const formattedSlots = formatSlots(data.slots || []);
        setSlots(formattedSlots);
      } catch (error) {
        console.error('Errore fetch slot:', error);
        setSlots({});
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
    
    // Refresh automatico ogni 30 secondi per aggiornare gli slot disponibili
    const interval = setInterval(fetchSlots, 30000);
    
    return () => clearInterval(interval);
  }, [doctor]);

  const formatSlots = (data) => {
    const slotsMap = {};
    data.forEach(item => {
      const [datePart, timePart] = item.date_time.split('T');
      const time = timePart.slice(0, 5); // Solo HH:mm
      if (!slotsMap[datePart]) {
        slotsMap[datePart] = [];
      }
      slotsMap[datePart].push({
        time,
        appointment_id: item.appointment_id
      });
    });
    return slotsMap;
  };

  const dateKey = currentDate.toISOString().split('T')[0];
  const currentSlots = slots[dateKey] || [];

  const changeDay = (delta) => {
    const newDate = getNewDate(currentDate, delta);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    // Impedisci navigazione verso date nel passato
    if (delta < 0 && newDate < today) {
      return;
    }
    
    setCurrentDate(newDate);
  };

  return (
    <div className="border rounded-xl p-4 bg-gray-100 h-[200px] flex flex-col w-full">
      <div className="flex justify-between items-center mb-2">
        <button 
          onClick={() => changeDay(-1)} 
          className={`px-2 py-1 rounded ${
            currentDate <= new Date(new Date().setHours(0, 0, 0, 0)) 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-gray-300 hover:bg-gray-400'
          }`}
          disabled={currentDate <= new Date(new Date().setHours(0, 0, 0, 0))}
        >
          ←
        </button>
        <span className="font-bold">{currentDate.toLocaleDateString()}</span>
        <button onClick={() => changeDay(1)} className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400">→</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {loading ? (
          <p className="text-sm text-gray-500">Caricamento slot...</p>
        ) : currentSlots.length === 0 ? (
          <p className="text-sm text-gray-500">Nessuno slot disponibile</p>
        ) : (
          currentSlots.map((slot) => (
            <button
              key={slot.time}
              onClick={() => onSlotSelect(doctor, currentDate, slot.time, slot.appointment_id)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              disabled={loading}
            >
              {slot.time}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default BookingCalendar;
