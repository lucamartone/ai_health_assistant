import { useState } from 'react';

function PreferencesTab() {
  const [notifications, setNotifications] = useState({
    reminders: true,
    testResults: true,
    newsletter: false,
  });

  const [privacy, setPrivacy] = useState({
    shareWithDoctors: true,
    publicProfile: false,
  });

  const handleNotifChange = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePrivacyChange = (key) => {
    setPrivacy((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Preferenze</h2>

      {/* Notifiche */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifiche</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={notifications.reminders}
              onChange={() => handleNotifChange('reminders')}
            />
            <span>Promemoria appuntamenti</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={notifications.testResults}
              onChange={() => handleNotifChange('testResults')}
            />
            <span>Notifiche risultati esami</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={notifications.newsletter}
              onChange={() => handleNotifChange('newsletter')}
            />
            <span>Newsletter salute</span>
          </label>
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={privacy.shareWithDoctors}
              onChange={() => handlePrivacyChange('shareWithDoctors')}
            />
            <span>Condividi dati con i medici</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={privacy.publicProfile}
              onChange={() => handlePrivacyChange('publicProfile')}
            />
            <span>Profilo pubblico visibile</span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default PreferencesTab;
