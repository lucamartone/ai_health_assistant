import { Routes, Route, useLocation } from 'react-router-dom';
import './App.css'
import Login from './pages/patient/Login';
import Index from './pages/patient/Index';
import Profile from './pages/patient/Profile';
import Chat from './pages/patient/Chat';
import Book from './pages/patient/Book';
import Register from './pages/patient/Register';
import Header from './components/Header';
import Footer from './components/Footer';

function AppPatient() {
    const location = useLocation();
    const isChatPage = location.pathname === '/chat';

    return (
      <>
      {!isChatPage && <Header />}

      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/book" element={<Book />} />
      </Routes>

      {!isChatPage && <Footer />}
      </>
    );
}
export default AppPatient;