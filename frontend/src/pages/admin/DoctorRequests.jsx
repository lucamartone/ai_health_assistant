import React, { useState, useEffect } from 'react';
import { Check, X, Eye, Download, Clock } from 'lucide-react';

const DoctorRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState('');
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch('http://localhost:8001/doctor/registration/pending');
      if (response.ok) {
        const data = await response.json();
        setRequests(data.pending_requests || []);
      } else {
        console.error('Errore nel caricamento delle richieste');
      }
    } catch (error) {
      console.error('Errore di rete:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!selectedRequest || !action) return;

    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('action', action);
      formData.append('admin_notes', notes);
      formData.append('admin_id', '1'); // TODO: Get from auth context

      const response = await fetch(
        `http://localhost:8001/doctor/registration/review/${selectedRequest.id}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        setShowModal(false);
        setSelectedRequest(null);
        setAction('');
        setNotes('');
        fetchPendingRequests(); // Refresh the list
      } else {
        const error = await response.json();
        alert(`Errore: ${error.detail}`);
      }
    } catch (error) {
      console.error('Errore durante la revisione:', error);
      alert('Errore di rete durante la revisione');
    } finally {
      setProcessing(false);
    }
  };

  const openReviewModal = (request, reviewAction) => {
    setSelectedRequest(request);
    setAction(reviewAction);
    setNotes('');
    setShowModal(true);
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

  const downloadDocument = (document) => {
    // Convert hex data back to blob and download
    const bytes = new Uint8Array(document.data.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    const blob = new Blob([bytes], { type: document.mime_type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = document.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Richieste di Registrazione Dottori
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestisci le richieste di registrazione dei nuovi dottori
            </p>
          </div>

          {requests.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nessuna richiesta pendente</h3>
              <p className="mt-1 text-sm text-gray-500">
                Non ci sono richieste di registrazione in attesa di approvazione.
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
                      Sedi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documenti
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data Richiesta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.name} {request.surname}
                          </div>
                          <div className="text-sm text-gray-500">{request.email}</div>
                          <div className="text-sm text-gray-400">
                            {request.sex === 'M' ? 'Maschio' : 'Femmina'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {request.specialization}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {request.locations.length} sede{request.locations.length !== 1 ? 'i' : ''}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.locations.map(loc => loc.address).join(', ')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {request.documents.length} documento{request.documents.length !== 1 ? 'i' : ''}
                        </div>
                        <div className="flex space-x-1 mt-1">
                          {request.documents.map((doc, idx) => (
                            <button
                              key={idx}
                              onClick={() => downloadDocument(doc)}
                              className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs text-gray-700 hover:bg-gray-50"
                              title={`Scarica ${doc.filename}`}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              {doc.filename.length > 20 ? doc.filename.substring(0, 20) + '...' : doc.filename}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(request.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          new Date(request.expires_at) < new Date() 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {formatDate(request.expires_at)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openReviewModal(request, 'approve')}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approva
                          </button>
                          <button
                            onClick={() => openReviewModal(request, 'reject')}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Rifiuta
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal di revisione */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {action === 'approve' ? 'Approva' : 'Rifiuta'} Richiesta
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {action === 'approve' 
                  ? `Stai per approvare la richiesta di ${selectedRequest.name} ${selectedRequest.surname}`
                  : `Stai per rifiutare la richiesta di ${selectedRequest.name} ${selectedRequest.surname}`
                }
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note (opzionale)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder={action === 'approve' ? 'Note per l\'approvazione...' : 'Motivo del rifiuto...'}
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
                  onClick={handleReview}
                  disabled={processing}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    action === 'approve'
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
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