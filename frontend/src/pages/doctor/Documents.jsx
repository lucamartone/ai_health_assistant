import React, { useState, useEffect } from 'react';
import { Upload, File, Trash2, Download, Check, X, Clock } from 'lucide-react';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [loading, setLoading] = useState(true);

  const documentTypes = [
    { value: 'cv', label: 'Curriculum Vitae' },
    { value: 'laurea', label: 'Laurea' },
    { value: 'abilitazione', label: 'Abilitazione' },
    { value: 'specializzazione', label: 'Specializzazione' },
    { value: 'altro', label: 'Altro' }
  ];

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      // TODO: Implement API call to fetch doctor documents
      // const response = await fetch(`/api/doctor/documents/${doctorId}`);
      // const data = await response.json();
      // setDocuments(data.documents);
      
      // Mock data for now
      setDocuments([
        {
          id: 1,
          document_type: 'cv',
          file_name: 'CV_Dottore_Rossi.pdf',
          mime_type: 'application/pdf',
          file_size: 1024000,
          uploaded_at: '2024-01-15T10:30:00Z',
          is_verified: true,
          verified_at: '2024-01-16T14:20:00Z'
        },
        {
          id: 2,
          document_type: 'laurea',
          file_name: 'Laurea_Medicina.pdf',
          mime_type: 'application/pdf',
          file_size: 2048000,
          uploaded_at: '2024-01-15T10:35:00Z',
          is_verified: false,
          verified_at: null
        }
      ]);
    } catch (error) {
      console.error('Errore nel caricamento dei documenti:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('Il file è troppo grande. Dimensione massima: 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentType) {
      alert('Seleziona un file e un tipo di documento');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('document_type', documentType);
      formData.append('doctor_id', '1'); // TODO: Get from auth context

      // TODO: Implement API call to upload document
      // const response = await fetch('/api/doctor/documents/upload', {
      //   method: 'POST',
      //   body: formData
      // });

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Add new document to list
      const newDocument = {
        id: Date.now(),
        document_type: documentType,
        file_name: selectedFile.name,
        mime_type: selectedFile.type,
        file_size: selectedFile.size,
        uploaded_at: new Date().toISOString(),
        is_verified: false,
        verified_at: null
      };

      setDocuments(prev => [...prev, newDocument]);
      
      // Reset form
      setSelectedFile(null);
      setDocumentType('');
      
      alert('Documento caricato con successo!');
    } catch (error) {
      console.error('Errore durante il caricamento:', error);
      alert('Errore durante il caricamento del documento');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!confirm('Sei sicuro di voler eliminare questo documento?')) {
      return;
    }

    try {
      // TODO: Implement API call to delete document
      // await fetch(`/api/doctor/documents/${documentId}`, { method: 'DELETE' });
      
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      alert('Documento eliminato con successo');
    } catch (error) {
      console.error('Errore durante l\'eliminazione:', error);
      alert('Errore durante l\'eliminazione del documento');
    }
  };

  const downloadDocument = (document) => {
    // TODO: Implement actual download from API
    alert(`Download di ${document.file_name}`);
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Documenti</h1>
          <p className="mt-2 text-gray-600">
            Carica e gestisci i tuoi documenti professionali
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Carica Nuovo Documento</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo Documento
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleziona tipo</option>
                {documentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File
              </label>
              <input
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleUpload}
                disabled={!selectedFile || !documentType || uploading}
                className={`w-full px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  !selectedFile || !documentType || uploading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {uploading ? (
                  <>
                    <Upload className="inline h-4 w-4 mr-2 animate-bounce" />
                    Caricamento...
                  </>
                ) : (
                  <>
                    <Upload className="inline h-4 w-4 mr-2" />
                    Carica
                  </>
                )}
              </button>
            </div>
          </div>

          {selectedFile && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-center">
                <File className="h-5 w-5 text-blue-400 mr-2" />
                <span className="text-sm text-blue-800">
                  File selezionato: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Documenti Caricati ({documents.length})
            </h2>
          </div>

          {documents.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <File className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nessun documento</h3>
              <p className="mt-1 text-sm text-gray-500">
                Carica il tuo primo documento per iniziare.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome File
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dimensione
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Caricato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {documents.map((document) => (
                    <tr key={document.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {documentTypes.find(t => t.value === document.document_type)?.label || document.document_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {document.file_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {document.mime_type}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatFileSize(document.file_size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(document.uploaded_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {document.is_verified ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Check className="h-3 w-3 mr-1" />
                            Verificato
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Clock className="h-3 w-3 mr-1" />
                            In attesa
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => downloadDocument(document)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Scarica documento"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(document.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Elimina documento"
                          >
                            <Trash2 className="h-4 w-4" />
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
    </div>
  );
};

export default Documents; 