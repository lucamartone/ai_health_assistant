import React from 'react';

const ChatInput = ({ input, setInput, sendMessage, isLoading, textareaRef, handleKeyDown, ollamaStatus }) => {
  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={sendMessage} className="flex space-x-4">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={ollamaStatus.status === 'ready' ? "Scrivi un messaggio..." : "Modello AI in caricamento..."}
            className="flex-1 resize-none rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            rows="1"
            style={{ minHeight: '44px', maxHeight: '200px' }}
            disabled={ollamaStatus.status !== 'ready'}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || ollamaStatus.status !== 'ready'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {ollamaStatus.status === 'ready' ? 'Invia' : 'Attendi...'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInput; 