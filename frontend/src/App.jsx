import { Routes, Route } from 'react-router-dom';
import './App.css'
import AppPatient from './AppPatient';
import AppDoctor from './AppDoctor';

function App() {
  
    return (
      <>
      <Routes>
        <Route path="/*" element={<AppPatient />} />
        <Route path="/doctor/*" element={<AppDoctor />} />
      </Routes>
      </>
    );
}

export default App
