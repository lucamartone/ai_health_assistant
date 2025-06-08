import React from 'react';

const ChatStyles = () => (
  <style jsx>{`
    @keyframes messageAppear {
      0% {
        opacity: 0;
        transform: translateX(var(--translate-x, 20px));
      }
      100% {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-4px);
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }
  `}</style>
);

export default ChatStyles; 