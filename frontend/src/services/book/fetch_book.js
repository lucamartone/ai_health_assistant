const BACKEND_URL = 'http://localhost:8001';

export async function getFreeDoctors() {
  const response = await fetch(`${BACKEND_URL}/patient/doctors/get_free_doctors`, {
    method: 'GET'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Errore recupero dottori');
  }
  const data = await response.json();
  return data;
}

export async function getFreeSlots(doctor_id, lat, lng) {
  const url = `${BACKEND_URL}/patient/appointments/get_free_slots?doctor_id=${doctor_id}&lat=${lat}&long=${lng}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Errore recupero slot disponibili');
  }

  const data = await response.json();
  return data;
}
