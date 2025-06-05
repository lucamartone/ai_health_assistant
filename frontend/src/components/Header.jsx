import MotionButton from './MotionButton.jsx';
import { useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();

  const navLinkStyle =
    'px-5 py-2 rounded-lg text-sm font-semibold bg-white text-blue-600 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow';

  return (
    <header className="bg-blue-700/90 backdrop-blur-sm text-white px-6 py-4 fixed top-0 w-full z-50 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Sinistra: Titolo + Link */}
        <div className="flex items-center space-x-8">
          <h1 className="text-2xl font-bold whitespace-nowrap bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            AI Health Assistant
          </h1>

          <nav className="flex space-x-1">
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

        {/* Destra: Pulsanti */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/login')} 
            className="px-5 py-2 text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-all duration-200"
          >
            Accedi
          </button>
          <button 
            onClick={() => navigate('/register')} 
            className="px-5 py-2 text-sm font-medium bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 shadow-sm hover:shadow"
          >
            Registrati
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
