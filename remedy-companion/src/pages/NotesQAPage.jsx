import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotesStore } from '../hooks/useNotesStore';
import { askQuestion } from '../utils/apiClient';
import ChatMessage from '../components/ChatMessage';
import './NotesQAPage.css';

const NotesQAPage = () => {
  const navigate = useNavigate();
  const { document } = useNotesStore();
  const messagesEndRef = useRef(null);
  
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!document) {
      navigate('/notes');
      return;
    }
    
    // Initial welcome message
    setMessages([
      {
        id: 'initial-msg',
        sender: 'assistant',
        content: `I've loaded your document "${document.fileName}". Ask me anything about it!`,
        timestamp: new Date().toISOString()
      }
    ]);
  }, [document, navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userQuestion = inputValue.trim();
    setInputValue('');

    const newUserMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: userQuestion,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setIsTyping(true);

    try {
      const response = await askQuestion(document.text, userQuestion);
      
      const newAssistantMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        content: response.answer || 'No answer was generated.',
        example: response.example || null,
        diagram: response.diagram || null,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, newAssistantMessage]);
    } catch (error) {
      console.error('Error asking question:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        content: 'Sorry, I encountered an error while analyzing your document. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!document) return null;

  return (
    <div className="notes-qa-page">
      <header className="qa-header">
        <button className="btn-back" onClick={() => navigate('/notes')}>&larr; Back</button>
        <h2>Document Q&amp;A</h2>
        <div className="spacer"></div>
      </header>

      <div className="chat-area">
        {messages.map((msg) => (
          <ChatMessage 
            key={msg.id}
            message={msg}
          />
        ))}
        {isTyping && (
          <ChatMessage 
            message={{ sender: 'assistant', content: '' }} 
            isLoading={true} 
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <form className="chat-input-form" onSubmit={handleSend}>
          <input
            type="text"
            className="chat-input-field"
            placeholder="Ask a question about your notes..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isTyping}
          />
          <button 
            type="submit" 
            className="chat-send-btn"
            disabled={!inputValue.trim() || isTyping}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default NotesQAPage;
