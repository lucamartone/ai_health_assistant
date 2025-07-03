import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Calendar, FileText } from 'lucide-react';

function PanoramicaTab() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetch('/profile/patient/appointments/history?patient_id=1') // da parametrizzare
      .then(res => res.json())
      .then(data => setAppointments(data.history || []));
  }, []);

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('it-IT');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Panoramica</h2>
      <div className="grid md:grid-cols-3 gap-6">
        <div
          className="bg-green-50 p-6 rounded-xl text-center cursor-pointer hover:shadow"
          onClick={() => navigate('/chat')}
        >
          <MessageCircle className="h-10 w-10 text-green-600 mx-auto" />
          <h3 className="font-semibold mt-2">Chat AI</h3>
        </div>
        <div
          className="bg-purple-50 p-6 rounded-xl text-center cursor-pointer hover:shadow"
          onClick={() => navigate('/book')}
        >
          <Calendar className="h-10 w-10 text-purple-600 mx-auto" />
          <h3 className="font-semibold mt-2">Prenota Visita</h3>
        </div>
        <div
          className="bg-orange-50 p-6 rounded-xl text-center cursor-pointer hover:shadow"
          onClick={() => navigate('/profile/clinical-folder')}
        >
          <FileText className="h-10 w-10 text-orange-600 mx-auto" />
          <h3 className="font-semibold mt-2">Cartella Clinica</h3>
        </div>
      </div>
    </div>
  );
}

export default PanoramicaTab;
