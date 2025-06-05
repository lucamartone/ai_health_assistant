import { useState, useRef, useEffect } from 'react';

function Chat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Ciao! Come posso aiutarti oggi?' },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);

    // Simulazione risposta assistente (sostituire con chiamata API)
    setTimeout(() => {
      const reply = {
        role: 'assistant',
        content: 'Grazie per la tua domanda! Ti risponderò al più presto.',
      };
      setMessages((prev) => [...prev, reply]);
    }, 1000);

    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 pt-20">
      <header className="bg-blue-700 text-white px-6 py-4 shadow-md">
        <h1 className="text-xl font-bold">Assistente Sanitario AI</h1>
      </header>

      {/* Area messaggi */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-xl px-4 py-3 rounded-xl shadow text-sm ${
              msg.role === 'user'
                ? 'bg-white self-end ml-auto text-blue-900'
                : 'bg-blue-600 text-white self-start mr-auto'
            }`}
          >
            {msg.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input utente */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="bg-white px-4 py-3 shadow-inner flex items-center gap-4 border-t"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Scrivi un messaggio..."
          className="flex-1 resize-none border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800 transition"
        >
          Invia
        </button>
      </form>
    </div>
  );
}

export default Chat;
