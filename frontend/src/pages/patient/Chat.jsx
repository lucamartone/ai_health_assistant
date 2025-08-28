import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkLLMStatus } from '../../services/ollama/status';
import { ask } from '../../services/ollama/chat';
import Sidebar from '../../components/Sidebar';
import WelcomeMessage from '../../components/chat/WelcomeMessage';
import MessageList from '../../components/chat/MessageList';
import ChatInput from '../../components/chat/ChatInput';
import ChatStyles from '../../components/chat/ChatStyles';
import { Bot, AlertCircle, CheckCircle } from 'lucide-react';

const Chat = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [isWelcomeVisible, setIsWelcomeVisible] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const navigate = useNavigate();
  const [visibleMessages, setVisibleMessages] = useState([]);
  const [lastSuggestions, setLastSuggestions] = useState([]);
  const [ollamaStatus, setOllamaStatus] = useState({ status: 'checking' });

  // Example static user context (replace with dynamic source)
  const userContext = {
    eta: 30,
    sesso: 'maschio',
    patologie: ['ipertensione']
  };

  useEffect(() => {
    if (conversations.length === 0) {
      createNewChat();
    }
  }, []);

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
    if (activeConversation) {
      const currentConv = conversations.find(c => c.id === activeConversation);
      if (currentConv) {
        setMessages(currentConv.messages);
        setIsFirstMessage(currentConv.messages.length === 0);
      }
    }
  }, [activeConversation, conversations]);

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

  const createNewChat = () => {
    const newId = String(Date.now());
    const newChat = {
      id: newId,
      title: 'Nuova Chat',
      messages: []
    };
    setConversations(prev => [...prev, newChat]);
    setActiveConversation(newId);
    setMessages([]);
    setIsFirstMessage(true);
    setInput('');
  };

  const handleSelectChat = (chatId) => {
    if (chatId !== activeConversation) {
      setActiveConversation(chatId);
      const selectedChat = conversations.find(c => c.id === chatId);
      if (selectedChat) {
        setMessages(selectedChat.messages);
        setIsFirstMessage(selectedChat.messages.length === 0);
      }
    }
  };

  const handleDeleteChat = (chatId) => {
    const updatedConversations = conversations.filter(conv => conv.id !== chatId);
    setConversations(updatedConversations);

    if (chatId === activeConversation) {
      if (updatedConversations.length > 0) {
        const nextChat = updatedConversations[0];
        setActiveConversation(nextChat.id);
        setMessages(nextChat.messages);
        setIsFirstMessage(nextChat.messages.length === 0);
      } else {
        createNewChat();
      }
    }
  };

  const handleRenameChat = (id, newTitle) => {
    setConversations(prev =>
      prev.map(conv => (conv.id === id ? { ...conv, title: newTitle } : conv))
    );
  };

  const updateConversationTitle = (id, firstMessage) => {
    const title = firstMessage.length > 30 ? firstMessage.slice(0, 30) + '...' : firstMessage;
    setConversations(prev =>
      prev.map(conv => (conv.id === id ? { ...conv, title } : conv))
    );
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMessage];

    setConversations(prev =>
      prev.map(conv =>
        conv.id === activeConversation
          ? { ...conv, messages: updatedMessages }
          : conv
      )
    );

    if (messages.length === 0) {
      updateConversationTitle(activeConversation, input.trim());
    }

    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setIsFirstMessage(false);

    try {
      // Prepara la cronologia dei messaggi per il contesto
      const messageHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

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
        }
      };
      
      // Update suggestions if available
      if (response.suggestions && response.suggestions.length > 0) {
        setLastSuggestions(response.suggestions);
      }
      
      const finalMessages = [...updatedMessages, aiMessage];

      setConversations(prev =>
        prev.map(conv =>
          conv.id === activeConversation
            ? { ...conv, messages: finalMessages }
            : conv
        )
      );
      setMessages(finalMessages);
    } catch (error) {
      console.error('❌ Errore nella chat:', error);
      const errorMessage = {
        role: 'error',
        content: `Mi dispiace, si è verificato un errore: ${error.message}. Riprova più tardi.`
      };
      const finalMessages = [...updatedMessages, errorMessage];

      setConversations(prev =>
        prev.map(conv =>
          conv.id === activeConversation
            ? { ...conv, messages: finalMessages }
            : conv
        )
      );
      setMessages(finalMessages);
    } finally {
      setIsLoading(false);
    }
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
      />

      <main className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
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
              suggestions={lastSuggestions}
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
