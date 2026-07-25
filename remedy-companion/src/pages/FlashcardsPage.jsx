import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import remediesData from '../data/remedies.json';
import conceptsData from '../data/concepts.json';
import principlesData from '../data/principles.json';
import FlashCard from '../components/FlashCard';
import { shuffleArray, getSubjectContentType } from '../utils/helpers';
import { useSpacedRepetition } from '../hooks/useSpacedRepetition';
import { useActiveYear } from '../hooks/useActiveYear';
import './FlashcardsPage.css';

const FlashcardsPage = () => {
  const navigate = useNavigate();
  const { activeYear, activeSubject } = useActiveYear();
  const contentType = getSubjectContentType(activeSubject);

  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState('All');
  const [isFlipped, setIsFlipped] = useState(false);
  const { recordReview } = useSpacedRepetition();

  // For touch swipe
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    // Select correct database source
    let sourceData = remediesData;
    if (contentType === 'concept') {
      sourceData = conceptsData;
    } else if (contentType === 'principle') {
      sourceData = principlesData;
    }

    let filtered = sourceData;
    
    // Filter by active BHMS year and subject
    if (activeYear === 'all') {
      filtered = filtered.filter(r => 
        r.syllabus && r.syllabus.some(s => s.subject === activeSubject)
      );
    } else {
      filtered = filtered.filter(r => 
        r.syllabus && r.syllabus.some(s => s.year === Number(activeYear) && s.subject === activeSubject)
      );
    }
    
    // Filter by plant/animal/mineral (only applies to remedies)
    if (contentType === 'remedy' && filter !== 'All') {
      filtered = filtered.filter(r => 
        r.source?.toLowerCase().startsWith(filter.toLowerCase())
      );
    }
    
    setItems(filtered);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [filter, activeYear, activeSubject, contentType]);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleShuffle = () => {
    setItems(shuffleArray([...items]));
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleFeedback = (quality) => {
    const currentItem = items[currentIndex];
    recordReview(currentItem.id, quality);
    handleNext();
  };

  const onTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      handleNext();
    }
    if (touchStartX.current - touchEndX.current < -50) {
      handlePrev();
    }
  };

  const currentItem = items[currentIndex] || null;

  return (
    <div className="flashcards-page">
      <header className="flashcards-header">
        <div className="flashcards-controls">
          {contentType === 'remedy' && (
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="flashcards-filter">
              <option value="All">All</option>
              <option value="Plant">Plant</option>
              <option value="Animal">Animal</option>
              <option value="Mineral">Mineral</option>
            </select>
          )}
          {items.length > 0 && (
            <button className="shuffle-btn" onClick={handleShuffle}>Shuffle</button>
          )}
        </div>
        <div className="flashcards-progress">
          {items.length > 0 ? `Card ${currentIndex + 1} of ${items.length}` : 'No cards'}
        </div>
      </header>

      {items.length === 0 ? (
        <div className="empty-flashcards-state card">
          <div className="empty-icon">📝</div>
          <h3>No Seeded Cards for {activeSubject}</h3>
          <p>We don't have built-in data for this subject. Upload your own lecture slides, notes, or PDFs under the <strong>Notes</strong> tab to auto-generate custom study flashcards!</p>
          <button className="go-to-notes-btn" onClick={() => navigate('/notes')}>
            Go to Notes Upload
          </button>
        </div>
      ) : (
        <>
          <div 
            className="flashcards-container"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <button className="nav-arrow prev-arrow" onClick={handlePrev} aria-label="Previous card">&lt;</button>
            
            <div className="card-wrapper" onClick={() => setIsFlipped(!isFlipped)}>
                <FlashCard item={currentItem} type={contentType} isFlipped={isFlipped} />
            </div>

            <button className="nav-arrow next-arrow" onClick={handleNext} aria-label="Next card">&gt;</button>
          </div>

          {isFlipped && (
            <div className="feedback-controls">
              <button className="feedback-btn error" onClick={() => handleFeedback(0)}>Still learning ✗</button>
              <button className="feedback-btn success" onClick={() => handleFeedback(5)}>I knew it ✓</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FlashcardsPage;
