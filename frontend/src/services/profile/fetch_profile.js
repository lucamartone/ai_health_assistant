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

export async function me() {
  const response = await fetchWithRefresh(`${import.meta.env.VITE_BACKEND_URL}/profile/cookies/me`, {
    method: 'GET',
  });

  const data = await response.json();  // ✅ CONSUMA UNA SOLA VOLTA

  if (!response.ok) {
    throw new Error(data.detail || 'Errore recupero dati utente');
  }

  return data;
};

export async function changePassword(old_password, new_password, account_email) {
  const data = {old_password, new_password, account_email};
  const response = await fetchWithRefresh(`${import.meta.env.VITE_BACKEND_URL}/profile/account/change_password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    const err = new Error(errorData.detail || 'Errore cambio password');
    err.status = response.status;        // <-- codice HTTP
    err.detail = errorData.detail;       // <-- messaggio backend
    throw err;
  }

  return await response.json();
};

export async function fetchUpdatedAccount() {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/profile/cookies/me`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Errore nel recupero del profilo aggiornato');
  }

  const data = await response.json();
  return data.account;
};

export async function getProfile() {
  const response = await fetchWithRefresh(`${import.meta.env.VITE_BACKEND_URL}/profile/account/profile`, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Errore recupero profilo');
  }

  return await response.json();
};

export async function logout(){
  try {
    await fetchWithRefresh(`${import.meta.env.VITE_BACKEND_URL}/profile/account/logout`, {
      method: 'POST',
    }, false);
  } catch (error) {
    console.error('Errore logout:', error);
  }
};