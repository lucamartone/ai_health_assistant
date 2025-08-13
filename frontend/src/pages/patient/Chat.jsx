import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { llmService } from '../../services/llmService';
import Sidebar from '../../components/Sidebar';
import WelcomeMessage from '../../components/chat/WelcomeMessage';
import MessageList from '../../components/chat/MessageList';
import ChatInput from '../../components/chat/ChatInput';
import ChatStyles from '../../components/chat/ChatStyles';

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
      const response = await llmService.askHealthQuestion(
        input.trim(),
        activeConversation,
        userContext  // ✅ qui passa il contesto al backend
      );

      const aiMessage = { role: 'assistant', content: response.response };
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
      const errorMessage = {
        role: 'error',
        content: 'Mi dispiace, si è verificato un errore. Riprova più tardi.'
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
            />
          </div>
        </div>

        <div className={`flex-1 flex flex-col transition-all duration-500 ease-in-out ${isFirstMessage ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <MessageList
              messages={messages}
              isLoading={isLoading}
              messagesEndRef={messagesEndRef}
            />
          </div>

          <ChatInput
            input={input}
            setInput={setInput}
            sendMessage={sendMessage}
            isLoading={isLoading}
            textareaRef={textareaRef}
            handleKeyDown={handleKeyDown}
          />
        </div>
      </main>
      <ChatStyles />
    </div>
  );
};

export default Chat;
