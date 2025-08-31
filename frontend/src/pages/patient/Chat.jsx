import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkLLMStatus } from '../../services/ollama/status';
import { ask } from '../../services/ollama/chat';
import { useAuth } from '../../contexts/AuthContext';
import { getPatientHealthProfile } from '../../services/profile/health';
import Sidebar from '../../components/Sidebar';
import WelcomeMessage from '../../components/chat/WelcomeMessage';
import MessageList from '../../components/chat/MessageList';
import ChatInput from '../../components/chat/ChatInput';
import ChatStyles from '../../components/chat/ChatStyles';
import { Bot, AlertCircle, CheckCircle } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';

const Chat = () => {
  const {
    conversations,
    activeConversation,
    activeMessages: messages,
    lastSuggestions,
    createNewChat,
    selectChat,
    deleteChat,
    renameChat,
    updateConversationTitle,
    addMessage,
    updateConversationMessages,
    setLastSuggestions
  } = useChat();
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(312); // Larghezza iniziale della sidebar
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [isWelcomeVisible, setIsWelcomeVisible] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const navigate = useNavigate();
  const [visibleMessages, setVisibleMessages] = useState([]);
  const [ollamaStatus, setOllamaStatus] = useState({ status: 'checking' });
  const [userHealthData, setUserHealthData] = useState(null);
  const { account } = useAuth();

  useEffect(() => {
    if (conversations.length === 0) {
      createNewChat();
    }
  }, [conversations.length, createNewChat]);

  // Carica i dati di salute del paziente
  useEffect(() => {
    const loadHealthData = async () => {
      console.log('🔍 Account disponibile:', account);
      if (account && account.id) {
        try {
          console.log('🔍 Caricamento dati salute per paziente:', account.id);
          const healthData = await getPatientHealthProfile(account.id);
          console.log('✅ Dati salute caricati:', healthData);
          setUserHealthData(healthData);
        } catch (error) {
          console.error('❌ Errore nel caricamento dati salute:', error);
        }
      } else {
        console.log('⚠️ Account non disponibile o senza ID');
      }
    };

    loadHealthData();
  }, [account]);

  // Aggiorna isFirstMessage quando viene creata una nuova chat
  useEffect(() => {
    if (activeConversation) {
      const currentConv = conversations.find(c => c.id === activeConversation);
      if (currentConv) {
        setIsFirstMessage(currentConv.messages.length === 0);
      }
    } else {
      setIsFirstMessage(true);
    }
  }, [activeConversation, conversations]);

  useEffect(() => {
    // Check Ollama status on component mount
    const checkOllamaStatus = async () => {
      try {
        const status = await checkLLMStatus();
        setOllamaStatus(status);
        console.log('🤖 Stato Ollama:', status);
      } catch (error) {
        console.error('❌ Errore nel controllo dello stato Ollama:', error);
        setOllamaStatus({ status: 'error', error: error.message });
      }
    };
    
    checkOllamaStatus();
    
    // Controlla lo stato ogni 10 secondi finché non è pronto
    const interval = setInterval(async () => {
      const status = await checkLLMStatus();
      setOllamaStatus(status);
      if (status.status === 'ready') {
        clearInterval(interval);
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);



  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsWelcomeVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  const handleSelectChat = (chatId) => {
    selectChat(chatId);
    const selectedChat = conversations.find(c => c.id === chatId);
    if (selectedChat) {
      setIsFirstMessage(selectedChat.messages.length === 0);
    }
  };

  const handleDeleteChat = (chatId) => {
    deleteChat(chatId);
    const remainingConversations = conversations.filter(conv => conv.id !== chatId);
    if (remainingConversations.length > 0) {
      setIsFirstMessage(remainingConversations[0].messages.length === 0);
    } else {
      setIsFirstMessage(true);
    }
  };

  const handleRenameChat = (id, newTitle) => {
    renameChat(id, newTitle);
  };

  const handleSidebarResize = (newWidth) => {
    setSidebarWidth(newWidth);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMessage];

    // Aggiorna la conversazione con il messaggio utente
    updateConversationMessages(activeConversation, updatedMessages);

    if (messages.length === 0) {
      updateConversationTitle(activeConversation, input.trim());
    }

    setInput('');
    setIsLoading(true);
    setIsFirstMessage(false);

    try {
      // Prepara la cronologia dei messaggi per il contesto
      const messageHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Aggiungi il messaggio corrente alla cronologia
      messageHistory.push({
        role: 'user',
        content: input.trim()
      });

      const userContext = getUserContext();
      
      console.log('📚 Cronologia completa inviata all\'AI:', messageHistory);
      console.log('👤 User Context inviato all\'AI:', userContext);
      console.log('🔢 Numero messaggi nella cronologia:', messageHistory.length);

      const response = await ask(
        input.trim(),
        activeConversation,
        userContext,
        messageHistory
      );

      const aiMessage = { 
        role: 'assistant', 
        content: response.response,
        metadata: {
          provider: response.provider,
          model: response.model,
          confidence: response.confidence,
          usage: response.usage
        },
        suggestions: response.suggestions || [] // Aggiungi i suggerimenti al messaggio
      };
      
      const finalMessages = [...updatedMessages, aiMessage];

      // Aggiorna la conversazione con la risposta AI
      updateConversationMessages(activeConversation, finalMessages);
    } catch (error) {
      console.error('❌ Errore nella chat:', error);
      const errorMessage = {
        role: 'error',
        content: `Mi dispiace, si è verificato un errore: ${error.message}. Riprova più tardi.`
      };
      const finalMessages = [...updatedMessages, errorMessage];

      // Aggiorna la conversazione con il messaggio di errore
      updateConversationMessages(activeConversation, finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  // Genera l'user context dinamico dai dati del paziente
  const getUserContext = () => {
    if (!account || !userHealthData) {
      console.log('⚠️  Dati paziente non disponibili per user context');
      return {
        eta: null,
        sesso: null,
        patologie: [],
        blood_type: null,
        allergies: [],
        chronic_conditions: []
      };
    }

    // Calcola l'età dalla data di nascita
    let eta = null;
    if (account.birth_date) {
      const birthDate = new Date(account.birth_date);
      const today = new Date();
      eta = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        eta--;
      }
    }

    const context = {
      eta: eta,
      sesso: account.sex || null,
      patologie: userHealthData.patient_info.chronic_conditions || [],
      blood_type: userHealthData.patient_info.blood_type,
      allergies: userHealthData.patient_info.allergies || [],
      chronic_conditions: userHealthData.patient_info.chronic_conditions || []
    };

    console.log('🔍 User Context generato:', context);
    console.log('🔍 Account usato per context:', account);
    console.log('🔍 Health data usato per context:', userHealthData);
    return context;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'BOOK_APPOINTMENT') {
      // Navigate to booking page with filters
      navigate('/book', { 
        state: { 
          specialization: suggestion.specialization,
          city: suggestion.city 
        } 
      });
    } else {
      // Handle text suggestions
      setInput(suggestion.text);
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  useEffect(() => {
    if (messages.length > visibleMessages.length) {
      const newMessage = messages[messages.length - 1];
      setVisibleMessages(prev => [...prev, { ...newMessage, id: Date.now() }]);
    }
  }, [messages]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        conversations={conversations}
        activeConversation={activeConversation}
        onNewChat={createNewChat}
        onSelectChat={handleSelectChat}
        onRenameChat={handleRenameChat}
        onDeleteChat={handleDeleteChat}
        onCollapse={setIsSidebarCollapsed}
        onResize={handleSidebarResize}
        sidebarWidth={sidebarWidth}
      />

      <main 
        className="flex-1 flex flex-col transition-all duration-300"
        style={{ marginLeft: isSidebarCollapsed ? '120px' : `${sidebarWidth}px` }}
      >
        {/* Debug Info (solo in development) */}
        {process.env.NODE_ENV === 'development' && userHealthData && (
          <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-2 text-xs">
            <strong>DEBUG - Dati salute:</strong> {JSON.stringify(userHealthData)}
          </div>
        )}

        {/* Ollama Status Header */}
        {!isFirstMessage && (
          <div className="bg-white border-b border-gray-200 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Assistente AI</span>
                {ollamaStatus.status === 'ready' ? (
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs">Pronto</span>
                  </div>
                ) : ollamaStatus.status === 'downloading' ? (
                  <div className="flex items-center space-x-1 text-yellow-600">
                    <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs">Download modello...</span>
                  </div>
                ) : ollamaStatus.status === 'error' ? (
                  <div className="flex items-center space-x-1 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs">Errore</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-yellow-600">
                    <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs">Controllo...</span>
                  </div>
                )}
              </div>
              {ollamaStatus.model && (
                <div className="text-xs text-gray-500">
                  {ollamaStatus.model}
                </div>
              )}
            </div>
          </div>
        )}

        <div className={`flex-1 flex flex-col transition-all duration-500 ease-in-out ${isFirstMessage ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <WelcomeMessage
              isVisible={isWelcomeVisible}
              input={input}
              setInput={setInput}
              sendMessage={sendMessage}
              isLoading={isLoading}
              textareaRef={textareaRef}
              handleKeyDown={handleKeyDown}
              ollamaStatus={ollamaStatus}
            />
          </div>
        </div>

        <div className={`flex-1 flex flex-col transition-all duration-500 ease-in-out ${isFirstMessage ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <MessageList
              messages={messages}
              isLoading={isLoading}
              messagesEndRef={messagesEndRef}
              onSuggestionClick={handleSuggestionClick}
            />
          </div>

          <ChatInput
            input={input}
            setInput={setInput}
            sendMessage={sendMessage}
            isLoading={isLoading}
            textareaRef={textareaRef}
            handleKeyDown={handleKeyDown}
            ollamaStatus={ollamaStatus}
          />
        </div>
      </main>
      <ChatStyles />
    </div>
  );
};

export default Chat;
