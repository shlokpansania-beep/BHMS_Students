import React from 'react';
import './ChatMessage.css';

const formatText = (text) => {
  if (!text) return null;
  const paragraphs = text.split('\n').filter(p => p.trim() !== '');
  
  return paragraphs.map((para, i) => {
    // Basic bold formatting support
    const parts = para.split(/(\*\*.*?\*\*)/g);
    return (
      <p key={i}>
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j}>{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
      </p>
    );
  });
};

const ChatMessage = ({ message, isLoading }) => {
  if (isLoading) {
    return (
      <div className="chat-message assistant">
        <div className="message-bubble loading-bubble">
          <div className="dot-typing"></div>
        </div>
      </div>
    );
  }

  const { role, sender, content, example, diagram } = message;
  const isUser = (role || sender) === 'user';

  return (
    <div className={`chat-message ${isUser ? 'user' : 'assistant'}`}>
      <div className="message-bubble">
        <div className="message-content">
          {formatText(content)}
        </div>
        
        {example && (
          <div className="message-example">
            <span className="example-icon">💡</span>
            <div className="example-text">
              {formatText(example)}
            </div>
          </div>
        )}

        {diagram && (
          <div 
            className="message-diagram"
            dangerouslySetInnerHTML={{ __html: diagram }}
          />
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
