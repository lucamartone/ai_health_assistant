import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css'
import Login from './pages/Login';
import Index from './pages/Index';
import Footer from './components/Footer';
import Header from './components/Header';
import Register from './pages/register';

function App() {
    return (
      <>
      <Header />

      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>

      <Footer />
      </>
    );
}

export default App
