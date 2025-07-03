// src/components/ModalMessage.jsx
import React from 'react';

function SimpleModal({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full text-blue-900">
        <p className="mb-4 text-center">{message}</p>
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}

export default SimpleModal;
