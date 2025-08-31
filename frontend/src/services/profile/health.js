import api from '../../hooks/useApi';

export async function updateHealthData(patient_id, blood_type, allergies, chronic_conditions){
  const data = { patient_id, blood_type, allergies, chronic_conditions };
  return await api.post('/profile/patient/update_health_data', data);
};

export async function getHealthData(patient_id){
  return await api.get(`/profile/patient/get_health_data?patient_id=${patient_id}`);
};

export async function getPatientHealthProfile(patient_id){
  console.log('🔍 getPatientHealthProfile chiamato con patient_id:', patient_id);
  try {
    const result = await api.get(`/patient/appointments/get_patient_health_profile?patient_id=${patient_id}`);
    console.log('✅ getPatientHealthProfile risultato:', result);
    return result;
  } catch (error) {
    console.error('❌ getPatientHealthProfile errore:', error);
    throw error;
  }
};
