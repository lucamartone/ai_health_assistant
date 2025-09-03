import api from '../../hooks/useApi';

export async function getToRankAppointments(patient_id){
    return await api.get(`/patient/reviews/appointments_to_rank?patient_id=${patient_id}`);
};

export async function reviewAppointment(appointment_id, stars, report){
    const data = { appointment_id, stars, report };
    return await api.post('/patient/reviews/review_appointment', data);
};

export async function getPatientReviews(patient_id){
    return await api.get(`/patient/reviews/patient_reviews?patient_id=${patient_id}`);
};