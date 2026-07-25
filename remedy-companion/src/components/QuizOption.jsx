import React from 'react';
import './QuizOption.css';

const QuizOption = ({ option, status = 'default', onClick, disabled, index }) => {
  const letters = ['A', 'B', 'C', 'D'];
  const hasLetter = typeof index === 'number';

  return (
    <button 
      className={`quiz-option ${status}`} 
      onClick={onClick}
      disabled={disabled}
    >
      {hasLetter && (
        <span className="quiz-option-letter">{letters[index]}</span>
      )}
      <span className="quiz-option-text">{option.name}</span>
      {status === 'correct' && <span className="quiz-option-feedback-icon">✓</span>}
      {status === 'wrong' && <span className="quiz-option-feedback-icon">✗</span>}
    </button>
  );
};

export default QuizOption;
