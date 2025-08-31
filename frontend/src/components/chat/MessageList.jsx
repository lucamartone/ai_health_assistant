import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function normalizeBullets(md) {
  if (!md || typeof md !== 'string') return md;
  const lines = md.split('\n');
  const normalized = lines.map((line) => {
    const trimmed = line.replace(/^\s+/, '');
    if (trimmed.startsWith('* ')) {
      const leadingSpaces = line.slice(0, line.length - trimmed.length);
      return `${leadingSpaces}- ${trimmed.slice(2)}`;
    }
    if (trimmed.startsWith('• ')) {
      const leadingSpaces = line.slice(0, line.length - trimmed.length);
      return `${leadingSpaces}- ${trimmed.slice(2)}`;
    }
    return line;
  });
  return normalized.join('\n');
}

const MessageList = ({ messages, isLoading, messagesEndRef, suggestions = [], onSuggestionClick }) => {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {messages.map((message, index) => (
        <div key={message.id} className="space-y-2">
          <div
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            style={{
              opacity: 0,
              transform: message.role === 'user' ? 'translateX(20px)' : 'translateX(-20px)',
              animation: `messageAppear 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
              animationDelay: `${index * 150}ms`
            }}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] md:max-w-[65%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200'
              }`}
            >
              {message.role === 'assistant' ? (
                <div className="prose max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      ul: ({ node, ...props }) => (
                        <ul className="list-disc pl-6 space-y-2" {...props} />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol className="list-decimal pl-6 space-y-2" {...props} />
                      ),
                      li: ({ node, children, ...props }) => (
                        <li className="leading-relaxed" {...props}>{children}</li>
                      ),
                      strong: ({ node, ...props }) => (
                        <strong className="font-semibold" {...props} />
                      ),
                      p: ({ node, ...props }) => (
                        <p className="leading-relaxed" {...props} />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2 className="text-lg font-semibold mt-2" {...props} />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3 className="text-base font-semibold mt-2" {...props} />
                      )
                    }}
                  >
                    {normalizeBullets(message.content)}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              )}
            </div>
          </div>

          {/* Mostra i suggerimenti associati a questo messaggio */}
          {message.role === 'assistant' && message.suggestions && message.suggestions.length > 0 && (
            <div className="flex justify-start">
              <div className="bg-white border border-blue-200 rounded-lg p-4 w-full max-w-[65%]">
                <div className="flex flex-wrap gap-3 items-center">
                  {message.suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSuggestionClick && onSuggestionClick(s)}
                      className={`px-4 py-2 rounded-md text-sm inline-flex items-center gap-2 transition-colors ${
                        s.type === 'BOOK_APPOINTMENT' 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {s.type === 'BOOK_APPOINTMENT' ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {s.text || `Prenota - ${s.specialization}`}
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {s.text}
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

            {isLoading && (
        <div 
          className="flex justify-start"
          style={{
            opacity: 0,
            transform: 'translateY(20px)',
            animation: 'messageAppear 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList; 