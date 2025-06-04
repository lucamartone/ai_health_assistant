import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css'
import Login from './pages/Login';  // importa la pagina Login
import Index from './pages/Index'; // importa la pagina Index

function App() {
    return (
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    );
}

export default App
