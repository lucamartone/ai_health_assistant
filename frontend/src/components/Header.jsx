import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserCircle } from 'lucide-react';
import { logout } from '../services/auth_profile';

function Header() {
  const navigate = useNavigate();
  const { user, loading, setUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout(); // chiama solo la fetch
      setUser(null);         // modifica stato globale
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  const navLinkStyle =
    'px-5 py-2 rounded-lg text-sm font-semibold bg-white/10 hover:bg-white/20 text-white transition-all duration-200 shadow-sm hover:shadow';

  return (
    <header className="bg-blue-700/90 backdrop-blur-sm text-white px-4 sm:px-6 py-4 fixed top-0 w-full z-50 shadow-lg h-[72px]">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-full">
        <div className="flex items-center space-x-4 sm:space-x-8">
          <div 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <img 
              src="/favicon.png" 
              alt="AI Health Assistant Logo" 
              className="w-8 h-8 sm:w-10 sm:h-10"
            />
            <h1 className="text-xl sm:text-2xl font-bold whitespace-nowrap bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent focus:outline-none">
              AI Health Assistant
            </h1>
          </div>

          <nav className="hidden md:flex space-x-1">
            <button onClick={() => navigate('/')} className={navLinkStyle}>
              Home
            </button>
            <button onClick={() => navigate('/about')} className={navLinkStyle}>
              About
            </button>
            <button onClick={() => navigate('/contact')} className={navLinkStyle}>
              Contacts
            </button>
          </nav>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {!loading && !user && (
            <div className="hidden sm:flex items-center space-x-3">
              <button 
                onClick={() => navigate('/login')} 
                className="px-4 sm:px-5 py-2 text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-all duration-200"
              >
                Accedi
              </button>
              <button 
                onClick={() => navigate('/register')} 
                className="px-4 sm:px-5 py-2 text-sm font-medium bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 shadow-sm hover:shadow"
              >
                Registrati
              </button>
            </div>
          )}

          {!loading && user && (
            <div className="flex items-center space-x-3">
              <span className="text-sm sm:text-base font-medium text-white whitespace-nowrap">
                Benvenuto, {user.name} {user.surname}
              </span>
              <button
                onClick={() => navigate('/profile')}
                className="p-2 rounded-full hover:bg-white/20 transition-all"
                title="Profilo"
              >
                <UserCircle className="w-7 h-7 text-white" />
              </button>
              <button
                onClick={ handleLogout }
                className="px-4 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-all duration-200"
              >
                Logout
              </button>
            </div>
          )}

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-blue-800/95 backdrop-blur-sm border-t border-white/10">
          <nav className="flex flex-col p-4 space-y-2">
            <button 
              onClick={() => {
                navigate('/');
                setIsMobileMenuOpen(false);
              }} 
              className={navLinkStyle}
            >
              Home
            </button>
            <button 
              onClick={() => {
                navigate('/about');
                setIsMobileMenuOpen(false);
              }} 
              className={navLinkStyle}
            >
              About
            </button>
            <button 
              onClick={() => {
                navigate('/contact');
                setIsMobileMenuOpen(false);
              }} 
              className={navLinkStyle}
            >
              Contacts
            </button>

            {!loading && !user && (
              <div className="flex flex-col space-y-2 pt-2 border-t border-white/10">
                <button 
                  onClick={() => {
                    navigate('/login');
                    setIsMobileMenuOpen(false);
                  }} 
                  className="w-full px-5 py-2 text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-all duration-200"
                >
                  Accedi
                </button>
                <button 
                  onClick={() => {
                    navigate('/register');
                    setIsMobileMenuOpen(false);
                  }} 
                  className="w-full px-5 py-2 text-sm font-medium bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 shadow-sm hover:shadow"
                >
                  Registrati
                </button>
              </div>
            )}

            {!loading && user && (
              <div className="flex flex-col space-y-2 pt-2 border-t border-white/10">
                <span className="text-white text-sm px-5">Benvenuto, {user.name} {user.surname}</span>
                <button
                  onClick={() => {
                    navigate('/profile');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center px-5 py-2 text-sm font-medium text-white hover:bg-white/10 rounded-lg"
                >
                  <UserCircle className="w-5 h-5 mr-2" /> Profilo
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-5 py-2 text-sm font-medium text-white hover:bg-white/10 rounded-lg"
                >
                  Logout
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;
