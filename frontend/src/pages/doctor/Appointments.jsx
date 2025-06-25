import { useEffect, useState } from 'react';
import { format, addDays, startOfToday, setHours, setMinutes, isSameDay, isEqual } from 'date-fns';
import { getAppointments } from '../../services/appointments/fetch_appointments';

const HOURS = [9, 10, 11, 14, 15, 16, 17];
const DAYS_VISIBLE = 5;

function Appointments() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctorAndAppointments = async () => {
      setLoading(true);
      try {
        // Recupera il dottore loggato
        const meRes = await fetch('/profile/cookies/me');
        if (!meRes.ok) throw new Error('Errore nel recupero dati utente');
        const meData = await meRes.json();
        const doctorId = meData.account.id;

        // Recupera gli appuntamenti (presumo restituisca direttamente un array o oggetto con appointments)
        const appData = await getAppointments(doctorId);
        const appointments = Array.isArray(appData) ? appData : appData.appointments;

        const today = startOfToday();
        const generatedSlots = [];

        for (let d = 0; d < DAYS_VISIBLE; d++) {
          const currentDate = addDays(today, d);
          HOURS.forEach((hour) => {
            const dateTime = setMinutes(setHours(new Date(currentDate), hour), 0);
            const match = appointments.find((a) => {
              const slotDate = new Date(a.date_time);
              return isEqual(slotDate, dateTime);
            });

            generatedSlots.push({
              date: currentDate,
              time: format(dateTime, 'HH:mm'),
              booked: !!match && match.state !== 'waiting',
            });
          });
        }

        setSchedule(generatedSlots);
      } catch (err) {
        console.error('Errore:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorAndAppointments();
  }, []);

  const today = startOfToday();
  const days = Array.from({ length: DAYS_VISIBLE }, (_, i) => addDays(today, i));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-2 mt-16">
      <div className="w-full max-w-6xl bg-white rounded-xl shadow p-6 overflow-x-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Calendario disponibilità</h1>
        {loading ? (
          <div className="text-blue-700">Caricamento calendario...</div>
        ) : (
          <div className="grid grid-cols-6 gap-4 text-sm">
            <div></div>
            {days.map((day, idx) => (
              <div key={idx} className="text-center font-semibold text-gray-700">
                {format(day, 'EEE dd/MM')}
              </div>
            ))}
            {HOURS.map((hour) => (
              <div key={`row-${hour}`} className="contents">
                <div className="font-medium text-gray-600 py-2">{hour}:00</div>
                {days.map((day, idx) => {
                  const slot = schedule.find(
                    (s) => s.time.startsWith(hour.toString()) && isSameDay(s.date, day)
                  );
                  const available = slot && !slot.booked;
                  return (
                    <div
                      key={day + '-' + hour}
                      className={`rounded px-2 py-2 text-center text-xs font-semibold border shadow-sm ${
                        available
                          ? 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer'
                          : 'bg-red-100 text-red-800 line-through'
                      }`}
                    >
                      {slot?.time}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Appointments;
