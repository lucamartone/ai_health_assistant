import Button from './Button.jsx';
import { useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  return (
    <header className="bg-gray-800 text-white px-6 py-4 fixed top-0 w-full z-50"
    style={{ position: 'fixed', top: 0, width: '100%', zIndex: 50 }}>
      <div className="flex flex-row items-center justify-start w-full">
        {/* Titolo a sinistra */}
        <h1 className="text-xl font-bold whitespace-nowrap">AI Health Assistant</h1>

        {/* Link centrali */}
        <nav className="flex flex-column overflow-x-auto">
          <a href="/" className="hover:underline whitespace-nowrap inline-flex">Home</a>
          <a href="/about" className="hover:underline whitespace-nowrap inline-flex">About</a>
          <a href="/contact" className="hover:underline whitespace-nowrap inline-flex">Contacts</a>
        </nav>

        <div className="space-x-4 flex flex-row items-center"
        style={{ position: 'absolute', display: 'flex', flexDirection: 'row', alignItems: 'center', right: '10%' }}>
          {/* Pulsanti a destra */}
          <Button onClick={() => navigate('/login')
          }>Login</Button>
          <Button>Registrati</Button>
        </div>

      </div>
    </header>
  );
}

export default Header;

