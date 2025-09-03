import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Shield,
  UserPlus,
  UserCheck,
  UserX,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch dottori
      const requestsResponse = await fetch('http://localhost:8001/admin/doctor-requests');
      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json();
        const requests = requestsData.pending_requests || [];
        
        setStats(prev => ({
          ...prev,
          pendingRequests: requests.filter(r => r.status === 'pending').length,
          approvedRequests: requests.filter(r => r.status === 'approved').length,
          rejectedRequests: requests.filter(r => r.status === 'rejected').length
        }));

        setRecentRequests(requests.slice(0, 5)); // Show last 5
      }

      // TODO: Fetch contatori utente dal backend
      setStats(prev => ({
        ...prev,
        totalDoctors: 15,
        totalPatients: 120
      }));

    } catch (error) {
      console.error('Errore nel caricamento dashboard:', error);
      // Fallback con dati mock
      setStats({
        totalDoctors: 15,
        totalPatients: 120,
        pendingRequests: 3,
        approvedRequests: 12,
        rejectedRequests: 2
      });
      setRecentRequests([
        {
          id: 1,
          name: "Dr. Rossi",
          email: "rossi@example.com",
          specialization: "Cardiologia",
          status: "pending"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, onClick }) => (
    <div 
      className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-transform hover:scale-105 ${onClick ? 'hover:shadow-lg' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  const handleApprove = async (requestId) => {
    if (confirm('Sei sicuro di voler approvare questa richiesta?')) {
      try {
        const formData = new FormData();
        formData.append('admin_notes', 'Approvato dalla dashboard');

        const response = await fetch(`http://localhost:8001/admin/approve-doctor/${requestId}`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          alert('Richiesta approvata!');
          fetchDashboardData(); // Refresh data
        } else {
          alert('Errore durante l\'approvazione');
        }
      } catch (error) {
        alert('Errore di rete');
      }
    }
  };

  const handleReject = async (requestId) => {
    const reason = prompt('Inserisci il motivo del rifiuto:');
    if (reason) {
      try {
        const formData = new FormData();
        formData.append('admin_notes', reason);

        const response = await fetch(`http://localhost:8001/admin/reject-doctor/${requestId}`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          alert('Richiesta rifiutata!');
          fetchDashboardData(); // Refresh data
        } else {
          alert('Errore durante il rifiuto');
        }
      } catch (error) {
        alert('Errore di rete');
      }
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-red-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Pannello Amministratore</h1>
          </div>
          <p className="text-lg text-gray-600">
            Gestisci il sistema sanitario e monitora le attività
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Dottori Totali"
            value={stats.totalDoctors}
            icon={Users}
            color="bg-blue-500"
          />
          <StatCard
            title="Pazienti Totali"
            value={stats.totalPatients}
            icon={UserPlus}
            color="bg-green-500"
          />
          <StatCard
            title="Richieste Pendenti"
            value={stats.pendingRequests}
            icon={Clock}
            color="bg-yellow-500"
            onClick={() => navigate('/admin/doctor-requests')}
          />
          <StatCard
            title="Richieste Approvate"
            value={stats.approvedRequests}
            icon={UserCheck}
            color="bg-green-600"
          />
          <StatCard
            title="Richieste Rifiutate"
            value={stats.rejectedRequests}
            icon={UserX}
            color="bg-red-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Azioni Rapide</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/admin/doctor-requests')}
                className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileText className="h-8 w-8 text-blue-600 mr-3" />
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Gestisci Richieste</h3>
                  <p className="text-sm text-gray-500">Approva o rifiuta richieste dottori</p>
                </div>
              </button>

              <button
                onClick={() => alert('Funzionalità in sviluppo')}
                className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="h-8 w-8 text-green-600 mr-3" />
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Gestisci Utenti</h3>
                  <p className="text-sm text-gray-500">Visualizza e gestisci tutti gli utenti</p>
                </div>
              </button>

              <button
                onClick={() => alert('Funzionalità in sviluppo')}
                className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Report e Statistiche</h3>
                  <p className="text-sm text-gray-500">Analisi e metriche del sistema</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Requests */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Richieste Recenti</h2>
            <button
              onClick={() => navigate('/admin/doctor-requests')}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Vedi tutte →
            </button>
          </div>
          <div className="p-6">
            {recentRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nessuna richiesta recente</p>
            ) : (
              <div className="space-y-4">
                {recentRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-red-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{request.name}</h3>
                        <p className="text-sm text-gray-500">{request.email}</p>
                        <p className="text-xs text-gray-400">{request.specialization}</p>
                        {request.documents && request.documents.length > 0 && (
                          <div className="mt-1">
                            <p className="text-xs text-gray-500">Documenti: {request.documents.length}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {request.documents.slice(0, 2).map((doc) => (
                                <button
                                  key={doc.id}
                                  onClick={() => downloadDocument(doc.id, doc.filename)}
                                  className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                  title={`Scarica ${doc.filename} (${formatFileSize(doc.file_size)})`}
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  {doc.filename.length > 15 ? doc.filename.substring(0, 15) + '...' : doc.filename}
                                </button>
                              ))}
                              {request.documents.length > 2 && (
                                <span className="text-xs text-gray-500">+{request.documents.length - 2} altri</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(request.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approva
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Rifiuta
                          </button>
                        </>
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow p-8 text-white text-center">
          <Shield className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Benvenuto nel Pannello Amministratore</h2>
          <p className="text-red-100">
            Hai accesso completo al sistema. Usa i controlli sopra per gestire utenti, dottori e monitorare le attività.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 