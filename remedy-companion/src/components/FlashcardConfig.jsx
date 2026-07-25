import React, { useState } from 'react';
import './QuizConfig.css';

const FlashcardConfig = ({ onGenerate, onClose, isLoading, defaultCount = 15, error }) => {
  const [cardCount, setCardCount] = useState(defaultCount);

  const handleGenerate = () => {
    const count = Math.max(5, Math.min(50, Number(cardCount) || 15));
    onGenerate?.({ cardCount: count });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-backdrop" onClick={!isLoading ? onClose : undefined}></div>
      <div className="modal-card">
        <h2 className="modal-title">Generate Flashcards</h2>

        {error && <div className="notes-error-banner">{error}</div>}

        <div className="form-group">
          <label className="form-label" htmlFor="fcCount">
            Number of cards (5–50)
          </label>
          <input
            type="number"
            id="fcCount"
            className="form-input"
            min="5"
            max="50"
            value={cardCount}
            onChange={(e) => setCardCount(Number(e.target.value))}
            disabled={isLoading}
          />
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button className="btn-generate" onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? <div className="btn-spinner"></div> : 'Generate Flashcards'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardConfig;
