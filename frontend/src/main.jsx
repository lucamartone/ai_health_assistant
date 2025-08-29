import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom' 
import { AuthProvider } from './contexts/AuthContext.jsx' 
import { ChatProvider } from './contexts/ChatContext.jsx' 
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ChatProvider>
          <App />
        </ChatProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);