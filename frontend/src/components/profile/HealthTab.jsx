// src/pages/tabs/HealthTab.jsx
import { useState } from 'react';

function HealthTab() {
  const [healthData, setHealthData] = useState({
    bloodType: 'A+',
    allergies: ['Nessuna allergia nota'],
    conditions: ['Nessuna condizione cronica'],
    emergencyContact: {
      name: 'Mario Rossi',
      phone: '+39 123 456 7890',
      relationship: 'Familiare',
    },
  });

  const handleChange = (field, value) => {
    setHealthData(prev => ({ ...prev, [field]: value }));
  };

  const handleContactChange = (key, value) => {
    setHealthData(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [key]: value,
      },
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Dati di Salute</h2>

      {/* Gruppo sanguigno */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <label className="block text-sm font-semibold text-blue-900 mb-2">Gruppo Sanguigno</label>
        <select
          value={healthData.bloodType}
          onChange={e => handleChange('bloodType', e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        >
          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Contatto emergenza */}
      <div className="bg-red-50 p-6 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-red-900">Contatto di Emergenza</h3>
        {['name', 'phone', 'relationship'].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium capitalize mb-1">{field}</label>
            <input
              type="text"
              value={healthData.emergencyContact[field]}
              onChange={e => handleContactChange(field, e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        ))}
      </div>

      {/* Allergie */}
      <div className="bg-yellow-50 p-6 rounded-lg space-y-2">
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">Allergie</h3>
        {healthData.allergies.map((allergy, idx) => (
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
              onClick={() => handleChange('allergies', healthData.allergies.filter((_, i) => i !== idx))}
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
        {healthData.conditions.map((condition, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="text"
              value={condition}
              onChange={(e) => {
                const updated = [...healthData.conditions];
                updated[idx] = e.target.value;
                handleChange('conditions', updated);
              }}
              className="flex-1 px-3 py-2 border rounded-lg"
            />
            <button
              onClick={() => handleChange('conditions', healthData.conditions.filter((_, i) => i !== idx))}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={() => handleChange('conditions', [...healthData.conditions, ''])}
          className="text-sm text-purple-700 hover:text-purple-900 mt-2"
        >
          + Aggiungi condizione
        </button>
      </div>
    </div>
  );
}

export default HealthTab;
