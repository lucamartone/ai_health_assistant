function Footer() {
  return (
    <footer className="bg-blue-700 text-white py-6 w-full shadow-inner">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm">
        <p className="text-center md:text-left">
          &copy; {new Date().getFullYear()} <span className="font-semibold">AI Health Assistant</span>. Tutti i diritti riservati.
        </p>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <a href="/privacy" className="hover:underline text-white transition duration-200">
            Privacy
          </a>
          <a href="/terms" className="hover:underline text-white transition duration-200">
            Termini
          </a>
          <a href="/contact" className="hover:underline text-white transition duration-200">
            Contatti
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
