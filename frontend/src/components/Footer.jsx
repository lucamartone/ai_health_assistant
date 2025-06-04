function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-4" style={{ position: 'absolute', bottom: 0, transform: 'translateX(-50%)', left: '50%' }}>
      <div className="container mx-auto text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} AI Health Assistant. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
export default Footer;