import api from '../../hooks/useApi';

export async function updateHealthData(patient_id, blood_type, allergies, chronic_conditions){
  const data = { patient_id, blood_type, allergies, chronic_conditions };
  return await api.post('/profile/patient/update_health_data', data);
};

export async function getHealthData(patient_id){
  return await api.get(`/profile/patient/get_health_data?patient_id=${patient_id}`);
};
