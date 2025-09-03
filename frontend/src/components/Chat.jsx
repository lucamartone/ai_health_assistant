import React, { useState } from 'react';
import { llmService } from '../services/llmService';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        // aggiungi messaggio utente
        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Ottieni risposta AI
            const response = await llmService.askHealthQuestion(input);

            // Aggiungi messaggio AI
            const aiMessage = { role: 'assistant', content: response.response };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            // Aggiungi messaggio di errore
            const errorMessage = { 
                role: 'error', 
                content: 'Mi dispiace, si è verificato un errore. Riprova più tardi.' 
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-lg">
            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`p-3 rounded-lg ${
                            message.role === 'user'
                                ? 'bg-blue-100 ml-auto'
                                : message.role === 'error'
                                ? 'bg-red-100'
                                : 'bg-gray-100'
                        } max-w-[80%]`}
                    >
                        {message.content}
                    </div>
                ))}
                {isLoading && (
                    <div className="bg-gray-100 p-3 rounded-lg max-w-[80%]">
                        Sto pensando...
                    </div>
                )}
            </div>

            {/* Input form */}
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Fai una domanda sulla salute..."
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
                >
                    Invia
                </button>
            </form>
        </div>
    );
};

export default Chat; 