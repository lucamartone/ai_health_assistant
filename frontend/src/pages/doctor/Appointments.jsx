import { useEffect, useState } from 'react';
import {
  format,
  addDays,
  startOfToday,
  setHours,
  setMinutes
} from 'date-fns';
import { getAppointments } from '../../services/appointments/fetch_appointments';
import { me } from '../../services/profile/fetch_profile';
import { Pencil, Check } from 'lucide-react';

const HOURS = [9, 10, 11, 12, 14, 15, 16, 17];
const DAYS_VISIBLE = 5;
const STATES = [
  { value: 'waiting', label: 'Disponibile' },
  { value: 'booked', label: 'Prenotato' },
  { value: 'completed', label: 'Visitato' },
  { value: 'cancelled', label: 'Cancellato' }
];

function Appointments() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchDoctorAndAppointments = async () => {
      setLoading(true);
      try {
        const meData = await me();
        const doctorId = meData.account.id;

        const appData = await getAppointments(doctorId);
        const appointments = Array.isArray(appData) ? appData : appData.appointments;
        console.log('Fetched Appointments:', appointments);

        const today = startOfToday();
        const generatedSlots = [];

        for (let d = 0; d < DAYS_VISIBLE; d++) {
          const currentDate = addDays(today, d);
          HOURS.forEach((hour) => {
            const dateTime = setMinutes(setHours(new Date(currentDate), hour), 0);
            const match = appointments.find((a) => {
              const slotDate = new Date(a.date_time);
              return slotDate.getTime() === dateTime.getTime();
            });

            generatedSlots.push({
              dateTime,
              time: format(dateTime, 'HH:mm'),
              state: match ? match.state : null
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

  const handleStateChange = (index, newState) => {
    setSchedule((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], state: newState };
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 via-blue-200 to-white flex flex-col items-center py-8 px-4 mt-16">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-900">Disponibilità del dottore</h1>
          <button
            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md flex items-center hover:bg-blue-200"
            onClick={() => setEditing((prev) => !prev)}
          >
            {editing ? <Check className="w-4 h-4 mr-1" /> : <Pencil className="w-4 h-4 mr-1" />}
            {editing ? 'Salva' : 'Modifica'}
          </button>
        </div>
        {loading ? (
          <div className="text-blue-700 text-center">Caricamento calendario...</div>
        ) : (
          <div className="grid grid-cols-6 gap-4 text-sm">
            <div></div>
            {days.map((day, idx) => (
              <div key={idx} className="text-center font-semibold text-blue-800 bg-blue-100 py-2 rounded-md shadow">
                {format(day, 'EEE dd/MM')}
              </div>
            ))}
            {HOURS.map((hour) => (
              <div key={`row-${hour}`} className="contents">
                <div className="font-medium text-gray-700 py-2 text-right pr-2">{hour}:00</div>
                {days.map((day, dayIdx) => {
                  const targetSlotTime = setMinutes(setHours(new Date(day), hour), 0);
                  const slotIndex = schedule.findIndex(
                    (s) => new Date(s.dateTime).getTime() === targetSlotTime.getTime()
                  );
                  const slot = schedule[slotIndex];

                  let cellClass = 'bg-gray-200 text-gray-400';
                  if (slot) {
                    if (slot.state === 'waiting') {
                      cellClass = 'bg-green-100 text-green-800 hover:bg-green-200';
                    } else if (slot.state === 'booked') {
                      cellClass = 'bg-red-100 text-red-800 line-through';
                    } else if (slot.state === 'completed') {
                      cellClass = 'bg-yellow-100 text-yellow-800 line-through';
                    } else if (slot.state === 'cancelled') {
                      cellClass = 'bg-gray-100 text-gray-400 line-through';
                    }
                  }

                  return (
                    <div
                      key={day + '-' + hour}
                      className={`rounded-lg px-2 py-2 text-center font-semibold border shadow-sm transition duration-200 ${cellClass}`}
                    >
                      {editing && slot ? (
                        <select
                          value={slot.state || ''}
                          onChange={(e) => handleStateChange(slotIndex, e.target.value)}
                          className="bg-transparent text-sm text-center w-full"
                        >
                          <option value="">---</option>
                          {STATES.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      ) : (
                        format(targetSlotTime, 'HH:mm')
                      )}
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