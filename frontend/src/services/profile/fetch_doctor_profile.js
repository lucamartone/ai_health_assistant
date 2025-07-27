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

export async function editDoctorProfile(name, surname, phone, email, profile_img, specialization, addresses) {
 const data = {name, surname, phone, email, profile_img, specialization, addresses};
  const response = await fetchWithRefresh(`${import.meta.env.VITE_BACKEND_URL}/profile/doctor/edit_profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Errore aggiornamento profilo dottore');
    }
  
    return await response.json();
};

export async function register_doctor(name, surname, email, password, sex, locations, specialization) {
  const data = {name, surname, email, password, sex, locations, specialization}
  const response = await fetchWithRefresh(`${import.meta.env.VITE_BACKEND_URL}/profile/doctor/register`, {
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

export async function login_doctor(email, password) {
  const response = await fetchWithRefresh(`${import.meta.env.VITE_BACKEND_URL}/profile/doctor/login`, {
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