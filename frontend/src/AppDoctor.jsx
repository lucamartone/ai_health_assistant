import { Routes, Route, useLocation } from 'react-router-dom';
import './App.css'
import Login from './pages/doctor/Login';
import Index from './pages/doctor/Index';
import Profile from './pages/doctor/Profile';
import Appointments from './pages/doctor/Appointments';
import Register from './pages/doctor/Register';
import ClinicalFolder from './pages/doctor/ClinicalFolder';
import PatientList from './pages/doctor/PatientList';
import Header from './components/Header';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import SessionManager from './components/SessionManager';

function AppDoctor() {
    const location = useLocation();

    return (
      <>
      <Header />

      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/records" element={<PatientList />} />
        <Route path="/records/:patientId" element={<ClinicalFolder />} />
      </Routes>

      <Footer />
      <CookieConsent />
      <SessionManager />
      </>
    );
}
export default AppDoctor;