import React, { useState } from 'react';
import './QuizConfig.css';

const QuizConfig = ({ onGenerate, onClose, isLoading, error }) => {
  const [quizType, setQuizType] = useState('mcq');
  const [questionCount, setQuestionCount] = useState(15);
  const [totalMarks, setTotalMarks] = useState('');

  const handleMarksChange = (e) => {
    const val = e.target.value;
    setTotalMarks(val);
    if (val && !isNaN(val)) {
      setQuestionCount(Math.max(5, Math.min(50, Number(val))));
    }
  };

  const handleGenerate = () => {
    if (onGenerate) {
      onGenerate({ questionCount, quizType });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-backdrop" onClick={!isLoading ? onClose : undefined}></div>
      <div className="modal-card">
        <h2 className="modal-title">Configure Your Quiz</h2>
        
        {error && <div className="notes-error-banner">{error}</div>}
        
        <div className="form-group">
          <label className="form-label">Quiz Type</label>
          <div className="radio-group">
            <label className="radio-label">
              <input 
                type="radio" 
                value="mcq" 
                checked={quizType === 'mcq'} 
                onChange={(e) => setQuizType(e.target.value)} 
                disabled={isLoading}
              />
              MCQ (Multiple Choice)
            </label>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="qCount">Number of Questions (5-50)</label>
          <input 
            type="number" 
            id="qCount"
            className="form-input" 
            min="5" 
            max="50" 
            value={questionCount} 
            onChange={(e) => {
                setQuestionCount(Number(e.target.value));
                setTotalMarks('');
            }}
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="marks">Or enter total marks:</label>
          <input 
            type="number" 
            id="marks"
            className="form-input" 
            placeholder="e.g. 15"
            value={totalMarks} 
            onChange={handleMarksChange}
            disabled={isLoading}
          />
          <small className="form-hint">Calculates 1 question per 1 mark.</small>
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose} disabled={isLoading}>Cancel</button>
          <button className="btn-generate" onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? <div className="btn-spinner"></div> : 'Generate Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizConfig;
