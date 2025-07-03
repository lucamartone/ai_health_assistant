// src/pages/tabs/ChatTab.jsx
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

function ChatTab() {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Chat AI - Assistente Sanitario</h2>

      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8">
        <div className="flex justify-center mb-4">
          <MessageCircle className="h-16 w-16 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Assistenza Sanitaria Intelligente</h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Chatta con il nostro assistente AI per ricevere consigli sanitari, informazioni sui sintomi, o per fare
          domande sulla tua salute.
        </p>
        <div className="space-y-4">
          <button
            onClick={() => navigate('/chat')}
            className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Inizia Chat
          </button>
          <div className="text-sm text-gray-500">
            La chat è disponibile 24/7 per assistenza immediata
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatTab;
