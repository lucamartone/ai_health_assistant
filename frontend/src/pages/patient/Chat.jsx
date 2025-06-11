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

  // Add new state for message animations
  const [visibleMessages, setVisibleMessages] = useState([]);

  // Initialize with a new chat if none exists
  useEffect(() => {
    if (conversations.length === 0) {
      createNewChat();
    }
  }, []);

  // Update messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      const currentConv = conversations.find(c => c.id === activeConversation);
      if (currentConv) {
        setMessages(currentConv.messages);
        setIsFirstMessage(currentConv.messages.length === 0);
      }
    }
  }, [activeConversation, conversations]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Show welcome message with delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsWelcomeVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  const createNewChat = () => {
    const newId = Date.now();
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
    setConversations(prev => prev.filter(conv => conv.id !== chatId));
    if (chatId === activeConversation) {
      // If we deleted the active chat, create a new one
      createNewChat();
    }
  };

  const handleRenameChat = (id, newTitle) => {
    setConversations(prev => prev.map(conv => 
      conv.id === id ? { ...conv, title: newTitle } : conv
    ));
  };

  const updateConversationTitle = (id, firstMessage) => {
    const title = firstMessage.length > 30 
      ? firstMessage.slice(0, 30) + '...' 
      : firstMessage;
    
    setConversations(prev => prev.map(conv => 
      conv.id === id ? { ...conv, title } : conv
    ));
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    
    // Update conversation with user message
    setConversations(prev => prev.map(conv => 
      conv.id === activeConversation
        ? { ...conv, messages: updatedMessages }
        : conv
    ));

    // Update title if it's the first message
    if (messages.length === 0) {
      updateConversationTitle(activeConversation, input.trim());
    }

    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setIsFirstMessage(false);

    try {
      const response = await llmService.askHealthQuestion(input.trim());
      const aiMessage = { role: 'assistant', content: response.response };
      const finalMessages = [...updatedMessages, aiMessage];
      
      // Update conversation with AI response
      setConversations(prev => prev.map(conv => 
        conv.id === activeConversation
          ? { ...conv, messages: finalMessages }
          : conv
      ));
      setMessages(finalMessages);
    } catch (error) {
      const errorMessage = {
        role: 'error',
        content: 'Mi dispiace, si è verificato un errore. Riprova più tardi.',
      };
      const finalMessages = [...updatedMessages, errorMessage];
      
      // Update conversation with error message
      setConversations(prev => prev.map(conv => 
        conv.id === activeConversation
          ? { ...conv, messages: finalMessages }
          : conv
      ));
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

  // Update visible messages with animation
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
          {/* Centered input when no messages */}
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
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <MessageList
              messages={messages}
              isLoading={isLoading}
              messagesEndRef={messagesEndRef}
            />
          </div>

          {/* Input Area */}
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
