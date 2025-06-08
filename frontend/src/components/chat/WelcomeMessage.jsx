import React from 'react';

const WelcomeMessage = ({ isVisible, input, setInput, sendMessage, isLoading, textareaRef, handleKeyDown }) => {
  return (
    <div className={`w-full max-w-2xl transform transition-all duration-700 ease-out ${
      isVisible 
        ? 'opacity-100 translate-y-0' 
        : 'opacity-0 translate-y-8'
    }`}>
      <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
        Ciao! Come posso aiutarti oggi?
      </h1>
      <form onSubmit={sendMessage} className="flex flex-col space-y-4">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Scrivi un messaggio..."
          className="w-full resize-none rounded-lg border border-gray-300 p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          rows="3"
          style={{ minHeight: '120px' }}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="self-end px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Invia
        </button>
      </form>
    </div>
  );
};

export default WelcomeMessage; 