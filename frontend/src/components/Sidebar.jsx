import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Calendar, User, Home, ChevronDown, Trash2 } from 'lucide-react';

const Sidebar = ({ conversations, activeConversation, onNewChat, onSelectChat, onRenameChat, onDeleteChat, onCollapse, onResize, sidebarWidth: externalWidth }) => {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('sidebar_width');
    return saved ? parseInt(saved) : (externalWidth || 312);
  });
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  const handleRename = (conv) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = (e, convId) => {
    e.preventDefault();
    if (editTitle.trim()) {
      onRenameChat(convId, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCollapse = (collapsed) => {
    setIsCollapsed(collapsed);
    onCollapse(collapsed);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation(); // Prevent chat selection when clicking delete
    onDeleteChat(id);
  };

  // Funzioni per il ridimensionamento
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e) => {
    if (!isResizing) return;
    
    const newWidth = e.clientX;
    const minWidth = 120; // Larghezza minima
    const maxWidth = 500; // Larghezza massima
    
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setSidebarWidth(newWidth);
      localStorage.setItem('sidebar_width', newWidth.toString());
      if (onResize) {
        onResize(newWidth);
      }
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  // Event listeners per il ridimensionamento
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  // Sincronizza la larghezza esterna con quella interna
  useEffect(() => {
    if (externalWidth && externalWidth !== sidebarWidth) {
      setSidebarWidth(externalWidth);
    }
  }, [externalWidth]);

  const navItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Home', path: '/' },
    { icon: <MessageSquare className="w-5 h-5" />, label: 'Chat', path: '/chat' },
    { icon: <Calendar className="w-5 h-5" />, label: 'Prenotazioni', path: '/book' },
    { icon: <User className="w-5 h-5" />, label: 'Profilo', path: '/profile' },
  ];

  return (
    <div 
      ref={sidebarRef}
      className={`
        fixed top-0 left-0 h-full bg-gray-50 border-r border-gray-200 flex flex-col
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-30' : ''}
      `}
      style={{ width: isCollapsed ? '120px' : `${sidebarWidth}px` }}
    >
      {/* Collapse/Expand Button */}
      <button
        onClick={() => handleCollapse(!isCollapsed)}
        className="absolute -right-3 top-6 bg-white rounded-full p-1 shadow-md border border-gray-200 hover:bg-gray-50 z-10"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
        >
          <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Resize Handle */}
      {!isCollapsed && (
        <div
          className="absolute -right-1 top-0 bottom-0 w-2 cursor-col-resize z-20"
          onMouseDown={handleMouseDown}
          title="Trascina per ridimensionare"
        >
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-gray-300 rounded-full"></div>
        </div>
      )}

      {/* Logo Section */}
      <div className="p-4 border-b border-gray-200">
        <div 
          onClick={() => navigate('/')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <img 
            src="/favicon.png" 
            alt="MedFlow Logo" 
            className="w-8 h-8 sm:w-10 sm:h-10 transition-transform group-hover:scale-110"
          />
          {!isCollapsed && (
            <h1 className="text-xl font-bold whitespace-nowrap bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              MedFlow
            </h1>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-5 h-5 text-gray-600" />
            {!isCollapsed && <span className="text-gray-700">Menu</span>}
          </div>
          {!isCollapsed && (
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
          )}
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && !isCollapsed && (
          <div className="mt-2 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* New Chat Button */}
      <button
        onClick={onNewChat}
        className="m-4 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path
            fillRule="evenodd"
            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z"
            clipRule="evenodd"
          />
        </svg>
        {!isCollapsed && <span className="ml-2">Nuova Chat</span>}
      </button>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 space-y-4">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className="relative group"
            >
              <button
                onClick={() => onSelectChat(conv.id)}
                className={`w-full flex items-center p-2 rounded-lg transition-colors ${
                  activeConversation === conv.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 flex-shrink-0"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H7.5z"
                    clipRule="evenodd"
                  />
                </svg>
                {!isCollapsed && (
                  <>
                    {editingId === conv.id ? (
                      <form onSubmit={(e) => handleSaveRename(e, conv.id)} className="flex-1">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={() => setEditingId(null)}
                          className="w-full bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                          autoFocus
                        />
                      </form>
                    ) : (
                      <span className="truncate flex-1">{conv.title}</span>
                    )}
                  </>
                )}
              </button>
              {!isCollapsed && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleRename(conv)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-500">
                      <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, conv.id)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 