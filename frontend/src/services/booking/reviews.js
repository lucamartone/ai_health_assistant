import api from '../../hooks/useApi';

export async function getToRankAppointments(id_patient){
    return await api.get(`/patient/reviews/get_to_rank_appointments?id_patient=${id_patient}`);
};

export async function reviewAppointment(appointment_id, stars, report){
    const data = { appointment_id, stars, report };
    return await api.post('/patient/reviews/review_appointment', data);
};

export async function getPatientReviews(patient_id){
    return await api.get(`/patient/reviews/patient_reviews?patient_id=${patient_id}`);
};