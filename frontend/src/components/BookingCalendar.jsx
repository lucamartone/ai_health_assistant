import { useState, useEffect } from 'react';
import { getSlots, getNewDate } from '../services/book/aux_book';

function BookingCalendar({ onSlotSelect, doctor }) {
  console.log(doctor);
  const [currentDate, setCurrentDate] = useState(new Date());
  const slots = getSlots(doctor);

  const dateKey = currentDate.toISOString().split('T')[0];
  const currentSlots = slots[dateKey] || [];

  const changeDay = (delta) => {
    setCurrentDate(getNewDate(currentDate, delta));
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
              key={slot.time}
              onClick={() => onSlotSelect(doctor, currentDate, slot.time, slot.appointment_id)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
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
