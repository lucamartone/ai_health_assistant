import api from '../../hooks/useApi';

export async function getAllDoctors(){
  return await api.get('/patient/doctors/get_all_doctors');
};

export async function getRankedDoctors(params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.latitude !== undefined) queryParams.append('latitude', params.latitude);
  if (params.longitude !== undefined) queryParams.append('longitude', params.longitude);
  if (params.specialization) queryParams.append('specialization', params.specialization);
  if (params.minPrice !== undefined) queryParams.append('min_price', params.minPrice);
  if (params.maxPrice !== undefined) queryParams.append('max_price', params.maxPrice);
  if (params.sortBy) queryParams.append('sort_by', params.sortBy);
  if (params.limit) queryParams.append('limit', params.limit);
  
  return await api.get(`/patient/doctors/get_ranked_doctors?${queryParams.toString()}`);
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
