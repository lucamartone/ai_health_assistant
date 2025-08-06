import { Routes, Route, useLocation } from 'react-router-dom';
import './App.css'
import Login from './pages/doctor/Login';
import Index from './pages/doctor/Index';
import Hub from './pages/doctor/Hub';
import OverviewTab from './components/profile/doctor/OverviewTab';
import ProfileTab from './components/profile/doctor/ProfileTab';
import AppointmentsTab from './components/profile/doctor/AppointmentsTab';
import HistoryTab from './components/profile/doctor/HistoryTab';
import SecurityTab from './components/profile/doctor/SecurityTab';
import PreferencesTab from './components/profile/doctor/PreferencesTab';
import Appointments from './pages/doctor/Appointments';
import Register from './pages/doctor/Register';
import ClinicalFolder from './pages/doctor/ClinicalFolder';
import PatientList from './pages/doctor/PatientList';
import Header from './components/Header';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import SessionManager from './components/SessionManager';

function AppDoctor() {
      return (
      <>
      <Header />

      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/hub" element={<Hub />}>
          <Route path="overview" element={<OverviewTab />} />
          <Route path="profile" element={<ProfileTab />} />
          <Route path="appointments" element={<AppointmentsTab />} />
          <Route path="history" element={<HistoryTab />} />
          <Route path="security" element={<SecurityTab />} />
          <Route path="preferences" element={<PreferencesTab />} />
          {/* Default fallback */}
          <Route index element={<OverviewTab />} />
        </Route>
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/patients" element={<PatientList />} />
        <Route path="/records/:patientId" element={<ClinicalFolder />} />
      </Routes>

      <Footer />
      <CookieConsent />
      <SessionManager />
      </>
    );
}
export default AppDoctor;