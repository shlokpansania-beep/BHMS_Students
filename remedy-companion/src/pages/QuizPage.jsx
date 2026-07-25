import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import remediesData from '../data/remedies.json';
import conceptsData from '../data/concepts.json';
import principlesData from '../data/principles.json';
import QuizOption from '../components/QuizOption';
import { useQuizProgress } from '../hooks/useQuizProgress';
import { useSpacedRepetition } from '../hooks/useSpacedRepetition';
import { useActiveYear, YEAR_OPTIONS } from '../hooks/useActiveYear';
import { getRandomItems, formatPercentage, getSubjectContentType } from '../utils/helpers';
import './QuizPage.css';

const QuizPage = () => {
  const navigate = useNavigate();
  const { activeYear, activeSubject } = useActiveYear();
  const contentType = getSubjectContentType(activeSubject);
  const { recordAnswer, getStats } = useQuizProgress();
  const { getNextRemedyToReview, recordReview } = useSpacedRepetition();

  // Game states: 'config' | 'quiz' | 'results'
  const [gameState, setGameState] = useState('config');

  // Configuration settings
  const [questionCount, setQuestionCount] = useState(15);
  const [customInput, setCustomInput] = useState('');

  // Session state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionQuestions, setSessionQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);

  // Load correct active database items based on syllabus mapping
  const sourceData = contentType === 'concept'
    ? conceptsData
    : contentType === 'principle'
      ? principlesData
      : remediesData;

  const activeRemedies = activeYear === 'all'
    ? sourceData.filter(r => r.syllabus && r.syllabus.some(s => s.subject === activeSubject))
    : sourceData.filter(r => r.syllabus && r.syllabus.some(s => s.year === Number(activeYear) && s.subject === activeSubject));

  const activeYearLabel = YEAR_OPTIONS.find(opt => opt.value === activeYear)?.label || 'All Years';

  // Target count based on user choice
  const targetCount = customInput ? Math.max(1, parseInt(customInput, 10) || 1) : questionCount;
  const actualQuestionsCount = targetCount;

  // Restart quiz when year or subject switcher changes
  useEffect(() => {
    setGameState('config');
    setSessionQuestions([]);
    setUserAnswers([]);
    setCurrentQuestionIndex(0);
  }, [activeYear, activeSubject]);

  const handleStartQuiz = () => {
    if (activeRemedies.length === 0) return;

    const questions = [];
    let pool = [];

    for (let i = 0; i < actualQuestionsCount; i++) {
      // Re-populate and reshuffle pool when empty
      if (pool.length === 0) {
        pool = getRandomItems(activeRemedies, activeRemedies.length);
      }
      const correctItem = pool.pop();

      // Pick distractors from other items in the same database
      const otherItems = sourceData.filter(r => r.id !== correctItem.id);
      const distractors = getRandomItems(otherItems, 3);
      const options = getRandomItems([correctItem, ...distractors], 4);

      // Generate question details depending on content type
      let questionData = {};

      if (contentType === 'remedy') {
        const numKeynotes = Math.min(
          Math.max(2, Math.floor(Math.random() * 4)),
          correctItem.keynotes.length
        );
        const symptoms = getRandomItems(correctItem.keynotes, numKeynotes);
        
        questionData = {
          title: "Which remedy exhibits these keynotes?",
          clues: symptoms,
          correctName: correctItem.name,
          explanation: `${correctItem.name} (${correctItem.source}) keynotes include: ${correctItem.keynotes.slice(0, 3).join(', ')}.`
        };
      } else if (contentType === 'concept') {
        // Pick 2 key points
        const numPoints = Math.min(2, correctItem.key_points.length);
        const clues = getRandomItems(correctItem.key_points, numPoints);
        
        // Hide actual title in definition if present
        const titleRegex = new RegExp(correctItem.title, 'gi');
        const maskedDefinition = correctItem.definition.replace(titleRegex, '______');

        questionData = {
          title: "Which topic/concept matches this definition and key points?",
          definition: maskedDefinition,
          clues: clues,
          correctName: correctItem.title,
          explanation: `${correctItem.title}: ${correctItem.definition}`
        };
      } else if (contentType === 'principle') {
        questionData = {
          title: "Which principle/aphorism matches this explanation?",
          definition: `Explanation: "${correctItem.explanation}"`,
          clues: [],
          correctName: `Aphorism ${correctItem.aphorism_number}: ${correctItem.principle_name}`,
          explanation: `Aphorism ${correctItem.aphorism_number} is: ${correctItem.principle_name}. Example: ${correctItem.example}`
        };
      }

      questions.push({
        correctItem,
        options,
        questionData,
      });
    }

    setSessionQuestions(questions);
    setUserAnswers(new Array(questions.length).fill(null));
    setCurrentQuestionIndex(0);
    setSessionScore(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setGameState('quiz');
  };

  const handleOptionClick = (itemId) => {
    if (isAnswered) return;

    setSelectedOption(itemId);
    setIsAnswered(true);

    const currentQuestion = sessionQuestions[currentQuestionIndex];
    const isCorrect = itemId === currentQuestion.correctItem.id;

    // Record globally for statistics and spaced repetition
    recordAnswer(currentQuestion.correctItem.id, isCorrect);
    recordReview(currentQuestion.correctItem.id, isCorrect ? 5 : 0);

    // Update session score
    if (isCorrect) {
      setSessionScore((prev) => prev + 1);
    }

    setUserAnswers((prev) => {
      const updated = [...prev];
      updated[currentQuestionIndex] = itemId;
      return updated;
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex + 1 < sessionQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setGameState('results');
    }
  };

  const handlePresetSelect = (count) => {
    setQuestionCount(count);
    setCustomInput('');
  };

  const handleCustomInputChange = (val) => {
    setCustomInput(val);
  };

  const handleRetakeQuiz = () => {
    // Restart with same questions, shuffled options
    const resetQuestions = sessionQuestions.map((q) => ({
      ...q,
      options: getRandomItems(q.options, q.options.length),
    }));
    setSessionQuestions(resetQuestions);
    setUserAnswers(new Array(resetQuestions.length).fill(null));
    setCurrentQuestionIndex(0);
    setSessionScore(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setGameState('quiz');
  };

  // Rendering config state
  if (gameState === 'config') {
    return (
      <div className="quiz-page page">
        <div className="page-header">
          <h1 className="page-title">🧠 Quiz</h1>
          <p className="page-subtitle">Practice questions for {activeSubject} ({activeYearLabel.replace(' BHMS', '')})</p>
        </div>

        {activeRemedies.length === 0 ? (
          <div className="empty-flashcards-state card" style={{ maxWidth: '480px', margin: '0 auto' }}>
            <div className="empty-icon">📝</div>
            <h3>No Seeded Questions for {activeSubject}</h3>
            <p>We don't have built-in practice questions for this subject. Upload your own lecture slides or notes under the <strong>Notes</strong> tab to auto-generate custom quizzes!</p>
            <button className="go-to-notes-btn" onClick={() => navigate('/notes')}>
              Go to Notes Upload
            </button>
          </div>
        ) : (
          <div className="quiz-config-card card">
            <div className="config-header">
              <h3>Configure Your Quiz</h3>
              <p>Select the number of questions. Each question is worth 1 mark.</p>
            </div>

            <div className="preset-grid">
              {[5, 10, 15, 20].map((num) => (
                <button
                  key={num}
                  className={`preset-btn ${questionCount === num && !customInput ? 'active' : ''}`}
                  onClick={() => handlePresetSelect(num)}
                >
                  {num} Marks ({num} Qs)
                </button>
              ))}
            </div>

            <div className="custom-input-group">
              <label htmlFor="custom-marks">Or enter total marks:</label>
              <input
                id="custom-marks"
                type="number"
                min="1"
                placeholder="Enter custom marks"
                value={customInput}
                onChange={(e) => handleCustomInputChange(e.target.value)}
              />
            </div>

            <button
              className="start-quiz-btn"
              onClick={handleStartQuiz}
              disabled={activeRemedies.length === 0}
            >
              {activeRemedies.length === 0 ? 'No remedies in this year' : `Start Practice Quiz (${actualQuestionsCount} Marks)`}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Rendering results state
  if (gameState === 'results') {
    const percentage = Math.round((sessionScore / sessionQuestions.length) * 100);
    return (
      <div className="quiz-page page">
        <div className="page-header">
          <h1 className="page-title">🏆 Quiz Results</h1>
          <p className="page-subtitle">{activeSubject} Practice Session</p>
        </div>

        <div className="quiz-results-card card">
          <div className="results-ring-container">
            <div className={`results-ring ${percentage >= 70 ? 'good' : percentage >= 40 ? 'ok' : 'poor'}`}>
              <span className="results-percentage">{percentage}%</span>
              <span className="results-marks">{sessionScore} / {sessionQuestions.length} Marks</span>
            </div>
          </div>

          <div className="results-verdict">
            <h3>
              {percentage >= 70 ? 'Excellent Prep!' : percentage >= 40 ? 'Keep Reviewing!' : 'Needs Revision!'}
            </h3>
            <p>All questions are saved to your spaced repetition history to help target weak topics.</p>
          </div>

          <div className="results-actions">
            <button className="results-btn primary" onClick={handleRetakeQuiz}>
              Retake This Quiz
            </button>
            <button className="results-btn secondary" onClick={() => setGameState('config')}>
              New Quiz Config
            </button>
          </div>
        </div>

        <section className="quiz-summary-section">
          <h3 className="section-label">Question Breakdown</h3>
          <div className="summary-list">
            {sessionQuestions.map((q, idx) => {
              const userAnswerId = userAnswers[idx];
              const isCorrect = userAnswerId === q.correctItem.id;
              
              // Find option name matching option ID
              const correctName = q.questionData.correctName;
              const userAnswerName = q.options.find(opt => opt.id === userAnswerId)?.title 
                || q.options.find(opt => opt.id === userAnswerId)?.name 
                || q.options.find(opt => opt.id === userAnswerId)?.principle_name
                || 'Unanswered';

              return (
                <div key={idx} className={`summary-item ${isCorrect ? 'correct' : 'wrong'}`}>
                  <div className="summary-q-header">
                    <h4>Question {idx + 1}</h4>
                    <span className={`status-badge ${isCorrect ? 'correct' : 'wrong'}`}>
                      {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>
                  <div className="summary-q-body">
                    <p className="summary-hint">Question detail:</p>
                    {q.questionData.definition && (
                      <p className="summary-def-hint"><em>{q.questionData.definition}</em></p>
                    )}
                    {q.questionData.clues && q.questionData.clues.length > 0 && (
                      <ul className="summary-symptoms">
                        {q.questionData.clues.map((s, sIdx) => <li key={sIdx}>{s}</li>)}
                      </ul>
                    )}
                    <div className="summary-answer-details">
                      <div className="answer-line">
                        <strong>Correct Answer:</strong> <span className="text-success">{correctName}</span>
                      </div>
                      {!isCorrect && (
                        <div className="answer-line">
                          <strong>Your Answer:</strong> <span className="text-danger">{userAnswerName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  // Rendering active quiz state
  const currentQuestion = sessionQuestions[currentQuestionIndex];
  if (!currentQuestion) return <div className="quiz-page page">Loading...</div>;

  return (
    <div className="quiz-page page">
      <header className="quiz-header">
        <div className="quiz-score">
          Question {currentQuestionIndex + 1} of {sessionQuestions.length} ({currentQuestionIndex} / {sessionQuestions.length} Marks)
        </div>
        <div className="quiz-score-live">
          Score: {sessionScore} Marks
        </div>
      </header>

      {/* Modern thin progress bar */}
      <div className="quiz-progress-bar-container">
        <div 
          className="quiz-progress-bar" 
          style={{ width: `${((currentQuestionIndex + (isAnswered ? 1 : 0)) / sessionQuestions.length) * 100}%` }}
        />
      </div>

      <div className="quiz-card">
        <h3>{currentQuestion.questionData.title}</h3>
        {currentQuestion.questionData.definition && (
          <p className="quiz-question-definition"><em>{currentQuestion.questionData.definition}</em></p>
        )}
        {currentQuestion.questionData.clues && currentQuestion.questionData.clues.length > 0 && (
          <ul className="symptoms-list">
            {currentQuestion.questionData.clues.map((clue, idx) => (
              <li key={idx}>{clue}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="options-container">
        {currentQuestion.options.map((option, idx) => {
          let status = 'default';
          if (isAnswered) {
            if (option.id === currentQuestion.correctItem.id) {
              status = 'correct';
            } else if (option.id === selectedOption) {
              status = 'wrong';
            }
          }

          // Adapt option text based on content type
          const optionText = option.name 
            || option.title 
            || `Aphorism ${option.aphorism_number}: ${option.principle_name}`;

          return (
            <QuizOption
              key={option.id}
              option={{ ...option, name: optionText }}
              status={status}
              index={idx}
              onClick={() => handleOptionClick(option.id)}
              disabled={isAnswered}
            />
          );
        })}
      </div>

      {isAnswered && (
        <div className="quiz-feedback">
          <p className={`feedback-message ${selectedOption === currentQuestion.correctItem.id ? 'success' : 'error'}`}>
            {selectedOption === currentQuestion.correctItem.id 
              ? '🌿 Correct!' 
              : `Incorrect.`
            }
          </p>
          <p className="feedback-explanation">
            <em>{currentQuestion.questionData.explanation}</em>
          </p>
          <button className="next-btn" onClick={handleNext}>
            {currentQuestionIndex + 1 === sessionQuestions.length ? 'Finish Quiz' : 'Next Question'}
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizPage;
