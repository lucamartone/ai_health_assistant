import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import { 
  FileText, 
  Menu, 
  X,
  Shield,
  LogOut
} from 'lucide-react';

const AdminSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, logout } = useAdmin();

  const navigation = [
    { name: 'Richieste Dottori', href: '/admin/', icon: FileText },
  ];

  const isActive = (href) => {
    return location.pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-md bg-red-600 text-white"
        >
          {isCollapsed ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-red-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}
      `}>
        <div className="flex items-center justify-center h-16 bg-red-900">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white">Admin Panel</span>
          </div>
        </div>

        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(item.href);
                  }}
                  className={`
                    group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors
                    ${isActive(item.href)
                      ? 'bg-red-900 text-white'
                      : 'text-red-100 hover:bg-red-700 hover:text-white'
                    }
                  `}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </a>
              );
            })}
          </div>

          {/* Admin Info e Logout */}
          <div className="mt-8 pt-8 border-t border-red-700">
            <div className="px-4 py-3">
              <div className="flex items-center space-x-3 mb-3">
                <Shield className="h-8 w-8 text-red-200" />
                <div>
                  <p className="text-sm font-medium text-red-200">
                    {admin?.name || 'Admin'} {admin?.surname || 'Sistema'}
                  </p>
                  <p className="text-xs text-red-300">{admin?.email || 'admin@healthassistant.com'}</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="group flex items-center w-full px-4 py-3 text-sm font-medium text-red-100 hover:bg-red-700 hover:text-white rounded-md transition-colors"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
};

export default AdminSidebar; 