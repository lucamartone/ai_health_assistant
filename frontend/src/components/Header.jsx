function Header() {
  return (
    <header className="bg-gray-800 text-white px-6 py-4 fixed top-0 w-full z-50">
      <div className="flex flex-row items-center justify-between w-full">
        {/* Titolo a sinistra */}
        <h1 className="text-xl font-bold whitespace-nowrap">My Application</h1>

        {/* Link centrali */}
        <nav className="flex space-x-6 overflow-x-auto gap-4">
          <a href="/" className="hover:underline whitespace-nowrap">Home</a>
          <a href="/about" className="hover:underline whitespace-nowrap">About</a>
          <a href="/contact" className="hover:underline whitespace-nowrap">Contacts</a>
        </nav>

      </div>
    </header>
  );
}

export default Header;

