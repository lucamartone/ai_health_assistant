import MotionButton from './MotionButton.jsx';
import { useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();

  const navLinkStyle =
    'text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition duration-200';

  return (
    <header className="bg-blue-700 text-white px-6 py-4 fixed top-0 w-full z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Sinistra: Titolo + Link */}
        <div className="flex items-center space-x-8">
          <h1 className="text-3xl font-bold whitespace-nowrap">
            AI Health Assistant
          </h1>

          <nav className="flex space-x-2">
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
        <div className="flex space-x-4">
          <MotionButton onClick={() => navigate('/login')}>
            Accedi
          </MotionButton>
          <MotionButton onClick={() => navigate('/register')}>
            Registrati
          </MotionButton>
        </div>
      </div>
    </header>
  );
}

export default Header;
