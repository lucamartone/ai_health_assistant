import React, { useEffect, useState } from 'react';
import { fetchClinicalFolder, createMedicalRecord, createMedicalDocument, uploadMedicalDocument, downloadMedicalDocument } from '../../services/profile/fetch_clinical_folders';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FolderOpen, User, FileText, Upload, ArrowLeft, Plus, Stethoscope, Download } from 'lucide-react';

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
    if (patientId) loadFolder();
    // eslint-disable-next-line
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
      await loadFolder();
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
                <FolderOpen className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Cartella Clinica</h1>
              <p className="text-lg text-blue-600 font-medium">Gestione Dati Paziente</p>
              <p className="text-gray-500 mt-2">Paziente ID: {folder.patient_id}</p>
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
          className="grid gap-8 xl:grid-cols-2"
        >
          {/* Colonna sinistra - Form */}
          <div className="space-y-6">
            {/* Form nuovo record medico */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                Nuovo Record Medico
              </h3>
              
              {formError && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {formError}
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sintomi</label>
                  <textarea
                    name="symptoms"
                    value={form.symptoms}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Descrivi i sintomi del paziente"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Diagnosi</label>
                  <textarea
                    name="diagnosis"
                    value={form.diagnosis}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Inserisci la diagnosi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Piano di Trattamento</label>
                  <textarea
                    name="treatment_plan"
                    value={form.treatment_plan}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Descrivi il piano di trattamento"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Note</label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="2"
                    placeholder="Note aggiuntive"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Segni Vitali</label>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Pressione</label>
                      <input
                        type="text"
                        name="blood_pressure"
                        value={form.vital_signs.blood_pressure}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="es. 120/80 mmHg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Temperatura</label>
                      <input
                        type="text"
                        name="temperature"
                        value={form.vital_signs.temperature}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="es. 36.5°C"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Frequenza Cardiaca</label>
                      <input
                        type="text"
                        name="heart_rate"
                        value={form.vital_signs.heart_rate}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="es. 72 bpm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Frequenza Respiratoria</label>
                      <input
                        type="text"
                        name="respiratory_rate"
                        value={form.vital_signs.respiratory_rate}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="es. 16 resp/min"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Peso</label>
                      <input
                        type="text"
                        name="weight"
                        value={form.vital_signs.weight}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="es. 70 kg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Altezza</label>
                      <input
                        type="text"
                        name="height"
                        value={form.vital_signs.height}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="es. 175 cm"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            </motion.div>

            {/* Form upload documento */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                Carica Documento
              </h3>
              
              {docFormError && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {docFormError}
                </div>
              )}

              <form onSubmit={handleDocFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo Documento</label>
                  <select
                    name="document_type"
                    value={docForm.document_type}
                    onChange={handleDocFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleziona tipo</option>
                    <option value="referto">Referto</option>
                    <option value="esame">Esame</option>
                    <option value="certificato">Certificato</option>
                    <option value="altro">Altro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Titolo</label>
                  <input
                    type="text"
                    name="title"
                    value={docForm.title}
                    onChange={handleDocFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Titolo del documento"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Descrizione</label>
                  <textarea
                    name="description"
                    value={docForm.description}
                    onChange={handleDocFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="2"
                    placeholder="Descrizione del documento"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">File</label>
                  <input
                    type="file"
                    onChange={handleDocFileChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </div>

                <button
                  type="submit"
                  disabled={docFormLoading}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            </motion.div>
          </div>

          {/* Colonna destra - Visualizzazione dati */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            {/* Record medici */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Record Medici ({folder.medical_records?.length || 0})
              </h3>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {folder.medical_records?.length > 0 ? (
                  folder.medical_records.map((record, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">Record #{index + 1}</h4>
                        <span className="text-sm text-gray-500">
                          {new Date(record.record_date).toLocaleDateString('it-IT')}
                        </span>
                      </div>
                      
                      {record.symptoms && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">Sintomi:</span>
                          <p className="text-sm text-gray-600">{record.symptoms}</p>
                        </div>
                      )}
                      
                      {record.diagnosis && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">Diagnosi:</span>
                          <p className="text-sm text-gray-600">{record.diagnosis}</p>
                        </div>
                      )}
                      
                      {record.treatment_plan && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">Trattamento:</span>
                          <p className="text-sm text-gray-600">{record.treatment_plan}</p>
                        </div>
                      )}
                      
                      {record.notes && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Note:</span>
                          <p className="text-sm text-gray-600">{record.notes}</p>
                        </div>
                      )}
                      
                      {record.vital_signs && Object.keys(record.vital_signs).length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Segni Vitali:</span>
                          <div className="mt-1 space-y-1">
                            {Object.entries(record.vital_signs).map(([key, value]) => (
                              <div key={key} className="flex justify-between text-sm">
                                <span className="text-gray-600 capitalize">
                                  {key === 'blood_pressure' ? 'Pressione' :
                                   key === 'heart_rate' ? 'Frequenza Cardiaca' :
                                   key === 'respiratory_rate' ? 'Frequenza Respiratoria' :
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
                      
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Nessun record medico presente</p>
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
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {folder.documents?.length > 0 ? (
                  folder.documents.map((doc, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{doc.title}</h4>
                          <p className="text-sm text-gray-600">{doc.document_type}</p>
                          {doc.description && (
                            <p className="text-sm text-gray-500">{doc.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Caricato: {new Date(doc.uploaded_at).toLocaleDateString('it-IT')}</span>
                            {doc.file_size && (
                              <span>Dimensione: {(doc.file_size / 1024).toFixed(1)} KB</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {doc.download_url && (
                            <button 
                              onClick={() => handleDownloadDocument(doc.id, doc.title)}
                              disabled={downloadingDoc === doc.id}
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <div className="text-center py-6 text-gray-500">
                    <Upload className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    <p>Nessun documento caricato</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ClinicalFolder; 