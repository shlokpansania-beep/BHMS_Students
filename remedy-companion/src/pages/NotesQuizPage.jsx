import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotesStore } from '../hooks/useNotesStore';
import { generateQuiz } from '../utils/apiClient';
import { getOptionLetter, getOptionDisplayText, normalizeAnswerLetter } from '../utils/quizHelpers';
import QuizConfig from '../components/QuizConfig';
import QuizResults from '../components/QuizResults';
import QuizOption from '../components/QuizOption';
import './QuizPage.css'; // Import QuizPage styles directly for consistent layout
import './NotesQuizPage.css';

const LETTERS = ['A', 'B', 'C', 'D'];

function scoreAnswers(questions, answers) {
  return questions.reduce(
    (acc, q, i) => acc + (normalizeAnswerLetter(answers[i]) === normalizeAnswerLetter(q.correctAnswer) ? 1 : 0),
    0
  );
}

const NotesQuizPage = () => {
  const navigate = useNavigate();
  const { document, saveQuiz } = useNotesStore();

  const [stage, setStage] = useState('config'); // config | loading | quiz | results
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!document) navigate('/notes');
  }, [document, navigate]);

  const handleGenerate = async ({ questionCount }) => {
    setStage('loading');
    setError('');
    try {
      const result = await generateQuiz(document.text, questionCount, 'mcq');
      if (!result.questions || result.questions.length === 0) {
        throw new Error('No questions were generated. Try a different document.');
      }
      const normalized = result.questions.map((q) => ({
        ...q,
        correctAnswer: normalizeAnswerLetter(q.correctAnswer),
      }));
      setQuestions(normalized);
      setCurrentIndex(0);
      setUserAnswers([]);
      setSelectedAnswer(null);
      setRevealed(false);
      setSessionScore(0);
      setStage('quiz');
    } catch (err) {
      setError(err.message);
      setStage('config');
    }
  };

  const handleSelectOption = (letter) => {
    if (revealed) return;
    const normalized = normalizeAnswerLetter(letter);
    setSelectedAnswer(normalized);
    setRevealed(true);
    setUserAnswers((prev) => [...prev, normalized]);

    const q = questions[currentIndex];
    if (normalized === q.correctAnswer) {
      setSessionScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setRevealed(false);
    } else {
      const finalAnswers = [...userAnswers];
      const finalScore = scoreAnswers(questions, finalAnswers);

      saveQuiz({
        fileName: document.fileName,
        questionCount: questions.length,
        score: finalScore,
        total: questions.length,
        questions,
        userAnswers: finalAnswers,
      });
      setStage('results');
    }
  };

  const handleRetake = () => {
    setCurrentIndex(0);
    setUserAnswers([]);
    setSelectedAnswer(null);
    setRevealed(false);
    setSessionScore(0);
    setStage('quiz');
  };

  if (!document) return null;

  // ─── Config Stage ───
  if (stage === 'config') {
    return (
      <div className="quiz-page page">
        <div className="page-header">
          <button className="btn-back-link" onClick={() => navigate('/notes')} style={{ marginBottom: '16px', display: 'block' }}>← Back to Notes</button>
          <h1 className="page-title">🧠 Quiz from Notes</h1>
          <p className="page-subtitle">Test your knowledge of "{document.fileName}"</p>
        </div>
        {error && <div className="notes-error">{error}</div>}
        <QuizConfig
          onGenerate={handleGenerate}
          onClose={() => navigate('/notes')}
          isLoading={false}
          error={error}
        />
      </div>
    );
  }

  // ─── Loading Stage ───
  if (stage === 'loading') {
    return (
      <div className="quiz-page page loading-page" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div className="loading-container" style={{ textAlign: 'center' }}>
          <div className="quiz-spinner" style={{ margin: '0 auto 16px auto' }}></div>
          <h2>Generating quiz from your notes...</h2>
          <p className="text-muted">This may take 15–30 seconds</p>
        </div>
      </div>
    );
  }

  // ─── Results Stage ───
  if (stage === 'results') {
    return (
      <div className="quiz-page page">
        <QuizResults
          questions={questions}
          userAnswers={userAnswers}
          score={sessionScore}
          total={questions.length}
          onRetake={handleRetake}
          onNewQuiz={() => setStage('config')}
          onBack={() => navigate('/notes')}
        />
      </div>
    );
  }

  // ─── Quiz Stage ───
  const q = questions[currentIndex];

  return (
    <div className="quiz-page page">
      <header className="quiz-header">
        <div className="quiz-score">
          Question {currentIndex + 1} of {questions.length} ({currentIndex} / {questions.length} Marks)
        </div>
        <div className="quiz-score-live">
          Score: {sessionScore} Marks
        </div>
      </header>

      {/* Modern thin progress bar */}
      <div className="quiz-progress-bar-container">
        <div 
          className="quiz-progress-bar" 
          style={{ width: `${((currentIndex + (revealed ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      <div className="quiz-card">
        <h3>🌱 Question</h3>
        <p className="quiz-question-definition" style={{ borderLeftColor: 'var(--color-accent)' }}>
          {q.question}
        </p>
      </div>

      <div className="options-container">
        {q.options.map((option, idx) => {
          const letter = getOptionLetter(option, idx);
          let status = 'default';
          if (revealed) {
            if (letter === q.correctAnswer) {
              status = 'correct';
            } else if (letter === selectedAnswer) {
              status = 'wrong';
            }
          }

          return (
            <QuizOption
              key={idx}
              option={{ id: letter, name: getOptionDisplayText(option) }}
              status={status}
              index={idx}
              onClick={() => handleSelectOption(letter)}
              disabled={revealed}
            />
          );
        })}
      </div>

      {revealed && (
        <div className="quiz-feedback">
          <p className={`feedback-message ${selectedAnswer === q.correctAnswer ? 'success' : 'error'}`}>
            {selectedAnswer === q.correctAnswer 
              ? '🌿 Correct!' 
              : `Incorrect.`
            }
          </p>
          {q.explanation && (
            <p className="feedback-explanation">
              <em>{q.explanation}</em>
            </p>
          )}
          <button className="next-btn" onClick={handleNext}>
            {currentIndex + 1 === questions.length ? 'Finish Quiz' : 'Next Question'}
          </button>
        </div>
      )}
    </div>
  );
};

export default NotesQuizPage;
