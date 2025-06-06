const BACKEND_URL = 'http://localhost:8001'; // cambia se usi Docker o ambiente diverso

export async function login(email, password) {
  const response = await fetch(`${BACKEND_URL}/profile/generic/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 'email':email, 'password':password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Errore login');
  }

  return await response.json();
}

export async function register(name, surname, email, password, sex) {
  const data = {name, surname, email, password, sex}
  const response = await fetch(`${BACKEND_URL}/profile/generic/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Errore registrazione');
  }

  return await response.json();
}
