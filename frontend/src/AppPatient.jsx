import { Routes, Route, useLocation } from 'react-router-dom';
import './App.css'
import Login from './pages/patient/Login';
import Index from './pages/patient/Index';
import Hub from './pages/patient/Hub';
import ProfileTab from './pages/patient/hub/ProfileTab';
import OverviewTab from './pages/patient/hub/OverviewTab';
import AppointmentsTab from './pages/patient/hub/AppointmentsTab';
import HistoryTab from './pages/patient/hub/HistoryTab';
import RankTab from './pages/patient/hub/RankTab';
import HealthTab from './pages/patient/hub/HealthTab';
import SecurityTab from './pages/patient/hub/SecurityTab';
import PreferencesTab from './pages/patient/hub/PreferencesTab';
import Chat from './pages/patient/Chat';
import Book from './pages/patient/Book';
import Register from './pages/patient/Register';
import ClinicalFolder from './pages/patient/ClinicalFolder';
import Header from './components/Header';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import SessionManager from './components/SessionManager';

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
        <Route path="/hub" element={<Hub />}>
          <Route path="overview" element={<OverviewTab />} />
          <Route path="profile" element={<ProfileTab />} />
          <Route path="appointments" element={<AppointmentsTab />} />
          <Route path="history" element={<HistoryTab />} />
          <Route path="rank" element={<RankTab />} />
          <Route path="health" element={<HealthTab />} />
          <Route path="security" element={<SecurityTab />} />
          <Route path="preferences" element={<PreferencesTab />} />
          {/* Redirect fallback */}
          <Route index element={<OverviewTab />} />
        </Route>
        <Route path="/chat" element={<Chat />} />
        <Route path="/book" element={<Book />} />
        <Route path="/profile/clinical-folder" element={<ClinicalFolder />} />
      </Routes>

      {!isChatPage && <Footer />}
      <CookieConsent />
      <SessionManager />
      </>
    );
}
export default AppPatient;