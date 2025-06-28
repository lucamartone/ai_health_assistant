import React, { useEffect, useState } from 'react';
import { fetchClinicalFolder, createMedicalRecord, createMedicalDocument, uploadMedicalDocument } from '../../services/profile/fetch_clinical_folders';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

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
    vital_signs: ''
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

  const loadFolder = async () => {
    setLoading(true);
    try {
      const res = await fetchClinicalFolder(patientId);
      setFolder(res);
    } catch (err) {
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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async e => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      const vitalSigns = form.vital_signs ? JSON.parse(form.vital_signs) : undefined;
      await createMedicalRecord({
        patient_id: parseInt(patientId),
        symptoms: form.symptoms,
        diagnosis: form.diagnosis,
        treatment_plan: form.treatment_plan,
        notes: form.notes,
        vital_signs: vitalSigns
      }, account?.id);
      setForm({ symptoms: '', diagnosis: '', treatment_plan: '', notes: '', vital_signs: '' });
      await loadFolder();
    } catch (err) {
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
    setDocFile(e.target.files[0]);
  };

  const handleDocFormSubmit = async e => {
    e.preventDefault();
    setDocFormLoading(true);
    setDocFormError(null);
    try {
      if (!docFile) throw new Error('Seleziona un file');
      const formData = new FormData();
      formData.append('patient_id', patientId);
      formData.append('doctor_id', account?.id);
      formData.append('document_type', docForm.document_type);
      formData.append('title', docForm.title);
      formData.append('description', docForm.description);
      formData.append('file', docFile);
      await uploadMedicalDocument(formData);
      setDocForm({ document_type: '', title: '', description: '' });
      setDocFile(null);
      await loadFolder();
    } catch (err) {
      setDocFormError('Errore durante il salvataggio. Controlla i dati inseriti.');
    } finally {
      setDocFormLoading(false);
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
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-2">Cartella Clinica</h1>
              <p className="text-lg text-blue-700">Paziente ID: {folder.patient_id}</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button 
                onClick={() => navigate('/doctor/patients')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center mx-auto sm:mx-0"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Torna ai Pazienti
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-2">
          {/* Colonna sinistra - Form */}
          <div className="space-y-6">
            {/* Form nuovo record medico */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Nuovo Record Medico
              </h3>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sintomi</label>
                  <textarea 
                    name="symptoms" 
                    value={form.symptoms} 
                    onChange={handleFormChange} 
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="3"
                    placeholder="Descrivi i sintomi del paziente..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosi</label>
                  <input 
                    name="diagnosis" 
                    value={form.diagnosis} 
                    onChange={handleFormChange} 
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Inserisci la diagnosi..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Piano Terapeutico</label>
                  <textarea 
                    name="treatment_plan" 
                    value={form.treatment_plan} 
                    onChange={handleFormChange} 
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="3"
                    placeholder="Descrivi il piano terapeutico..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                  <textarea 
                    name="notes" 
                    value={form.notes} 
                    onChange={handleFormChange} 
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="2"
                    placeholder="Note aggiuntive..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Segni Vitali (JSON)</label>
                  <input 
                    name="vital_signs" 
                    value={form.vital_signs} 
                    onChange={handleFormChange} 
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder='{"blood_pressure":"120/80","temperature":36.5}'
                  />
                </div>
                {formError && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                    {formError}
                  </div>
                )}
                <button 
                  type="submit" 
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Salvataggio...
                    </span>
                  ) : (
                    'Aggiungi Record'
                  )}
                </button>
              </form>
            </div>

            {/* Form nuovo documento medico */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Nuovo Documento Medico
              </h3>
              <form onSubmit={handleDocFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Documento</label>
                  <select 
                    name="document_type" 
                    value={docForm.document_type} 
                    onChange={handleDocFormChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Seleziona tipo...</option>
                    <option value="referto">Referto</option>
                    <option value="esame">Esame</option>
                    <option value="certificato">Certificato</option>
                    <option value="prescrizione">Prescrizione</option>
                    <option value="altro">Altro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titolo</label>
                  <input 
                    name="title" 
                    value={docForm.title} 
                    onChange={handleDocFormChange} 
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Titolo del documento..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
                  <textarea 
                    name="description" 
                    value={docForm.description} 
                    onChange={handleDocFormChange} 
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows="2"
                    placeholder="Descrizione del documento..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                  <input 
                    type="file" 
                    name="file" 
                    onChange={handleDocFileChange} 
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </div>
                {docFormError && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                    {docFormError}
                  </div>
                )}
                <button 
                  type="submit" 
                  className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={docFormLoading}
                >
                  {docFormLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Caricamento...
                    </span>
                  ) : (
                    'Carica Documento'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Colonna destra - Contenuto */}
          <div className="space-y-6">
            {/* Record Medici */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Record Medici ({folder.medical_records?.length || 0})
              </h3>
              {!folder.medical_records || folder.medical_records.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg">Nessun record medico presente.</p>
                  <p className="text-sm mt-2">Aggiungi il primo record usando il form a sinistra.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {folder.medical_records.map(record => (
                    <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="text-sm text-gray-500 mb-1">
                            {new Date(record.record_date).toLocaleString('it-IT')}
                          </div>
                          <div className="text-sm text-blue-600 font-medium">
                            Dr. {record.doctor_name} {record.doctor_surname}
                          </div>
                        </div>
                      </div>
                      {record.diagnosis && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">Diagnosi:</span>
                          <p className="text-sm text-gray-600 ml-2">{record.diagnosis}</p>
                        </div>
                      )}
                      {record.symptoms && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">Sintomi:</span>
                          <p className="text-sm text-gray-600 ml-2">{record.symptoms}</p>
                        </div>
                      )}
                      {record.treatment_plan && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">Piano Terapeutico:</span>
                          <p className="text-sm text-gray-600 ml-2">{record.treatment_plan}</p>
                        </div>
                      )}
                      {record.notes && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">Note:</span>
                          <p className="text-sm text-gray-600 ml-2">{record.notes}</p>
                        </div>
                      )}
                      {record.vital_signs && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Segni Vitali:</span>
                          <pre className="text-xs text-gray-600 ml-2 mt-1 bg-gray-100 p-2 rounded overflow-x-auto">
                            {JSON.stringify(record.vital_signs, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Documenti Medici */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Documenti Medici ({folder.documents?.length || 0})
              </h3>
              {!folder.documents || folder.documents.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <p className="text-lg">Nessun documento presente.</p>
                  <p className="text-sm mt-2">Carica il primo documento usando il form a sinistra.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {folder.documents.map(doc => (
                    <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="text-sm text-gray-500 mb-1">
                            {new Date(doc.uploaded_at).toLocaleString('it-IT')}
                          </div>
                          <div className="text-sm text-purple-600 font-medium">
                            Dr. {doc.doctor_name} {doc.doctor_surname}
                          </div>
                        </div>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                          {doc.document_type}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{doc.title}</h4>
                      {doc.description && (
                        <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                      )}
                      {doc.file_path && (
                        <a 
                          href={doc.file_path} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Visualizza documento
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicalFolder; 