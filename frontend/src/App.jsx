import { Routes, Route, useLocation } from 'react-router-dom';
import './App.css'
import Login from './pages/Login';
import Index from './pages/index';
import Profile from './pages/profile';
import Chat from './pages/chat';
import Book from './pages/book';
import Register from './pages/register';

import Footer from './components/Footer';
import Header from './components/Header';

function App() {
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

export default App
