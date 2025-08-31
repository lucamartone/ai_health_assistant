import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const { account } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [lastSuggestions, setLastSuggestions] = useState([]);

  // Carica le conversazioni dal localStorage quando l'utente cambia
  useEffect(() => {
    if (account?.id) {
      const savedConversations = localStorage.getItem(`chat_conversations_${account.id}`);
      if (savedConversations) {
        try {
          const parsed = JSON.parse(savedConversations);
          setConversations(parsed);
          
          // Se c'è una conversazione attiva salvata, ripristinala
          const savedActive = localStorage.getItem(`chat_active_${account.id}`);
          if (savedActive && parsed.find(c => c.id === savedActive)) {
            setActiveConversation(savedActive);
          } else if (parsed.length > 0) {
            setActiveConversation(parsed[0].id);
          }
        } catch (error) {
          console.error('Errore nel parsing delle conversazioni salvate:', error);
          setConversations([]);
        }
      } else {
        // Crea una nuova conversazione se non ce ne sono
        createNewChat();
      }
    } else {
      // Reset quando l'utente non è loggato
      setConversations([]);
      setActiveConversation(null);
    }
  }, [account?.id]);

  // Salva le conversazioni nel localStorage quando cambiano
  useEffect(() => {
    if (account?.id && conversations.length > 0) {
      console.log('💾 Salvando nel localStorage per account:', account.id);
      localStorage.setItem(`chat_conversations_${account.id}`, JSON.stringify(conversations));
    }
  }, [conversations, account?.id]);

  // Salva la conversazione attiva nel localStorage
  useEffect(() => {
    if (account?.id && activeConversation) {
      localStorage.setItem(`chat_active_${account.id}`, activeConversation);
    }
  }, [activeConversation, account?.id]);

  const createNewChat = useCallback(() => {
    const newId = String(Date.now());
    const newChat = {
      id: newId,
      title: 'Nuova Chat',
      messages: [],
      created_at: new Date().toISOString()
    };
    setConversations(prev => [...prev, newChat]);
    setActiveConversation(newId);
    return newId;
  }, []);

  const selectChat = useCallback((chatId) => {
    if (chatId !== activeConversation) {
      setActiveConversation(chatId);
    }
  }, [activeConversation]);

  const deleteChat = useCallback((chatId) => {
    const updatedConversations = conversations.filter(conv => conv.id !== chatId);
    setConversations(updatedConversations);

    if (chatId === activeConversation) {
      if (updatedConversations.length > 0) {
        const nextChat = updatedConversations[0];
        setActiveConversation(nextChat.id);
      } else {
        createNewChat();
      }
    }
  }, [conversations, activeConversation, createNewChat]);

  const renameChat = useCallback((id, newTitle) => {
    setConversations(prev =>
      prev.map(conv => (conv.id === id ? { ...conv, title: newTitle } : conv))
    );
  }, []);

  const updateConversationTitle = useCallback((id, firstMessage) => {
    const title = firstMessage.length > 30 ? firstMessage.slice(0, 30) + '...' : firstMessage;
    setConversations(prev =>
      prev.map(conv => (conv.id === id ? { ...conv, title } : conv))
    );
  }, []);

  const addMessage = useCallback((conversationId, message) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, messages: [...conv.messages, message] }
          : conv
      )
    );
  }, []);

  const updateConversationMessages = useCallback((conversationId, messages) => {
    console.log('🔄 Aggiornando conversazione:', conversationId, 'con', messages.length, 'messaggi');
    setConversations(prev => {
      const updated = prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, messages }
          : conv
      );
      console.log('💾 Nuove conversazioni:', updated);
      return updated;
    });
  }, []);

  const getActiveConversation = useCallback(() => {
    return conversations.find(c => c.id === activeConversation);
  }, [conversations, activeConversation]);

  const getActiveMessages = useCallback(() => {
    const active = getActiveConversation();
    return active ? active.messages : [];
  }, [getActiveConversation]);

  const clearAllConversations = useCallback(() => {
    if (window.confirm('Sei sicuro di voler cancellare tutte le conversazioni? Questa azione non può essere annullata.')) {
      setConversations([]);
      setActiveConversation(null);
      if (account?.id) {
        localStorage.removeItem(`chat_conversations_${account.id}`);
        localStorage.removeItem(`chat_active_${account.id}`);
      }
    }
  }, [account?.id]);

  return (
    <ChatContext.Provider value={{
      // State
      conversations,
      activeConversation,
      lastSuggestions,
      
      // Actions
      createNewChat,
      selectChat,
      deleteChat,
      renameChat,
      updateConversationTitle,
      addMessage,
      updateConversationMessages,
      getActiveConversation,
      getActiveMessages,
      clearAllConversations,
      setLastSuggestions,
      
      // Computed
      activeMessages: getActiveMessages(),
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat deve essere usato all\'interno di ChatProvider');
  }
  return context;
};
