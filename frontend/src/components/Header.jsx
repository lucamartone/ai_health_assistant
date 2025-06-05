import MotionButton from './MotionButton.jsx';
import { useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();

  return (
    <header className="bg-blue-700 text-white px-6 py-4 fixed top-0 w-full z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Sinistra: Titolo e link */}
        <div className="flex items-center space-x-8">
          <h1 className="text-3xl font-bold whitespace-nowrap">
            AI Health Assistant
          </h1>
          <nav className="flex space-x-6">
            <a href="/" className="hover:underline whitespace-nowrap">Home</a>
            <a href="/about" className="hover:underline whitespace-nowrap">About</a>
            <a href="/contact" className="hover:underline whitespace-nowrap">Contacts</a>
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
