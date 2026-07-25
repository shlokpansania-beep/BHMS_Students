import React from 'react';
import './FlashCard.css';

const FlashCard = ({ item, type = 'remedy', isFlipped }) => {
  if (!item) return null;

  // Support notes card structure (with simple front/back properties)
  const isNotesCard = item.front && item.back;

  const renderFront = () => {
    if (isNotesCard) {
      return (
        <div className="front-content">
          <p className="notes-card-text">{item.front}</p>
          <div className="flip-hint">Tap to reveal</div>
        </div>
      );
    }

    if (type === 'remedy') {
      return (
        <div className="front-content">
          <h2 className="remedy-name">{item.name}</h2>
          <p className="remedy-source">{item.source}</p>
          <div className="flip-hint">Tap to reveal</div>
        </div>
      );
    }

    if (type === 'concept') {
      return (
        <div className="front-content">
          <span className="card-type-badge">Topic / Concept</span>
          <h2 className="remedy-name">{item.title}</h2>
          <div className="flip-hint">Tap to reveal</div>
        </div>
      );
    }

    if (type === 'principle') {
      return (
        <div className="front-content">
          <span className="card-type-badge Aphorism">Aphorism {item.aphorism_number}</span>
          <h2 className="remedy-name">{item.principle_name}</h2>
          <div className="flip-hint">Tap to reveal</div>
        </div>
      );
    }

    return null;
  };

  const renderBack = () => {
    if (isNotesCard) {
      return (
        <div className="back-content notes-back-content">
          <div className="card-section">
            <h4 className="section-title">💡 Answer / Explanation</h4>
            <p className="notes-explanation-text">{item.back}</p>
          </div>
        </div>
      );
    }

    if (type === 'remedy') {
      return (
        <div className="back-content">
          {item.keynotes && item.keynotes.length > 0 && (
            <div className="card-section">
              <h4 className="section-title">📌 Keynotes</h4>
              <ul>
                {item.keynotes.map((point, idx) => <li key={idx}>{point}</li>)}
              </ul>
            </div>
          )}
          
          {item.mind_symptoms && item.mind_symptoms.length > 0 && (
            <div className="card-section">
              <h4 className="section-title">🧠 Mind Symptoms</h4>
              <ul>
                {item.mind_symptoms.map((point, idx) => <li key={idx}>{point}</li>)}
              </ul>
            </div>
          )}
          
          {item.modalities && (
            <div className="card-section modalities-section">
              <div className="modality-col">
                <h4 className="section-title worse-title">▼ Worse</h4>
                <ul>
                  {item.modalities.worse?.map((point, idx) => <li key={idx}>{point}</li>)}
                </ul>
              </div>
              <div className="modality-col">
                <h4 className="section-title better-title">▲ Better</h4>
                <ul>
                  {item.modalities.better?.map((point, idx) => <li key={idx}>{point}</li>)}
                </ul>
              </div>
            </div>
          )}
          
          {item.common_uses && item.common_uses.length > 0 && (
            <div className="card-section">
              <h4 className="section-title">💊 Common Uses</h4>
              <ul>
                {item.common_uses.map((point, idx) => <li key={idx}>{point}</li>)}
              </ul>
            </div>
          )}
        </div>
      );
    }

    if (type === 'concept') {
      return (
        <div className="back-content">
          <div className="card-section">
            <h4 className="section-title">📖 Definition</h4>
            <p className="concept-definition-text">{item.definition}</p>
          </div>

          {item.key_points && item.key_points.length > 0 && (
            <div className="card-section">
              <h4 className="section-title">📌 Key Points</h4>
              <ul>
                {item.key_points.map((point, idx) => <li key={idx}>{point}</li>)}
              </ul>
            </div>
          )}

          {item.related_terms && item.related_terms.length > 0 && (
            <div className="card-section">
              <h4 className="section-title">🔗 Related Terms</h4>
              <div className="related-terms-list">
                {item.related_terms.map((term, idx) => (
                  <span key={idx} className="related-term-tag">{term}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (type === 'principle') {
      return (
        <div className="back-content">
          <div className="card-section">
            <h4 className="section-title">🏛️ Principle Explanation</h4>
            <p className="principle-explanation-text">{item.explanation}</p>
          </div>

          {item.example && (
            <div className="card-section concept-example-callout">
              <h4 className="section-title">💡 Clinical Example</h4>
              <p className="principle-example-text">{item.example}</p>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flashcard-container">
      <div className={`flashcard ${isFlipped ? 'flipped' : ''}`}>
        <div className="flashcard-front">
          {renderFront()}
        </div>
        <div className="flashcard-back">
          {renderBack()}
        </div>
      </div>
    </div>
  );
};

export default FlashCard;
