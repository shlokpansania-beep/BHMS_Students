import { normalizeAnswerLetter } from '../utils/quizHelpers';
import './QuizResults.css';

const QuizResults = ({ questions = [], userAnswers = [], score = 0, total = 0, onRetake, onNewQuiz, onBack }) => {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  let scoreClass = 'score-poor';
  if (percentage >= 70) scoreClass = 'score-good';
  else if (percentage >= 40) scoreClass = 'score-ok';

  return (
    <div className="quiz-results">
      <div className="results-header">
        <div className={`score-display ${scoreClass}`}>
          <div className="score-ring">
            <svg viewBox="0 0 120 120" className="ring-svg">
              <circle cx="60" cy="60" r="52" className="ring-bg" />
              <circle
                cx="60" cy="60" r="52"
                className="ring-fill"
                strokeDasharray={`${percentage * 3.27} 327`}
                strokeDashoffset="0"
              />
            </svg>
            <span className="score-percent">{percentage}%</span>
          </div>
          <h2 className="score-text">You scored {score} / {total}</h2>
          <p className="score-label">
            {percentage >= 70 ? '🎉 Great job!' : percentage >= 40 ? '👍 Keep practicing!' : '📚 Review and try again!'}
          </p>
        </div>
      </div>

      {questions.length > 0 && (
        <div className="questions-breakdown">
          <h3 className="section-label">Question Breakdown</h3>
          {questions.map((q, index) => {
            const userAnswer = userAnswers[index];
            const isCorrect =
              normalizeAnswerLetter(userAnswer) === normalizeAnswerLetter(q.correctAnswer);

            return (
              <div key={index} className={`breakdown-card ${isCorrect ? 'is-correct' : 'is-wrong'}`}>
                <div className="breakdown-header">
                  <span className="q-number">Q{index + 1}</span>
                  <span className="q-status">{isCorrect ? '✅ Correct' : '❌ Wrong'}</span>
                </div>
                <p className="q-text">{q.question}</p>

                <div className="answer-info">
                  <p className={`your-answer ${isCorrect ? 'correct' : 'wrong'}`}>
                    <strong>Your answer:</strong> {userAnswer || 'Skipped'}
                  </p>
                  {!isCorrect && (
                    <p className="correct-answer">
                      <strong>Correct answer:</strong> {q.correctAnswer}
                    </p>
                  )}
                </div>

                {q.explanation && (
                  <p className="q-explanation">
                    <strong>💡</strong> {q.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="results-actions">
        <button className="btn-retake" onClick={onRetake}>Retake This Quiz</button>
        <button className="btn-new" onClick={onNewQuiz}>Generate New Quiz</button>
        <button className="btn-back-link" onClick={onBack}>Back to Notes</button>
      </div>
    </div>
  );
};

export default QuizResults;
