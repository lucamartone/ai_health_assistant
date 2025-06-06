const BACKEND_URL = 'http://localhost:8001'; // cambia se usi Docker o ambiente diverso

export async function login(email, password) {
  const response = await fetch(`${BACKEND_URL}/profile/generic/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Errore login');
  }

  return await response.json(); // ad es. token, utente, ecc.
}

export async function register(email, password) {
  const response = await fetch(`${BACKEND_URL}/profile/generic/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Errore registrazione');
  }

  return await response.json();
}
