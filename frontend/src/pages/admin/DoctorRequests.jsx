import React, { useState, useEffect } from 'react';
import { Check, X, Clock, CheckCircle, XCircle, Shield, Download, FileText } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';

const DoctorRequests = () => {
  const { 
    doctorRequests, 
    requestsLoading, 
    fetchDoctorRequests, 
    approveDoctorRequest, 
    rejectDoctorRequest 
  } = useAdmin();
  
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState('');
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Carica le richieste solo se non sono già presenti
    if (doctorRequests.length === 0) {
      fetchDoctorRequests();
    }
  }, [doctorRequests.length]); // Rimossa fetchDoctorRequests dalle dipendenze

  const handleAction = async (requestId, actionType) => {
    if (!notes.trim() && actionType === 'reject') {
      alert('Inserisci un motivo per il rifiuto');
      return;
    }

    setProcessing(true);
    try {
      let result;
      if (actionType === 'approve') {
        result = await approveDoctorRequest(requestId, notes);
      } else {
        result = await rejectDoctorRequest(requestId, notes);
      }

      if (result.success) {
        alert(actionType === 'approve' ? 'Richiesta approvata con successo!' : 'Richiesta rifiutata con successo!');
        setShowModal(false);
        setSelectedRequest(null);
        setAction('');
        setNotes('');
      } else {
        alert(`Errore: ${result.error}`);
      }
    } catch (error) {
      console.error('Errore durante l\'azione:', error);
      alert('Errore di rete durante l\'operazione');
    } finally {
      setProcessing(false);
    }
  };

  const openActionModal = (request, actionType) => {
    setSelectedRequest(request);
    setAction(actionType);
    setNotes('');
    setShowModal(true);
  };

  const downloadDocument = async (documentId, filename) => {
    try {
      console.log(`Download documento: ${documentId} - ${filename}`);
      
      const response = await fetch(`http://localhost:8001/admin/doctor-document/${documentId}`);
      console.log(`Risposta download: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const blob = await response.blob();
        console.log(`Blob creato: ${blob.size} bytes, tipo: ${blob.type}`);
        
        if (blob.size === 0) {
          alert('Il documento è vuoto');
          return;
        }
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        console.log('Download completato con successo');
      } else {
        const errorText = await response.text();
        console.error('Errore risposta:', errorText);
        alert(`Errore nel download del documento: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Errore nel download:', error);
      alert(`Errore nel download del documento: ${error.message}`);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calcola i counter reali
  const pendingCount = doctorRequests.filter(r => r.status === 'pending').length;
  const approvedCount = doctorRequests.filter(r => r.status === 'approved').length;
  const rejectedCount = doctorRequests.filter(r => r.status === 'rejected').length;

  if (requestsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header principale */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-red-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Pannello Amministratore</h1>
          </div>
          <p className="text-lg text-gray-600">
            Gestisci le richieste di registrazione dei nuovi dottori
          </p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">In Attesa</p>
                <p className="text-2xl font-semibold text-gray-900">{pendingCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Approvate</p>
                <p className="text-2xl font-semibold text-gray-900">{approvedCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Rifiutate</p>
                <p className="text-2xl font-semibold text-gray-900">{rejectedCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Richieste ({doctorRequests.length})
            </h2>
          </div>

          {doctorRequests.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nessuna richiesta</h3>
              <p className="mt-1 text-sm text-gray-500">
                Non ci sono richieste di registrazione in attesa.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dottore
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Specializzazione
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contatti
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documenti
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data Richiesta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {doctorRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.name}
                          </div>
                          <div className="text-sm text-gray-500">{request.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {request.specialization}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.phone || 'N/A'}</div>
                        {request.locations && request.locations.length > 0 && (
                          <div className="text-sm text-gray-500">
                            {request.locations[0].address}
                            {request.locations.length > 1 && '...'}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.documents && request.documents.length > 0 ? (
                          <div className="space-y-1">
                            {request.documents.map((doc, index) => (
                              <div key={doc.id} className="flex items-center space-x-2">
                                <FileText className="h-4 w-4 text-blue-600" />
                                <span className="text-xs text-gray-600 truncate max-w-32">
                                  {doc.filename}
                                </span>
                                <button
                                  onClick={() => downloadDocument(doc.id, doc.filename)}
                                  className="text-blue-600 hover:text-blue-800"
                                  title={`Scarica ${doc.filename} (${formatFileSize(doc.file_size)})`}
                                >
                                  <Download className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">Nessun documento</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(request.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {request.status === 'pending' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Clock className="h-3 w-3 mr-1" />
                            In attesa
                          </span>
                        )}
                        {request.status === 'approved' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approvata
                          </span>
                        )}
                        {request.status === 'rejected' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="h-3 w-3 mr-1" />
                            Rifiutata
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {request.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openActionModal(request, 'approve')}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approva
                            </button>
                            <button
                              onClick={() => openActionModal(request, 'reject')}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Rifiuta
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal di azione */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {action === 'approve' ? 'Approva' : 'Rifiuta'} Richiesta
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {action === 'approve' 
                  ? `Stai per approvare la richiesta di ${selectedRequest.name}`
                  : `Stai per rifiutare la richiesta di ${selectedRequest.name}`
                }
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note {action === 'approve' ? '(opzionale)' : '(richiesto per il rifiuto)'}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                  placeholder={action === 'approve' ? 'Note per l\'approvazione...' : 'Motivo del rifiuto...'}
                  required={action === 'reject'}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Annulla
                </button>
                <button
                  onClick={() => handleAction(selectedRequest.id, action)}
                  disabled={processing || (action === 'reject' && !notes.trim())}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    action === 'approve'
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  } ${processing || (action === 'reject' && !notes.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {processing ? 'Elaborazione...' : (action === 'approve' ? 'Approva' : 'Rifiuta')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorRequests; 