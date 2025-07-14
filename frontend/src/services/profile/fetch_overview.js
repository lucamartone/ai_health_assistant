export async function NumberOfPendingAppointments(accountId) {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/profile/patient/number_of_pending_appointments?patient_id=${accountId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Errore nel recupero degli appuntamenti in attesa');
    }

    const data = await response.json();
    return data.count;
}

export async function NumberOfCompletedAppointments(accountId) {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/profile/patient/number_of_completed_appointments?patient_id=${accountId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Errore nel recupero degli appuntamenti completati');
    }

    const data = await response.json();
    return data.count;
}

export async function NumberOfAppointments(accountId) {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/profile/patient/number_of_appointments?patient_id=${accountId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Errore nel recupero del numero totale di appuntamenti');
    }

    const data = await response.json();
    return data.count;
}

export async function NumberOfDoctorsVisited(accountId) {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/profile/patient/number_of_doctors_visited?patient_id=${accountId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Errore nel recupero del numero di dottori visitati');
    }

    const data = await response.json();
    return data.count;
}

export async function LastVisitDate(accountId) {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/profile/patient/last_visit_date?patient_id=${accountId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Errore nel recupero della data dell\'ultima visita');
    }

    const data = await response.json();
    return data.last_visit_date;
}