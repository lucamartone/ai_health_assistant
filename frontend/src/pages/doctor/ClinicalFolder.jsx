import React, { useEffect, useState } from 'react';
import { fetchClinicalFolder, createMedicalRecord, createMedicalDocument, uploadMedicalDocument, downloadMedicalDocument, createPrescription, getPrescriptionsForRecord } from '../../services/profile/clinical_folders';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FolderOpen, User, FileText, Upload, ArrowLeft, Plus, Stethoscope, Download, Pill, ChevronDown } from 'lucide-react';

const ClinicalFolder = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { account } = useAuth();
  const [folder, setFolder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    symptoms: '',
    diagnosis: '',
    treatment_plan: '',
    notes: '',
    vital_signs: {
      blood_pressure: '',
      temperature: '',
      heart_rate: '',
      respiratory_rate: '',
      weight: '',
      height: ''
    }
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  // Form documento
  const [docForm, setDocForm] = useState({
    document_type: '',
    title: '',
    description: ''
  });
  const [docFile, setDocFile] = useState(null);
  const [docFormLoading, setDocFormLoading] = useState(false);
  const [docFormError, setDocFormError] = useState(null);
  const [downloadingDoc, setDownloadingDoc] = useState(null);

  // Form prescrizione
  const [prescriptionForm, setPrescriptionForm] = useState({
    medical_record_id: '',
    medication_name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  });
  const [prescriptionFormLoading, setPrescriptionFormLoading] = useState(false);
  const [prescriptionFormError, setPrescriptionFormError] = useState(null);
  const [prescriptions, setPrescriptions] = useState({}); // { record_id: [prescriptions] }

  // Gestione tab e form collassabili
  const [activeTab, setActiveTab] = useState('records'); // 'records', 'documents', 'prescriptions'
  const [collapsedForms, setCollapsedForms] = useState({
    medicalRecord: false,
    document: false,
    prescription: false
  });

  const toggleForm = (formName) => {
    setCollapsedForms(prev => ({
      ...prev,
      [formName]: !prev[formName]
    }));
  };

  const loadFolder = async () => {
    setLoading(true);
    try {
      const res = await fetchClinicalFolder(patientId);
      console.log('DEBUG: Cartella clinica caricata:', res);
      console.log('DEBUG: Record medici:', res.medical_records);
      console.log('DEBUG: Numero record medici:', res.medical_records?.length);
      console.log('DEBUG: Documenti:', res.documents);
      console.log('DEBUG: Numero documenti:', res.documents?.length);
      console.log('DEBUG: Tipo di medical_records:', typeof res.medical_records);
      console.log('DEBUG: È un array?', Array.isArray(res.medical_records));
      setFolder(res);
    } catch (err) {
      console.error('DEBUG: Errore caricamento cartella:', err);
      console.error('DEBUG: Response error:', err.response?.data);
      setError('Errore nel caricamento della cartella clinica');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      console.log('DEBUG: useEffect triggered with patientId:', patientId);
      loadFolder();
    }
  }, [patientId]);

  const handleFormChange = e => {
    const { name, value } = e.target;
    
    // Se il campo è un vital sign, aggiorna l'oggetto vital_signs
    if (['blood_pressure', 'temperature', 'heart_rate', 'respiratory_rate', 'weight', 'height'].includes(name)) {
      setForm(prev => ({
        ...prev,
        vital_signs: {
          ...prev.vital_signs,
          [name]: value
        }
      }));
    } else {
      // Altrimenti aggiorna il campo normale
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFormSubmit = async e => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      console.log('DEBUG: Invio record medico:', form);
      console.log('DEBUG: Patient ID:', patientId);
      console.log('DEBUG: Doctor ID:', account?.id);
      
      // Gestione vital signs - rimuovi i campi vuoti
      let vitalSigns = undefined;
      if (form.vital_signs) {
        const nonEmptyVitalSigns = {};
        Object.entries(form.vital_signs).forEach(([key, value]) => {
          if (value && value.trim() !== '') {
            nonEmptyVitalSigns[key] = value.trim();
          }
        });
        
        // Solo se ci sono campi non vuoti, usa vitalSigns
        if (Object.keys(nonEmptyVitalSigns).length > 0) {
          vitalSigns = nonEmptyVitalSigns;
        }
      }
      
      const recordData = {
        patient_id: parseInt(patientId),
        symptoms: form.symptoms,
        diagnosis: form.diagnosis,
        treatment_plan: form.treatment_plan,
        notes: form.notes,
        vital_signs: vitalSigns
      };
      
      console.log('DEBUG: Dati record da inviare:', recordData);
      console.log('DEBUG: Vital signs da inviare:', vitalSigns);
      console.log('DEBUG: Tipo di vital signs:', typeof vitalSigns);
      
      const result = await createMedicalRecord(recordData, account?.id);
      console.log('DEBUG: Record medico creato:', result);
      
      setForm({ symptoms: '', diagnosis: '', treatment_plan: '', notes: '', vital_signs: { blood_pressure: '', temperature: '', heart_rate: '', respiratory_rate: '', weight: '', height: '' } });
      console.log('DEBUG: Form resettato, ora ricarico la cartella...');
      await loadFolder();
      console.log('DEBUG: Cartella ricaricata dopo creazione record');
    } catch (err) {
      console.error('DEBUG: Errore creazione record:', err);
      console.error('DEBUG: Response error:', err.response?.data);
      setFormError('Errore durante il salvataggio. Controlla i dati inseriti.');
    } finally {
      setFormLoading(false);
    }
  };

  // Gestione form documento
  const handleDocFormChange = e => {
    setDocForm({ ...docForm, [e.target.name]: e.target.value });
  };
  const handleDocFileChange = e => {
    const file = e.target.files[0];
    setDocFile(file);
    // Reset error when user selects a new file
    if (docFormError) {
      setDocFormError(null);
    }
  };

  const handleDocFormSubmit = async e => {
    e.preventDefault();
    setDocFormLoading(true);
    setDocFormError(null);
    try {
      // Validazione campi obbligatori
      if (!docFile) throw new Error('Seleziona un file');
      if (!docForm.document_type) throw new Error('Seleziona il tipo di documento');
      if (!docForm.title.trim()) throw new Error('Inserisci il titolo del documento');
      
      console.log('DEBUG: Inizio upload documento');
      console.log('DEBUG: File selezionato:', docFile);
      console.log('DEBUG: Dati form:', docForm);
      
      const formData = new FormData();
      formData.append('patient_id', patientId);
      formData.append('doctor_id', account?.id);
      formData.append('document_type', docForm.document_type);
      formData.append('title', docForm.title.trim());
      formData.append('description', docForm.description.trim());
      formData.append('file', docFile);
      
      console.log('DEBUG: FormData creato, elementi:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }
      
      const result = await uploadMedicalDocument(formData);
      console.log('DEBUG: Upload completato:', result);
      
      setDocForm({ document_type: '', title: '', description: '' });
      setDocFile(null);
      await loadFolder();
    } catch (err) {
      console.error('DEBUG: Errore dettagliato upload:', err);
      console.error('DEBUG: Response error:', err.response?.data);
      console.error('DEBUG: Status:', err.response?.status);
      
      let errorMessage = 'Errore durante il salvataggio. ';
      if (err.response?.data?.detail) {
        errorMessage += err.response.data.detail;
      } else if (err.message) {
        errorMessage += err.message;
      } else {
        errorMessage += 'Controlla i dati inseriti.';
      }
      
      setDocFormError(errorMessage);
      
      // Reset file input per permettere all'utente di riprovare
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.value = '';
      }
    } finally {
      setDocFormLoading(false);
    }
  };

  // Gestione download documento
  const handleDownloadDocument = async (documentId, fileName) => {
    setDownloadingDoc(documentId);
    try {
      const blob = await downloadMedicalDocument(documentId);
      
      // Crea un link temporaneo per il download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'documento.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Errore nel download:', error);
      alert('Errore nel download del documento');
    } finally {
      setDownloadingDoc(null);
    }
  };

  // Gestione prescrizioni
  const handlePrescriptionFormChange = e => {
    setPrescriptionForm({ ...prescriptionForm, [e.target.name]: e.target.value });
  };

  const handlePrescriptionFormSubmit = async e => {
    e.preventDefault();
    setPrescriptionFormLoading(true);
    setPrescriptionFormError(null);
    try {
      console.log('DEBUG: Invio prescrizione:', prescriptionForm);
      
      const prescriptionData = {
        medical_record_id: parseInt(prescriptionForm.medical_record_id),
        medication_name: prescriptionForm.medication_name,
        dosage: prescriptionForm.dosage,
        frequency: prescriptionForm.frequency,
        duration: prescriptionForm.duration || undefined,
        instructions: prescriptionForm.instructions || undefined
      };
      
      console.log('DEBUG: Dati prescrizione da inviare:', prescriptionData);
      
      const result = await createPrescription(prescriptionData);
      console.log('DEBUG: Prescrizione creata:', result);
      
      // Reset form
      setPrescriptionForm({
        medical_record_id: '',
        medication_name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      });
      
      // Ricarica le prescrizioni per questo record
      await loadPrescriptionsForRecord(parseInt(prescriptionForm.medical_record_id));
      
    } catch (err) {
      console.error('DEBUG: Errore creazione prescrizione:', err);
      console.error('DEBUG: Response error:', err.response?.data);
      setPrescriptionFormError('Errore durante il salvataggio. Controlla i dati inseriti.');
    } finally {
      setPrescriptionFormLoading(false);
    }
  };

  const loadPrescriptionsForRecord = async (recordId) => {
    try {
      const res = await getPrescriptionsForRecord(recordId);
      setPrescriptions(prev => ({
        ...prev,
        [recordId]: res.prescriptions || []
      }));
    } catch (err) {
      console.error('DEBUG: Errore caricamento prescrizioni per record', recordId, ':', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 pt-20">
        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-blue-800 mb-2">Caricamento Cartella Clinica</h2>
            <p className="text-blue-600">Stiamo recuperando i dati del paziente...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-red-100 to-red-200 pt-20">
        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="text-red-500 mb-6">
              <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-red-800 mb-4">Errore di Caricamento</h3>
            <p className="text-red-700 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Riprova
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200 pt-20">
        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="text-yellow-500 mb-6">
              <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-yellow-800 mb-4">Nessuna Cartella Trovata</h3>
            <p className="text-yellow-700 mb-6">La cartella clinica per questo paziente non esiste.</p>
            <button 
              onClick={() => navigate('/doctor/patients')}
              className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors font-medium"
            >
              Torna ai Pazienti
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            <div className="flex flex-col items-center text-center lg:text-left">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-4">
                <User className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Cartella Clinica</h1>
              <p className="text-lg text-blue-600 font-medium">
                {folder.patient_name} {folder.patient_surname}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                {folder.patient_sex && (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                    {folder.patient_sex === 'M' ? 'Maschio' : 'Femmina'}
                  </span>
                )}
                <span className="text-gray-500">
                  ID: {folder.patient_id}
                </span>
              </div>
            </div>

            {/* Statistiche rapide */}
            <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">
                  {folder.medical_records?.length || 0}
                </div>
                <div className="text-sm opacity-90">Record Medici</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">
                  {folder.prescriptions?.length || 0}
                </div>
                <div className="text-sm opacity-90">Prescrizioni</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">
                  {folder.documents?.length || 0}
                </div>
                <div className="text-sm opacity-90">Documenti</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">
                  {new Date(folder.created_at).toLocaleDateString('it-IT')}
                </div>
                <div className="text-sm opacity-90">Data Creazione</div>
              </div>
            </div>
          </div>

          {/* Pulsante torna indietro */}
          <div className="mt-6 flex justify-center lg:justify-start">
            <button 
              onClick={() => navigate('/doctor/patients')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Torna ai Pazienti
            </button>
          </div>
        </motion.div>

        {/* Contenuto principale */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-8 lg:grid-cols-3"
        >
          {/* Colonna sinistra - Form e Controlli */}
          <div className="lg:col-span-1 space-y-4">
            {/* Tab Navigation */}
            <div className="bg-white rounded-2xl shadow-xl p-4">
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('records')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'records'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Stethoscope className="w-4 h-4 inline mr-2" />
                  Record
                </button>
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'documents'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  Documenti
                </button>
                <button
                  onClick={() => setActiveTab('prescriptions')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'prescriptions'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Pill className="w-4 h-4 inline mr-2" />
                  Prescrizioni
                </button>
              </div>
            </div>

            {/* Form Record Medico */}
            {activeTab === 'records' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleForm('medicalRecord')}
                  className="w-full px-6 py-4 bg-blue-600 text-white flex items-center justify-between hover:bg-blue-700 transition-colors"
                >
                  <span className="font-semibold flex items-center gap-2">
                    <Stethoscope className="w-5 h-5" />
                    Nuovo Record Medico
                  </span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${collapsedForms.medicalRecord ? 'rotate-180' : ''}`} />
                </button>
                
                {!collapsedForms.medicalRecord && (
                  <div className="p-6">
                    {formError && (
                      <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                        {formError}
                      </div>
                    )}

                    <form onSubmit={handleFormSubmit} className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Sintomi</label>
                        <textarea
                          name="symptoms"
                          value={form.symptoms}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          rows="2"
                          placeholder="Descrivi i sintomi"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Diagnosi</label>
                        <textarea
                          name="diagnosis"
                          value={form.diagnosis}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          rows="2"
                          placeholder="Inserisci la diagnosi"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Trattamento</label>
                        <textarea
                          name="treatment_plan"
                          value={form.treatment_plan}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          rows="2"
                          placeholder="Piano di trattamento"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Note</label>
                        <textarea
                          name="notes"
                          value={form.notes}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          rows="2"
                          placeholder="Note aggiuntive"
                        />
                      </div>

                      {/* Segni Vitali in griglia compatta */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Segni Vitali</label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <input
                              type="text"
                              name="blood_pressure"
                              value={form.vital_signs.blood_pressure}
                              onChange={handleFormChange}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              placeholder="Pressione"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              name="temperature"
                              value={form.vital_signs.temperature}
                              onChange={handleFormChange}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              placeholder="Temperatura"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              name="heart_rate"
                              value={form.vital_signs.heart_rate}
                              onChange={handleFormChange}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              placeholder="Freq. Cardiaca"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              name="respiratory_rate"
                              value={form.vital_signs.respiratory_rate}
                              onChange={handleFormChange}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              placeholder="Freq. Respiratoria"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              name="weight"
                              value={form.vital_signs.weight}
                              onChange={handleFormChange}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              placeholder="Peso"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              name="height"
                              value={form.vital_signs.height}
                              onChange={handleFormChange}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              placeholder="Altezza"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={formLoading}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                      >
                        {formLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Salvataggio...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Aggiungi Record
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </motion.div>
            )}

            {/* Form Documento */}
            {activeTab === 'documents' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleForm('document')}
                  className="w-full px-6 py-4 bg-green-600 text-white flex items-center justify-between hover:bg-green-700 transition-colors"
                >
                  <span className="font-semibold flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Carica Documento
                  </span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${collapsedForms.document ? 'rotate-180' : ''}`} />
                </button>
                
                {!collapsedForms.document && (
                  <div className="p-6">
                    {docFormError && (
                      <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                        {docFormError}
                      </div>
                    )}

                    <form onSubmit={handleDocFormSubmit} className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo Documento</label>
                        <select
                          name="document_type"
                          value={docForm.document_type}
                          onChange={handleDocFormChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        >
                          <option value="">Seleziona tipo</option>
                          <option value="referto">Referto</option>
                          <option value="esame">Esame</option>
                          <option value="certificato">Certificato</option>
                          <option value="altro">Altro</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Titolo</label>
                        <input
                          type="text"
                          name="title"
                          value={docForm.title}
                          onChange={handleDocFormChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                          placeholder="Titolo del documento"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Descrizione</label>
                        <textarea
                          name="description"
                          value={docForm.description}
                          onChange={handleDocFormChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                          rows="2"
                          placeholder="Descrizione del documento"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">File</label>
                        <input
                          type="file"
                          onChange={handleDocFileChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={docFormLoading}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                      >
                        {docFormLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Caricamento...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Carica Documento
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </motion.div>
            )}

            {/* Form Prescrizione */}
            {activeTab === 'prescriptions' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleForm('prescription')}
                  className="w-full px-6 py-4 bg-purple-600 text-white flex items-center justify-between hover:bg-purple-700 transition-colors"
                >
                  <span className="font-semibold flex items-center gap-2">
                    <Pill className="w-5 h-5" />
                    Nuova Prescrizione
                  </span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${collapsedForms.prescription ? 'rotate-180' : ''}`} />
                </button>
                
                {!collapsedForms.prescription && (
                  <div className="p-6">
                    {prescriptionFormError && (
                      <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                        {prescriptionFormError}
                      </div>
                    )}

                    <form onSubmit={handlePrescriptionFormSubmit} className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Record Medico</label>
                        <select
                          name="medical_record_id"
                          value={prescriptionForm.medical_record_id}
                          onChange={handlePrescriptionFormChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                          required
                        >
                          <option value="">Seleziona record medico</option>
                          {folder?.medical_records?.map(record => (
                            <option key={record.id} value={record.id}>
                              {new Date(record.record_date).toLocaleDateString('it-IT')} - {record.diagnosis || 'Nessuna diagnosi'}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nome Farmaco</label>
                        <input
                          type="text"
                          name="medication_name"
                          value={prescriptionForm.medication_name}
                          onChange={handlePrescriptionFormChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                          placeholder="Nome del farmaco"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Dosaggio</label>
                          <input
                            type="text"
                            name="dosage"
                            value={prescriptionForm.dosage}
                            onChange={handlePrescriptionFormChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                            placeholder="es. 500mg"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Frequenza</label>
                          <input
                            type="text"
                            name="frequency"
                            value={prescriptionForm.frequency}
                            onChange={handlePrescriptionFormChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                            placeholder="es. 2x/giorno"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Durata</label>
                        <input
                          type="text"
                          name="duration"
                          value={prescriptionForm.duration}
                          onChange={handlePrescriptionFormChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                          placeholder="es. 7 giorni"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Istruzioni</label>
                        <textarea
                          name="instructions"
                          value={prescriptionForm.instructions}
                          onChange={handlePrescriptionFormChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                          rows="2"
                          placeholder="Istruzioni per l'assunzione"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={prescriptionFormLoading}
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                      >
                        {prescriptionFormLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Salvataggio...
                          </>
                        ) : (
                          <>
                            <Pill className="w-4 h-4" />
                            Aggiungi Prescrizione
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Colonna destra - Visualizzazione dati */}
          <div className="lg:col-span-2 space-y-6">
            {/* Record medici */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Record Medici ({folder.medical_records?.length || 0})
              </h3>
              
              <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto">
                {folder.medical_records?.length > 0 ? (
                  folder.medical_records.map((record, index) => {
                    console.log('DEBUG: Rendering record:', record);
                    return (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-sm">#{index + 1}</span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">Record Medico</h4>
                              <p className="text-sm text-gray-500">
                                {new Date(record.record_date).toLocaleDateString('it-IT')} • Dr. {record.doctor_name} {record.doctor_surname}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {record.symptoms && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">Sintomi:</span>
                              <p className="text-sm text-gray-600 mt-1">{record.symptoms}</p>
                            </div>
                          )}
                          
                          {record.diagnosis && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">Diagnosi:</span>
                              <p className="text-sm text-gray-600 mt-1">{record.diagnosis}</p>
                            </div>
                          )}
                          
                          {record.treatment_plan && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">Trattamento:</span>
                              <p className="text-sm text-gray-600 mt-1">{record.treatment_plan}</p>
                            </div>
                          )}
                          
                          {record.notes && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">Note:</span>
                              <p className="text-sm text-gray-600 mt-1">{record.notes}</p>
                            </div>
                          )}
                        </div>
                        
                        {record.vital_signs && Object.keys(record.vital_signs).length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <span className="text-sm font-medium text-gray-700 mb-2 block">Segni Vitali:</span>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {Object.entries(record.vital_signs).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-sm bg-white px-2 py-1 rounded border">
                                  <span className="text-gray-600 capitalize">
                                    {key === 'blood_pressure' ? 'Pressione' :
                                     key === 'heart_rate' ? 'Freq. Cardiaca' :
                                     key === 'respiratory_rate' ? 'Freq. Respiratoria' :
                                     key === 'temperature' ? 'Temperatura' :
                                     key === 'weight' ? 'Peso' :
                                     key === 'height' ? 'Altezza' : key}:
                                  </span>
                                  <span className="text-gray-800 font-medium">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Prescrizioni */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                              <Pill className="w-4 h-4" />
                              Prescrizioni
                            </span>
                            <button
                              onClick={() => loadPrescriptionsForRecord(record.id)}
                              className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                            >
                              Carica Prescrizioni
                            </button>
                          </div>
                          
                          {prescriptions[record.id] ? (
                            prescriptions[record.id].length > 0 ? (
                              <div className="space-y-2">
                                {prescriptions[record.id].map((prescription, pIndex) => (
                                  <div key={pIndex} className="bg-green-50 rounded p-2 border border-green-200">
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <h5 className="font-medium text-green-800 text-sm">{prescription.medication_name}</h5>
                                        <p className="text-xs text-green-600">
                                          {prescription.dosage} - {prescription.frequency}
                                          {prescription.duration && ` - ${prescription.duration}`}
                                        </p>
                                        {prescription.instructions && (
                                          <p className="text-xs text-green-600 mt-1">{prescription.instructions}</p>
                                        )}
                                        <p className="text-xs text-green-500 mt-1">
                                          Prescritta: {new Date(prescription.prescribed_date).toLocaleDateString('it-IT')}
                                        </p>
                                      </div>
                                      <span className={`text-xs px-2 py-1 rounded ${
                                        prescription.is_active 
                                          ? 'bg-green-100 text-green-700' 
                                          : 'bg-gray-100 text-gray-600'
                                      }`}>
                                        {prescription.is_active ? 'Attiva' : 'Non attiva'}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500">Nessuna prescrizione</p>
                            )
                          ) : (
                            <p className="text-xs text-gray-500">Clicca per caricare le prescrizioni</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Nessun record medico presente</p>
                    <p className="text-sm mt-2">DEBUG: folder.medical_records = {JSON.stringify(folder.medical_records)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Documenti medici */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                Documenti ({folder.documents?.length || 0})
              </h3>
              
              <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
                {folder.documents?.length > 0 ? (
                  folder.documents.map((doc, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                              <FileText className="w-3 h-3 text-blue-600" />
                            </div>
                            <h4 className="font-medium text-gray-900 truncate">{doc.title}</h4>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">{doc.document_type}</span>
                            <span>Caricato: {new Date(doc.uploaded_at).toLocaleDateString('it-IT')}</span>
                            {doc.file_size && (
                              <span>{(doc.file_size / 1024).toFixed(1)} KB</span>
                            )}
                          </div>
                          {doc.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">{doc.description}</p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 ml-3">
                          {doc.download_url && (
                            <button 
                              onClick={() => handleDownloadDocument(doc.id, doc.title)}
                              disabled={downloadingDoc === doc.id}
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                              {downloadingDoc === doc.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                                  Download...
                                </>
                              ) : (
                                <>
                                  <Download className="w-3 h-3" />
                                  Scarica
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Nessun documento presente</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ClinicalFolder; 