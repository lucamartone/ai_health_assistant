function Button({ Children, onClick }) {
  return (
    <button
    onClick={onClick}
    className="w-64 py-4 bg-indigo-500 text-white text-xl rounded-xl shadow hover:bg-indigo-600">
      { Children }
    </button>
  );
}
export default Button;