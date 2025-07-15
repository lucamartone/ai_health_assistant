import { useEffect, useState } from 'react';
import {
  format,
  addDays,
  startOfToday,
  setHours,
  setMinutes
} from 'date-fns';
import { getAppointments, getLocations, insertAppointment, removeAppointment, reload } from '../../services/appointments/fetch_appointments';
import { me } from '../../services/profile/fetch_profile';
import { Pencil, Check, Calendar, Clock, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const HOURS = [9, 10, 11, 12, 14, 15, 16, 17];
const DAYS_VISIBLE = 5;

function Appointments() {
  const [appointmentsByLocation, setAppointmentsByLocation] = useState({});
  const [locations, setLocations] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [doctorId, setDoctorId] = useState(null);
  const [addressToId, setAddressToId] = useState({});

  useEffect(() => {
    reload();
    const fetchData = async () => {
      setLoading(true);
      try {
        const meData = await me();
        const doctorId = meData.account.id;
        setDoctorId(doctorId);

        const locData = await getLocations(doctorId);
        const locList = locData.locations || [];

        const appData = await getAppointments(doctorId);
        const appointments = Array.isArray(appData) ? appData : appData.appointments;

        const idToAddress = {};
        const addressToIdMap = {};
        locList.forEach(loc => {
          idToAddress[loc.id] = loc.address;
          addressToIdMap[loc.address] = loc.id;
        });
        setAddressToId(addressToIdMap);

        const grouped = {};
        for (const loc of locList) {
          const name = idToAddress[loc.id];
          grouped[name] = [];
        }

        for (const appointment of appointments) {
          const locName = idToAddress[appointment.location_id] || 'Sede sconosciuta';
          if (!grouped[locName]) grouped[locName] = [];

          grouped[locName].push({
            dateTime: new Date(appointment.date_time),
            state: appointment.status
          });
        }

        const today = startOfToday();
        const generated = {};

        for (const [locationName, list] of Object.entries(grouped)) {
          const slots = [];
          for (let d = 0; d < DAYS_VISIBLE; d++) {
            const currentDate = addDays(today, d);
            HOURS.forEach((hour) => {
              const dateTime = setMinutes(setHours(new Date(currentDate), hour), 0);
              const match = list.find((a) => a.dateTime.getTime() === dateTime.getTime());

              slots.push({
                dateTime,
                time: format(dateTime, 'HH:mm'),
                state: match ? match.state : null
              });
            });
          }
          generated[locationName] = slots;
        }

        setAppointmentsByLocation(generated);
        setLocations(Object.keys(generated));
        setActiveTab(Object.keys(generated)[0]);
      } catch (err) {
        console.error('Errore nel caricamento:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const today = startOfToday();
  const days = Array.from({ length: DAYS_VISIBLE }, (_, i) => addDays(today, i));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-7 h-7 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Calendario Appuntamenti</h2>
            </div>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              onClick={() => setEditing((prev) => !prev)}
            >
              {editing ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
              {editing ? 'Salva' : 'Modifica'}
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-blue-800 font-medium">Caricamento calendario...</p>
            </div>
          ) : (
            <>
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex gap-3 overflow-x-auto">
                  {locations.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => setActiveTab(loc)}
                      className={`px-6 py-3 rounded-lg text-sm font-semibold border transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                        activeTab === loc
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-white text-blue-800 hover:bg-blue-50 border-blue-200'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {activeTab && (
                <motion.div 
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="overflow-x-auto">
                    <div className="grid grid-cols-6 gap-4 text-sm min-w-[800px]">
                      <div className="flex items-center justify-end pr-4">
                        <Clock className="w-4 h-4 text-gray-500" />
                      </div>
                      {days.map((day, idx) => (
                        <div key={idx} className="text-center font-semibold text-blue-800 bg-blue-100 py-3 rounded-lg shadow-sm">
                          <div className="text-xs text-blue-600 uppercase">{format(day, 'EEE')}</div>
                          <div>{format(day, 'dd/MM')}</div>
                        </div>
                      ))}
                      {HOURS.map((hour) => (
                        <div key={`row-${hour}`} className="contents">
                          <div className="font-medium text-gray-700 py-3 text-right pr-4 flex items-center justify-end">
                            {hour}:00
                          </div>
                          {days.map((day) => {
                            const targetSlotTime = setMinutes(setHours(new Date(day), hour), 0);
                            const schedule = appointmentsByLocation[activeTab];
                            const slotIndex = schedule.findIndex(
                              (s) => new Date(s.dateTime).getTime() === targetSlotTime.getTime()
                            );
                            const slot = schedule[slotIndex];
                            const isPast = slot?.dateTime < new Date();

                            let cellClass = 'bg-gray-100 text-gray-400 border-gray-200';
                            let statusText = 'Non disponibile';

                            if (slot) {
                              if (slot.state === 'waiting') {
                                cellClass = 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200';
                                statusText = 'Disponibile';
                              } else if (slot.state === 'booked') {
                                cellClass = 'bg-red-100 text-red-800 border-red-300';
                                statusText = 'Prenotato';
                              } else if (slot.state === 'completed') {
                                cellClass = 'bg-yellow-100 text-yellow-800 border-yellow-300';
                                statusText = 'Completato';
                              } else if (slot.state === 'cancelled') {
                                cellClass = 'bg-gray-100 text-gray-400 border-gray-200';
                                statusText = 'Cancellato';
                              } else if (slot.state === 'terminated') {
                                cellClass = 'bg-purple-100 text-purple-800 border-purple-300';
                                statusText = 'Terminato';
                              }
                            }

                            return (
                              <div
                                key={day + '-' + hour}
                                className={`rounded-lg px-3 py-3 text-center font-medium border transition-all duration-200 ${cellClass}`}
                              >
                                {editing ? (
                                  <select
                                    value={slot?.state || ''}
                                    disabled={isPast}
                                    onChange={async (e) => {
                                      const newState = e.target.value;
                                      const updated = [...appointmentsByLocation[activeTab]];
                                      updated[slotIndex] = {
                                        ...updated[slotIndex],
                                        state: newState || null,
                                      };
                                      setAppointmentsByLocation(prev => ({
                                        ...prev,
                                        [activeTab]: updated,
                                      }));

                                      if (newState === 'waiting') {
                                        try {
                                          await insertAppointment({
                                            doctor_id: doctorId,
                                            location_id: addressToId[activeTab],
                                            date_time: slot.dateTime.toISOString(),
                                            state: 'waiting',
                                          });
                                        } catch (error) {
                                          console.error("Errore nell'inserimento:", error);
                                        }
                                      } else if (newState === '') {
                                        try {
                                          await removeAppointment({
                                            doctor_id: doctorId,
                                            location_id: addressToId[activeTab],
                                            date_time: slot.dateTime.toISOString(),
                                          });
                                        } catch (error) {
                                          console.error("Errore nella rimozione:", error);
                                        }
                                      }
                                    }}
                                    className="w-full text-xs bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={isPast ? 'Non modificabile perché nel passato' : ''}
                                  >
                                    <option value="">Non disponibile</option>
                                    <option value="waiting">Disponibile</option>
                                  </select>
                                ) : (
                                  <div className="text-xs font-medium">{statusText}</div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default Appointments;
