import React from 'react';
import { Bot, Shield, Zap } from 'lucide-react';

const WelcomeMessage = ({ isVisible, input, setInput, sendMessage, isLoading, textareaRef, handleKeyDown, ollamaStatus }) => {
  return (
    <div className={`w-full max-w-2xl transform transition-all duration-700 ease-out ${
      isVisible 
        ? 'opacity-100 translate-y-0' 
        : 'opacity-0 translate-y-8'
    }`}>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          Ciao! Come posso aiutarti oggi?
        </h1>
        <p className="text-gray-600 mb-6">
          Sono il tuo assistente sanitario AI, alimentato da Ollama con modelli locali per la massima privacy.
        </p>
        
        {/* Ollama Status */}
        {ollamaStatus && (
          <div className="mb-6">
            {ollamaStatus.status === 'ready' ? (
              <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Modello AI pronto</span>
              </div>
            ) : ollamaStatus.status === 'downloading' ? (
              <div className="inline-flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-3 py-2 rounded-full text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span>Download modello in corso...</span>
              </div>
            ) : ollamaStatus.status === 'error' ? (
              <div className="inline-flex items-center space-x-2 bg-red-100 text-red-800 px-3 py-2 rounded-full text-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Errore nel caricamento del modello</span>
              </div>
            ) : (
              <div className="inline-flex items-center space-x-2 bg-gray-100 text-gray-800 px-3 py-2 rounded-full text-sm">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                <span>Controllo stato modello...</span>
              </div>
            )}
          </div>
        )}
        
        {/* Features */}
        <div className="flex justify-center space-x-6 mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Shield className="w-4 h-4 text-green-600" />
            <span>Privacy garantita</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Zap className="w-4 h-4 text-blue-600" />
            <span>Risposte veloci</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Bot className="w-4 h-4 text-purple-600" />
            <span>AI locale</span>
          </div>
        </div>

        {/* Example questions */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-2">Prova a chiedere:</p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>• "Ho mal di testa da ieri, cosa potrebbe essere?"</p>
            <p>• "Quali sono i sintomi dell'influenza?"</p>
            <p>• "Come posso migliorare la mia dieta?"</p>
          </div>
        </div>
      </div>

      <form onSubmit={sendMessage} className="flex flex-col space-y-4">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={ollamaStatus?.status === 'ready' ? "Scrivi la tua domanda sulla salute..." : "Modello AI in caricamento..."}
          className="w-full resize-none rounded-lg border border-gray-300 p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          rows="3"
          style={{ minHeight: '120px' }}
          disabled={ollamaStatus?.status !== 'ready'}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading || ollamaStatus?.status !== 'ready'}
          className="self-end px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Elaborazione...</span>
            </>
          ) : ollamaStatus?.status === 'ready' ? (
            <>
              <Bot className="w-4 h-4" />
              <span>Invia</span>
            </>
          ) : (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Attendi...</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default WelcomeMessage; 