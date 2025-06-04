function Header() {
  return (
    <header className="bg-gray-800 text-white px-6 py-4 fixed flex flextop-0 w-full z-50"
      style={{ position: 'fixed', top: 0 }}>
      <div className="flex items-center justify-end space-x-6 w-full overflow-x-auto">
        <h1 className="text-xl font-bold whitespace-nowrap">My Application</h1>

        <a href="/" className="hover:underline whitespace-nowrap">Home</a>
        <a href="/about" className="hover:underline whitespace-nowrap">About</a>
        <a href="/contact" className="hover:underline whitespace-nowrap">Contacts</a>
      </div>
    </header>
  );
}

export default Header;

