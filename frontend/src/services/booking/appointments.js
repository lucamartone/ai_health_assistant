import api from '../../hooks/useApi';

export async function getAppointments(doctor_id) {
    return await api.get(`/doctor/appointments/get_appointments?doctor_id=${doctor_id}`);
};

export async function getLocations(doctor_id) {
    return await api.get(`/doctor/appointments/get_locations?doctor_id=${doctor_id}`);
};

export async function insertAppointment(dict) {
    return await api.post('/doctor/appointments/insert_appointment', dict);
};

export async function removeAppointment(dict) {
    return await api.post('/doctor/appointments/remove_appointment', dict);
};

export async function reload() {
    return await api.get('/doctor/appointments/reload');
};

export async function get_booked_appointments(patient_id) {
    return await api.get(`/patient/appointments/get_booked_appointments?patient_id=${patient_id}`);
};

export async function getHistory(patient_id) {
    return await api.get(`/patient/appointments/get_history?patient_id=${patient_id}`);
};

export async function doctorGetBooked(doctor_id) {
    return await api.get(`/doctor/appointments/get_booked?doctor_id=${doctor_id}`);
};

export async function doctorGetHistory(doctor_id) {
    return await api.get(`/doctor/appointments/get_history_doctor?doctor_id=${doctor_id}`);
};

export async function generateSlots(payload) {
    return await api.post('/doctor/appointments/generate_slots', payload);
};

export async function clearSlots(payload) {
    return await api.post('/doctor/appointments/clear_slots', payload);
};