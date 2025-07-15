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

export async function insertAppointment(dict) {
    const url = `${import.meta.env.VITE_BACKEND_URL}/doctor/appointments/insert_appointment`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dict)
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Errore inserimento appuntamento');
    }
    
    const data = await response.json();
    return data;
}

export async function removeAppointment(dict) {
    const url = `${import.meta.env.VITE_BACKEND_URL}/doctor/appointments/remove_appointment`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dict)
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Errore rimozione appuntamento');
    }
    
    const data = await response.json();
    return data;
}

export async function reload() {
    const url = `${import.meta.env.VITE_BACKEND_URL}/doctor/appointments/reload`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Errore ricaricamento appuntamenti');
    }
    
    const data = await response.json();
    return data;
}

export async function get_booked_appointments(id_patient) {
    const url = `${import.meta.env.VITE_BACKEND_URL}/patient/appointments/booked_appointments?patient_id=${id_patient}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json'
        }
    })
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Errore restituzione appuntamenti prenotati');
    }
    
    const data = await response.json();
    return data;
}

export async function getHistory(patient_id) {
    const url = `${import.meta.env.VITE_BACKEND_URL}/patient/appointments/history?patient_id=${patient_id}`;
    
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Errore recupero cronologia appuntamenti');
    }
    
    const data = await response.json();
    return data;
}