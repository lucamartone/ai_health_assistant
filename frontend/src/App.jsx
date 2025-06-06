import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css'
import Login from './pages/Login';
import Index from './pages/Index';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Register from './pages/Register';

import Footer from './components/Footer';
import Header from './components/Header';


function App() {
    return (
      <>
      <Header />

      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>

      <Footer />
      </>
    );
}

export default App
