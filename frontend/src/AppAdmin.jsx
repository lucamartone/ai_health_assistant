import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminProvider, useAdmin } from './contexts/AdminContext';
import AdminLogin from './pages/admin/Login';
import DoctorRequests from './pages/admin/DoctorRequests';
import AdminSidebar from './components/admin/AdminSidebar';

// Componente per proteggere le rotte admin
const ProtectedRoute = ({ children }) => {
  const { admin, loading } = useAdmin();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }
  
  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

// Componente per la pagina admin autenticata
const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<DoctorRequests />} />
          <Route path="*" element={<Navigate to="/admin/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

function AppAdmin() {
  return (
    <AdminProvider>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        } />
      </Routes>
    </AdminProvider>
  );
}

export default AppAdmin; 