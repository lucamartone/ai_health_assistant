import { useEffect, useMemo, useState } from 'react';
import { me } from '../../services/profile/profile';
import { getLocations, generateSlots, clearSlots } from '../../services/booking/appointments';
import SimpleModal from '../../components/SimpleModal';

const DEFAULT_WEEKDAYS = [1, 2, 3, 4, 5]; // Lun-Ven (Mon-Fri)

function Schedule() {
  const [doctorId, setDoctorId] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocationIds, setSelectedLocationIds] = useState([]);
  const [weekdays, setWeekdays] = useState(DEFAULT_WEEKDAYS);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [slotMinutes, setSlotMinutes] = useState(60);
  const [onlyStatus, setOnlyStatus] = useState('waiting');
  const [loading, setLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const meData = await me();
        const id = meData?.account?.id;
        if (!id) return;
        setDoctorId(id);
        const loc = await getLocations(id);
        setLocations(loc?.locations || []);
      } catch (e) {
        setModalMessage('Errore nel caricamento delle sedi');
      }
    };
    init();
  }, []);

  const locationIdToAddress = useMemo(() => {
    const m = {};
    for (const l of locations) m[l.id] = l.address;
    return m;
  }, [locations]);

  const toggleLocation = (id) => {
    setSelectedLocationIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleWeekday = (idx) => {
    setWeekdays((prev) =>
      prev.includes(idx) ? prev.filter((x) => x !== idx) : [...prev, idx]
    );
  };

  const canSubmit =
    doctorId &&
    selectedLocationIds.length > 0 &&
    weekdays.length > 0 &&
    startDate &&
    endDate &&
    startTime &&
    endTime &&
    slotMinutes > 0;

  const onGenerate = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await generateSlots({
        doctor_id: doctorId,
        location_ids: selectedLocationIds,
        start_date: startDate,
        end_date: endDate,
        weekdays,
        start_time: startTime,
        end_time: endTime,
        slot_minutes: Number(slotMinutes),
      });
      setModalMessage('Slot generati con successo');
    } catch (e) {
      setModalMessage('Errore durante la generazione degli slot');
    } finally {
      setLoading(false);
    }
  };

  const onClear = async () => {
    if (!doctorId || !startDate || !endDate) return;
    setLoading(true);
    try {
      await clearSlots({
        doctor_id: doctorId,
        location_ids: selectedLocationIds.length ? selectedLocationIds : null,
        start_date: startDate,
        end_date: endDate,
        only_status: onlyStatus || null,
      });
      setModalMessage('Slot rimossi');
    } catch (e) {
      setModalMessage('Errore durante la rimozione degli slot');
    } finally {
      setLoading(false);
    }
  };

  const weekdayLabels = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
  const weekdayIndex = [0, 1, 2, 3, 4, 5, 6];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Configura Orari</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sedi</label>
              <div className="space-y-2 max-h-48 overflow-auto border rounded-md p-3">
                {locations.map((l) => (
                  <label key={l.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedLocationIds.includes(l.id)}
                      onChange={() => toggleLocation(l.id)}
                    />
                    <span>{locationIdToAddress[l.id] || l.address}</span>
                  </label>
                ))}
                {locations.length === 0 && (
                  <div className="text-sm text-gray-500">Nessuna sede trovata</div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giorni della settimana</label>
              <div className="flex flex-wrap gap-2">
                {weekdayIndex.map((idx, i) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleWeekday(idx)}
                    className={`px-3 py-1 rounded-md text-sm border ${
                      weekdays.includes(idx)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-blue-800 border-blue-300'
                    }`}
                  >
                    {weekdayLabels[i]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data inizio</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data fine</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ora inizio</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ora fine</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durata slot (min)</label>
                <input
                  type="number"
                  min={5}
                  max={480}
                  value={slotMinutes}
                  onChange={(e) => setSlotMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cancella solo stato</label>
                <select
                  value={onlyStatus}
                  onChange={(e) => setOnlyStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="waiting">Solo liberi (waiting)</option>
                  <option value="">Tutti gli stati</option>
                </select>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 flex gap-3 justify-end">
              <button
                type="button"
                disabled={!doctorId || !startDate || !endDate || loading}
                onClick={onClear}
                className={`px-4 py-2 rounded-md border ${
                  !doctorId || !startDate || !endDate || loading
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-white text-red-700 border-red-300 hover:bg-red-50'
                }`}
              >
                Cancella slot
              </button>
              <button
                type="button"
                disabled={!canSubmit || loading}
                onClick={onGenerate}
                className={`px-4 py-2 rounded-md text-white ${
                  !canSubmit || loading
                    ? 'bg-blue-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Genera slot
              </button>
            </div>
          </div>
        </div>
      </div>

      <SimpleModal message={modalMessage} onClose={() => setModalMessage('')} />
    </div>
  );
}

export default Schedule;


