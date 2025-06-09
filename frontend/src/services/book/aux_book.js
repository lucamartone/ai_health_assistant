import { useEffect, useState } from 'react';
import { getFreeSlots } from './fetch_book';

export function getSlots(doctor) {
  const [slots, setSlots] = useState({});
  
  useEffect(() => {
    const fetchSlots = async () => {
      if (!doctor) return;
      try {
        const data = await getFreeSlots(doctor.doctor_id, doctor.latitude, doctor.longitude);
        setSlots(formatSlots(data));
      } catch (error) {
        console.error('Errore fetch slot:', error);
      }
    };
    fetchSlots();
  }, [doctor]);

  return slots;
}
  
export function formatSlots(data) {
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

export function getNewDate(currentDate, delta) {
  const newDate = new Date(currentDate);
  newDate.setDate(newDate.getDate() + delta);
  return newDate;
}