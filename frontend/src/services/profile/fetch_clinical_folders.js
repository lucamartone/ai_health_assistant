import api from '../../hooks/useApi';

// Ottieni la lista dei pazienti di un dottore
export const fetchDoctorPatients = async (doctorId) => {
  return api.get(`/clinical-folders/patients/${doctorId}`);
};

// Ottieni la cartella clinica completa di un paziente
export const fetchClinicalFolder = async (patientId) => {
  return api.get(`/clinical-folders/patient/${patientId}`);
};

// Crea un nuovo record medico
export const createMedicalRecord = async (data, doctorId) => {
  return api.post(`/clinical-folders/medical-records?doctor_id=${doctorId}`, data);
};

// Aggiorna un record medico
export const updateMedicalRecord = async (recordId, data) => {
  return api.put(`/clinical-folders/medical-records/${recordId}`, data);
};

// Crea una nuova prescrizione
export const createPrescription = async (data) => {
  return api.post(`/clinical-folders/prescriptions`, data);
};

// Aggiorna una prescrizione
export const updatePrescription = async (prescriptionId, data) => {
  return api.put(`/clinical-folders/prescriptions/${prescriptionId}`, data);
};

// Aggiungi un documento medico (solo metadati)
export const createMedicalDocument = async (data, doctorId) => {
  return api.post(`/clinical-folders/documents?doctor_id=${doctorId}`, data);
};

// Upload reale di un documento medico
export const uploadMedicalDocument = async (formData) => {
  return api.post(`/clinical-folders/upload-document`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// Elimina un documento medico
export const deleteMedicalDocument = async (documentId) => {
  return api.delete(`/clinical-folders/documents/${documentId}`);
}; 