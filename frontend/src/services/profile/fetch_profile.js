export async function login(email, password) {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/profile/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // per inviare i cookie di sessione
    body: JSON.stringify({ 'email':email, 'password':password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Errore login');
  }

  const data = await response.json();
  return data.user;
};

export async function register(name, surname, email, password, sex) {
  const data = {name, surname, email, password, sex}
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/profile/user/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Errore registrazione');
  }

  return await response.json();
};

export async function logout(){
  try {
    await fetch('http://localhost:8001/profile/user/logout', {
      credentials: 'include',
    });
  } catch (error) {
    console.error('Errore logout:', error);
  }
};

export async function getProfile() {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/profile/user/profile`, {
    method: 'GET',
    credentials: 'include', // per inviare i cookie di sessione
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Errore recupero profilo');
  }

  return await response.json();
}