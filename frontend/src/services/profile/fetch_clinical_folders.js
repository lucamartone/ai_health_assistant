import api from '../../hooks/useApi';

// Ottieni la lista dei pazienti di un dottore
export const fetchDoctorPatients = async (doctorId) => {
  return api.get(`/doctor/clinical_folders/patients/${doctorId}`);
};

// Ottieni la cartella clinica completa di un paziente
export const fetchClinicalFolder = async (patientId) => {
  return api.get(`/doctor/clinical_folders/patient/${patientId}`);
};

// Crea un nuovo record medico
export const createMedicalRecord = async (data, doctorId) => {
  return api.post(`/doctor/clinical_folders/medical-records?doctor_id=${doctorId}`, data);
};

// Aggiorna un record medico
export const updateMedicalRecord = async (recordId, data) => {
  return api.put(`/doctor/clinical_folders/medical-records/${recordId}`, data);
};

// Crea una nuova prescrizione
export const createPrescription = async (data) => {
  return api.post(`/doctor/clinical_folders/prescriptions`, data);
};

// Aggiorna una prescrizione
export const updatePrescription = async (prescriptionId, data) => {
  return api.put(`/doctor/clinical_folders/prescriptions/${prescriptionId}`, data);
};

// Aggiungi un documento medico (solo metadati)
export const createMedicalDocument = async (data, doctorId) => {
  return api.post(`/doctor/clinical_folders/documents?doctor_id=${doctorId}`, data);
};

// Upload reale di un documento medico
export const uploadMedicalDocument = async (formData) => {
  return api.post(`/doctor/clinical_folders/upload-document`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// Elimina un documento medico
export const deleteMedicalDocument = async (documentId) => {
  return api.delete(`/doctor/clinical_folders/documents/${documentId}`);
}; 