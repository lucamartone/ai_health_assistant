import React from 'react';

const MessageList = ({ messages, isLoading, messagesEndRef }) => {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {messages.map((message, index) => (
        <div
          key={message.id}
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
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      ))}
      {isLoading && (
        <div 
          className="flex justify-start"
          style={{
            opacity: 0,
            transform: 'translateX(-20px)',
            animation: 'messageAppear 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex space-x-2">
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