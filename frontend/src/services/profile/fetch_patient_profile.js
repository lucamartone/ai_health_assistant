// Funzione di utilità per gestire il refresh automatico del token
async function fetchWithRefresh(url, options = {}, retry = true) {
  let response = await fetch(url, { ...options, credentials: 'include' });
  if (response.status === 401 && retry) {
    // Prova a rinnovare il token
    const refreshRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/profile/cookies/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (refreshRes.ok) {
      // Riprova la richiesta originale una sola volta
      response = await fetch(url, { ...options, credentials: 'include' });
    } else {
      throw new Error('Sessione scaduta. Effettua di nuovo il login.');
    }
  }
  return response;
};

export async function login_patient(email, password) {
  const response = await fetchWithRefresh(`${import.meta.env.VITE_BACKEND_URL}/profile/patient/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 'email':email, 'password':password }),
  }, false); // il login non deve mai tentare il refresh

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Errore login');
  }

  const data = await response.json();
  return data;
};

export async function register_patient(name, surname, email, password, sex) {
  const data = {name, surname, email, password, sex}
  const response = await fetchWithRefresh(`${import.meta.env.VITE_BACKEND_URL}/profile/patient/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }, false); // la registrazione non deve tentare il refresh

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Errore registrazione');
  }

  return await response.json();
};

export async function getPatientDoctors(patientId) {
  const response = await fetchWithRefresh(`${import.meta.env.VITE_BACKEND_URL}/profile/patient/doctors/patient_doctors?patient_id=${patientId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Errore recupero dottori');
  }

  return await response.json();
};

export async function editPatientProfile(name, surname, phone, email, profile_img) {
  const data = {name, surname, phone, email, profile_img};
  const response = await fetchWithRefresh(`${import.meta.env.VITE_BACKEND_URL}/profile/patient/edit_profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }, false);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Errore registrazione');
  }

  return await response.json();
};

export async function getPatientStatistics(accountId) {
  const baseUrl = import.meta.env.VITE_BACKEND_URL;

  const endpoints = {
    numberOfPendingAppointments: `/profile/patient/number_of_pending_appointments?patient_id=${accountId}`,
    numberOfCompletedAppointments: `/profile/patient/number_of_completed_appointments?patient_id=${accountId}`,
    numberOfAppointments: `/profile/patient/number_of_appointments?patient_id=${accountId}`,
    numberOfDoctorsVisited: `/profile/patient/number_of_doctors_visited?patient_id=${accountId}`,
    lastVisitDate: `/profile/patient/last_visit_date?patient_id=${accountId}`,
  };

  try {
    const results = await Promise.all(
      Object.entries(endpoints).map(async ([key, endpoint]) => {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || `Errore nel recupero di ${key}`);
        }

        const data = await response.json();
        return [key, key === 'lastVisitDate' ? data.last_visit_date : data.count];
      })
    );

    return Object.fromEntries(results);
  } catch (error) {
    console.error('Errore nel recupero delle statistiche del paziente:', error);
    throw error;
  }
};


