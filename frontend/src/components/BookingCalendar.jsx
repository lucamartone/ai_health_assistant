import { useState, useEffect } from 'react';
import { get_free_slots } from '../services/fetch_book';

function BookingCalendar({ onSlotSelect, doctor }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [slots, setSlots] = useState({});

  useEffect(() => {
    if (!doctor) return;
    const fetchSlots = async () => {
      try {
        const data = await get_free_slots(doctor.doctor_id, doctor.latitude, doctor.longitude);
        const formattedSlots = formatSlots(data);
        setSlots(formattedSlots);
      } catch (error) {
        console.error('Errore recupero slot:', error);
      }
    };
    fetchSlots();
  }, [doctor]);

  const formatSlots = (data) => {
    const slotsMap = {};
    data.forEach(item => {
      const [datePart, timePart] = item.date_time.split('T');
      const time = timePart.slice(0, 5); // Solo HH:mm
      if (!slotsMap[datePart]) {
        slotsMap[datePart] = [];
      }
      slotsMap[datePart].push(time);
    });
    return slotsMap;
  };

  const dateKey = currentDate.toISOString().split('T')[0];
  const currentSlots = slots[dateKey] || [];

  const changeDay = (delta) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + delta);
    setCurrentDate(newDate);
  };

  return (
    <div className="border rounded-xl p-4 bg-gray-100 h-[200px] flex flex-col w-full">
      <div className="flex justify-between items-center mb-2">
        <button onClick={() => changeDay(-1)} className="px-2 py-1 bg-gray-300 rounded">←</button>
        <span className="font-bold">{currentDate.toLocaleDateString()}</span>
        <button onClick={() => changeDay(1)} className="px-2 py-1 bg-gray-300 rounded">→</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {currentSlots.length === 0 ? (
          <p className="text-sm text-gray-500">Nessuno slot disponibile</p>
        ) : (
          currentSlots.map((slot) => (
            <button
              key={slot}
              onClick={() => onSlotSelect(doctor, currentDate, slot)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              {slot}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default BookingCalendar;
