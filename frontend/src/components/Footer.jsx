function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6 w-full mt-16">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-sm text-gray-400">
          &copy; {new Date().getFullYear()} <span className="font-semibold text-white">AI Health Assistant</span>. Tutti i diritti riservati.
        </p>
      </div>
    </footer>
  );
}
export default Footer;
