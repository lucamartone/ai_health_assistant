import { useState, useEffect } from 'react';
import { getHealthData, updateHealthData } from '../../../services/profile/fetch_health';
import { useAuth } from '../../../contexts/AuthContext';

function HealthTab() {
  const { account } = useAuth();
  const [healthData, setHealthData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!account?.id) return;

    getHealthData(account.id)
      .then((data) => {
        const formatted = {
          blood_type: data.blood_type || '',
          allergies: data.allergies || [],
          chronic_conditions: data.chronic_conditions || [],
        };
        setHealthData(formatted);
        setOriginalData(formatted);
      })
      .catch((err) => {
        setError('Errore nel caricamento dei dati di salute');
        console.error(err);
      });
  }, [account]);

  const handleChange = (field, value) => {
    const updated = { ...healthData, [field]: value };
    setHealthData(updated);
    checkIfChanged(updated);
  };

  const checkIfChanged = (updatedData) => {
    setHasChanges(JSON.stringify(updatedData) !== JSON.stringify(originalData));
  };

  const handleSave = async () => {
    if (!account?.id || !hasChanges) return;
    setSaving(true);
    setError('');

    try {
      await updateHealthData(
        account.id,
        healthData.blood_type,
        healthData.allergies,
        healthData.chronic_conditions
      );
      setOriginalData(healthData);
      setHasChanges(false);
    } catch (err) {
      setError(err.message || 'Errore durante il salvataggio');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!healthData) {
    return <div className="text-center py-6 text-gray-600">Caricamento dati di salute...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Dati di Salute</h2>

      {/* Gruppo sanguigno */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <label className="block text-sm font-semibold text-blue-900 mb-2">Gruppo Sanguigno</label>
        <select
          value={healthData.blood_type}
          onChange={e => handleChange('blood_type', e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        >
          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Allergie */}
      <div className="bg-yellow-50 p-6 rounded-lg space-y-2">
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">Allergie</h3>
        {healthData.allergies?.map((allergy, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="text"
              value={allergy}
              onChange={(e) => {
                const updated = [...healthData.allergies];
                updated[idx] = e.target.value;
                handleChange('allergies', updated);
              }}
              className="flex-1 px-3 py-2 border rounded-lg"
            />
            <button
              onClick={() =>
                handleChange(
                  'allergies',
                  healthData.allergies.filter((_, i) => i !== idx)
                )
              }
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={() => handleChange('allergies', [...healthData.allergies, ''])}
          className="text-sm text-yellow-700 hover:text-yellow-900 mt-2"
        >
          + Aggiungi allergia
        </button>
      </div>

      {/* Condizioni croniche */}
      <div className="bg-purple-50 p-6 rounded-lg space-y-2">
        <h3 className="text-lg font-semibold text-purple-900 mb-2">Condizioni Croniche</h3>
        {healthData.chronic_conditions?.map((condition, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="text"
              value={condition}
              onChange={(e) => {
                const updated = [...healthData.chronic_conditions];
                updated[idx] = e.target.value;
                handleChange('chronic_conditions', updated);
              }}
              className="flex-1 px-3 py-2 border rounded-lg"
            />
            <button
              onClick={() =>
                handleChange(
                  'chronic_conditions',
                  healthData.chronic_conditions.filter((_, i) => i !== idx)
                )
              }
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={() =>
            handleChange('chronic_conditions', [...healthData.chronic_conditions, ''])
          }
          className="text-sm text-purple-700 hover:text-purple-900 mt-2"
        >
          + Aggiungi condizione
        </button>
      </div>

      {/* Pulsante Salva */}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="text-right">
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className={`px-6 py-2 rounded-lg font-medium transition ${
            hasChanges
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-600 cursor-not-allowed'
          }`}
        >
          {saving ? 'Salvataggio...' : 'Salva'}
        </button>
      </div>
    </div>
  );
}

export default HealthTab;
