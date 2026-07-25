import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotesStore } from '../hooks/useNotesStore';
import { generateFlashcards } from '../utils/apiClient';
import FlashcardConfig from '../components/FlashcardConfig';
import './NotesFlashcardsPage.css';

const NotesFlashcardsPage = () => {
  const navigate = useNavigate();
  const { document, getCachedFlashcards, setCachedFlashcards } = useNotesStore();

  const [stage, setStage] = useState('config');
  const [cardCount, setCardCount] = useState(15);
  const [isLoading, setIsLoading] = useState(false);
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!document) {
      navigate('/notes');
    }
  }, [document, navigate]);

  const runGenerate = async (count, { forceRefresh = false } = {}) => {
    setError('');
    setIsLoading(true);
    setStage('loading');

    if (!forceRefresh) {
      const cached = getCachedFlashcards(count);
      if (cached?.length) {
        setCards(cached);
        setCardCount(count);
        setCurrentIndex(0);
        setIsFlipped(false);
        setStage('study');
        setIsLoading(false);
        return;
      }
    }

    try {
      const result = await generateFlashcards(document.text, count);
      const nextCards = result.cards || [];
      if (!nextCards.length) {
        throw new Error('No cards were generated.');
      }
      setCachedFlashcards(count, nextCards);
      setCards(nextCards);
      setCardCount(count);
      setCurrentIndex(0);
      setIsFlipped(false);
      setStage('study');
    } catch (err) {
      setError(err.message || 'Failed to generate flashcards.');
      setStage('config');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigGenerate = ({ cardCount: count }) => {
    runGenerate(count, { forceRefresh: false });
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 150);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex((prev) => prev - 1), 150);
    }
  };

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleShuffle = () => {
    setCards([...cards].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) handleNext();
    else if (distance < -minSwipeDistance) handlePrev();
  };

  if (!document) return null;

  if (stage === 'config') {
    return (
      <div className="notes-flashcards-page page">
        <div className="page-header">
          <button className="btn-back-link" onClick={() => navigate('/notes')}>
            ← Back to Notes
          </button>
          <h1 className="page-title">📇 Flashcards from Notes</h1>
        </div>
        {error && <div className="notes-error">{error}</div>}
        <FlashcardConfig
          onGenerate={handleConfigGenerate}
          onClose={() => navigate('/notes')}
          isLoading={false}
          error={error}
        />
      </div>
    );
  }

  if (stage === 'loading') {
    return (
      <div className="notes-flashcards-page">
        <header className="fc-header">
          <button className="btn-back" onClick={() => navigate('/notes')}>
            &larr; Back
          </button>
          <h2>Flashcards</h2>
        </header>
        <div className="fc-loading">
          <div className="fc-spinner"></div>
          <p>Generating flashcards from your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notes-flashcards-page">
      <header className="fc-header">
        <button className="btn-back" onClick={() => navigate('/notes')}>
          &larr; Back to Notes
        </button>
        <h2>Flashcards ({cards.length})</h2>
      </header>

      <div className="fc-content">
        <div className="fc-progress">
          Card {currentIndex + 1} of {cards.length}
        </div>

        <div
          className="fc-card-container"
          onClick={handleFlip}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className={`fc-card-inner ${isFlipped ? 'flipped' : ''}`}>
            <div className="fc-card-front">
              <span className="fc-hint">Question</span>
              <p className="fc-text">{cards[currentIndex].front}</p>
              <div className="fc-tap-hint">Tap to flip</div>
            </div>
            <div className="fc-card-back">
              <span className="fc-hint">Answer</span>
              <p className="fc-text">{cards[currentIndex].back}</p>
            </div>
          </div>
        </div>

        <div className="fc-controls">
          <button className="fc-nav-btn" onClick={handlePrev} disabled={currentIndex === 0}>
            &larr; Prev
          </button>
          <button
            className="fc-nav-btn"
            onClick={handleNext}
            disabled={currentIndex === cards.length - 1}
          >
            Next &rarr;
          </button>
        </div>

        <div className="fc-actions">
          <button className="btn-secondary" onClick={handleShuffle}>
            Shuffle Cards
          </button>
          <button
            className="btn-primary"
            onClick={() => runGenerate(cardCount, { forceRefresh: true })}
          >
            Regenerate ({cardCount})
          </button>
          <button className="btn-secondary" onClick={() => setStage('config')}>
            Change count
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotesFlashcardsPage;
