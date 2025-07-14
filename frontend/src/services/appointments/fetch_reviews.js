export async function getToRankAppointments(id_patient) {
    const url = `${import.meta.env.VITE_BACKEND_URL}/patient/reviews/appointments_to_rank?patient_id=${id_patient}`;
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
    
    return await response.json();
}

export async function reviewAppointment(appointment_id, stars, report) {
    const data = { appointment_id, stars, report};
    const url = `${import.meta.env.VITE_BACKEND_URL}/patient/reviews/review_appointment`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Errore invio valutazione');
    }
    
    return await response.json();
}