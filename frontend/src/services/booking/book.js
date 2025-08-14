import api from '../../hooks/useApi';

export async function getAllDoctors(){
  return await api.get('/patient/doctors/get_all_doctors');
};

export async function getFreeDoctors() {
  return await api.get('/patient/doctors/get_free_doctors');
};

export async function getFreeSlots(doctor_id, lat, lng){
  return await api.get(`/patient/appointments/get_free_slots?doctor_id=${doctor_id}&lat=${lat}&lng=${lng}`);
};

export async function bookAppointment(appointment_id, patient_id) {
  const data = { appointment_id, patient_id };
  return await api.post('/patient/appointments/book_appointment', data);
};
