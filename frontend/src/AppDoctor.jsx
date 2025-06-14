import { Routes, Route, useLocation } from 'react-router-dom';
import './App.css'
import Index from './pages/doctor/Index';
import Register from './pages/doctor/Register';
import Login from './pages/doctor/Login';
import Header from './components/Header';
import Footer from './components/Footer';

function AppDoctor() {
    return (
      <>
      <Header />

      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>

      <Footer />
      </>
    );
}
export default AppDoctor;