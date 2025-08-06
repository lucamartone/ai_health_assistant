import api from '../../hooks/useApi';

export async function editProfile(name, surname, phone, email, profile_img, specialization, addresses){
  const data = { name, surname, phone, email, profile_img, specialization, addresses };
  return await api.post('/profile/doctor/edit_profile', data);
};

export async function register(name, surname, email, password, sex, locations, specialization){
  const data = { name, surname, email, password, sex, locations, specialization };
  return await api.post('/profile/doctor/register', data, { skipRefresh: true });
};

export async function login(email, password){
  const data = { email, password };
  return await api.post('/profile/doctor/login', data, { skipRefresh: true });
};
