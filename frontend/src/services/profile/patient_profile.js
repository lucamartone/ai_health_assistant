import api from '../../hooks/useApi';

export async function register(name, surname, email, password, sex, birthDate){
  const data = { name, surname, email, password, sex, birth_date: birthDate };
  return await api.post('/profile/patient/register', data, { skipRefresh: true });
};

export async function login(email, password){
  const data = { email, password };
  return await api.post('/profile/patient/login', data, { skipRefresh: true });
};

export async function getDoctors(patientId){
  return await api.get(`/patient/doctors/patient_doctors?patient_id=${patientId}`);
};

export async function editProfile(name, surname, phone, email, profile_img){
  const data = { name, surname, phone, email, profile_img };
  return await api.post('/profile/patient/edit_profile', data, { skipRefresh: false }); // opzionale
};

export async function getStats(patientId){
  return await api.get(`/profile/patient/get_stats?patient_id=${patientId}`);
};



