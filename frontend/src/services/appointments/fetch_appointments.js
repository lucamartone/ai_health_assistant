export async function getAppointments(doctor_id) {
    const url = `${import.meta.env.VITE_BACKEND_URL}/doctor/appointments/get_appointments?doctor_id=${doctor_id}`;
    
    const response = await fetch(url, {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Errore recupero appuntamenti');
    }
    
    const data = await response.json();
    return data;
}

export async function getLocations(doctor_id) {
    const url = `${import.meta.env.VITE_BACKEND_URL}/doctor/appointments/get_locations?doctor_id=${doctor_id}`;
    
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Errore recupero sedi');
    }
    
    const data = await response.json();
    return data;
}