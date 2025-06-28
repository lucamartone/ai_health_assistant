import React, { useEffect, useState } from 'react';
import { fetchClinicalFolder, createMedicalRecord, createMedicalDocument, uploadMedicalDocument } from '../../services/profile/fetch_clinical_folders';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ClinicalFolder = () => {
  const { patientId } = useParams();
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
      setFolder(res.data);
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

  if (loading) return <div>Caricamento...</div>;
  if (error) return <div>{error}</div>;
  if (!folder) return <div>Nessuna cartella trovata.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Cartella Clinica Paziente #{folder.patient_id}</h2>
      {/* Form nuovo record medico */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Aggiungi nuovo record medico</h3>
        <form onSubmit={handleFormSubmit} className="space-y-2 bg-gray-50 p-4 rounded shadow">
          <div>
            <label className="block font-medium">Sintomi</label>
            <input name="symptoms" value={form.symptoms} onChange={handleFormChange} className="w-full border rounded p-1" />
          </div>
          <div>
            <label className="block font-medium">Diagnosi</label>
            <input name="diagnosis" value={form.diagnosis} onChange={handleFormChange} className="w-full border rounded p-1" />
          </div>
          <div>
            <label className="block font-medium">Piano terapeutico</label>
            <input name="treatment_plan" value={form.treatment_plan} onChange={handleFormChange} className="w-full border rounded p-1" />
          </div>
          <div>
            <label className="block font-medium">Note</label>
            <input name="notes" value={form.notes} onChange={handleFormChange} className="w-full border rounded p-1" />
          </div>
          <div>
            <label className="block font-medium">Segni vitali (JSON)</label>
            <input name="vital_signs" value={form.vital_signs} onChange={handleFormChange} className="w-full border rounded p-1" placeholder='{"blood_pressure":"120/80","temperature":36.5}' />
          </div>
          {formError && <div className="text-red-600">{formError}</div>}
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={formLoading}>
            {formLoading ? 'Salvataggio...' : 'Aggiungi Record'}
          </button>
        </form>
      </section>
      {/* Form nuovo documento medico con upload reale */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Aggiungi nuovo documento medico</h3>
        <form onSubmit={handleDocFormSubmit} className="space-y-2 bg-gray-50 p-4 rounded shadow" encType="multipart/form-data">
          <div>
            <label className="block font-medium">Tipo documento</label>
            <input name="document_type" value={docForm.document_type} onChange={handleDocFormChange} className="w-full border rounded p-1" placeholder="referto, esame, certificato..." />
          </div>
          <div>
            <label className="block font-medium">Titolo</label>
            <input name="title" value={docForm.title} onChange={handleDocFormChange} className="w-full border rounded p-1" />
          </div>
          <div>
            <label className="block font-medium">Descrizione</label>
            <input name="description" value={docForm.description} onChange={handleDocFormChange} className="w-full border rounded p-1" />
          </div>
          <div>
            <label className="block font-medium">File</label>
            <input type="file" name="file" onChange={handleDocFileChange} className="w-full border rounded p-1" />
          </div>
          {docFormError && <div className="text-red-600">{docFormError}</div>}
          <button type="submit" className="bg-violet-600 text-white px-4 py-2 rounded" disabled={docFormLoading}>
            {docFormLoading ? 'Salvataggio...' : 'Aggiungi Documento'}
          </button>
        </form>
      </section>
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Record Medici</h3>
        {folder.medical_records.length === 0 ? (
          <div>Nessun record medico presente.</div>
        ) : (
          <ul className="space-y-2">
            {folder.medical_records.map(record => (
              <li key={record.id} className="border rounded p-2">
                <div><b>Data:</b> {new Date(record.record_date).toLocaleString()}</div>
                <div><b>Medico:</b> {record.doctor_name} {record.doctor_surname}</div>
                <div><b>Diagnosi:</b> {record.diagnosis || '-'}</div>
                <div><b>Note:</b> {record.notes || '-'}</div>
                <div><b>Segni vitali:</b> {record.vital_signs ? JSON.stringify(record.vital_signs) : '-'}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Documenti Medici</h3>
        {folder.documents.length === 0 ? (
          <div>Nessun documento presente.</div>
        ) : (
          <ul className="space-y-2">
            {folder.documents.map(doc => (
              <li key={doc.id} className="border rounded p-2">
                <div><b>Tipo:</b> {doc.document_type}</div>
                <div><b>Titolo:</b> {doc.title}</div>
                <div><b>Caricato da:</b> {doc.doctor_name} {doc.doctor_surname}</div>
                <div><b>Data upload:</b> {new Date(doc.uploaded_at).toLocaleString()}</div>
                <div><b>Descrizione:</b> {doc.description || '-'}</div>
                {doc.file_path && <a href={doc.file_path} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Scarica documento</a>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default ClinicalFolder; 