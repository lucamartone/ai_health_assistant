export async function updateHealthData(patient_id, blood_type, allergies, chronic_conditions) {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/profile/patient/update_health_data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id, blood_type, allergies, chronic_conditions }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Errore nell\'aggiornamento dei dati sanitari');
    }

    return await response.json();
}

export async function getHealthData(patient_id) {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/profile/patient/get_health_data?patient_id=${patient_id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Errore nel recupero dei dati sanitari');
    }

    return await response.json();
}