import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotesStore } from '../hooks/useNotesStore';
import FileUpload from '../components/FileUpload';
import { useActiveYear, YEAR_OPTIONS } from '../hooks/useActiveYear';
import { extractTextFromPDF } from '../utils/pdfParser';
import { extractTextFromPPTX } from '../utils/pptxParser';
import './NotesPage.css';

const NotesPage = () => {
  const navigate = useNavigate();
  const { document, quizHistory, loadDocument, clearDocument, deleteQuiz } = useNotesStore();
  const { activeYear, activeSubject, setActiveYear } = useActiveYear();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = async (file) => {
    setError('');
    setIsLoading(true);
    try {
      const fileName = file.name;
      const ext = fileName.split('.').pop().toLowerCase();

      let parsedData;
      if (ext === 'pdf') {
        parsedData = await extractTextFromPDF(file);
      } else if (ext === 'pptx') {
        parsedData = await extractTextFromPPTX(file);
      } else {
        throw new Error('Unsupported file type. Please upload a PDF or PPTX file.');
      }

      if (!parsedData.text || parsedData.text.trim().length < 50) {
        throw new Error('Could not extract enough text from this document. It may be a scanned/image-based file.');
      }

      loadDocument({
        fileName,
        fileType: ext,
        text: parsedData.text,
        pageCount: parsedData.pageCount || parsedData.slideCount,
      });
    } catch (err) {
      setError(err.message || 'Failed to process document.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get active year label
  const activeYearLabel = YEAR_OPTIONS.find(opt => opt.value === activeYear)?.label || 'All Years';

  // Helper to render history item structure
  const renderHistoryItem = (quiz) => (
    <div key={quiz.id} className="history-item animate-fade-in">
      <div className="history-main">
        <div className="history-info">
          <span className="history-file">{quiz.fileName}</span>
          <span className="history-date">
            {new Date(quiz.completedAt).toLocaleDateString()}
          </span>
        </div>
        <div className="history-score">
          <span className={`score-value ${quiz.percentage >= 70 ? 'good' : quiz.percentage >= 40 ? 'ok' : 'poor'}`}>
            {quiz.score}/{quiz.total} ({quiz.percentage}%)
          </span>
        </div>
      </div>
      <button 
        className="history-delete" 
        onClick={() => deleteQuiz(quiz.id)}
        title="Delete quiz record"
        aria-label="Delete quiz record"
      >
        🗑️
      </button>
    </div>
  );

  // If in 'All Years' view and no document loaded, prompt them to choose a year
  if (activeYear === 'all' && !document) {
    return (
      <div className="notes-page page">
        <div className="page-header">
          <h1 className="page-title">📝 My Notes</h1>
          <p className="page-subtitle">Upload your study materials to generate AI quizzes, flashcards, and Q&A.</p>
        </div>

        <div className="select-year-prompt card">
          <div className="prompt-icon">🎓</div>
          <h3>Select your academic year</h3>
          <p>Notes quizzes, flashcards, and Q&A are organized by academic year. Please choose your year from the dropdown at the top right to start uploading.</p>
          <div className="prompt-quick-picks">
            {YEAR_OPTIONS.filter(opt => opt.value !== 'all').map(opt => (
              <button
                key={opt.value}
                className="prompt-year-btn"
                onClick={() => setActiveYear(opt.value)}
              >
                {opt.label.replace(' BHMS', '')}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // No document loaded — show upload
  if (!document) {
    return (
      <div className="notes-page page">
        <div className="page-header">
          <h1 className="page-title">📝 My Notes ({activeYearLabel.replace(' BHMS', '')})</h1>
          <p className="page-subtitle">Upload your study materials to generate AI quizzes, flashcards, and Q&A.</p>
        </div>

        {error && <div className="notes-error">{error}</div>}

        <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />

        {quizHistory && quizHistory.length > 0 && (
          <section className="quiz-history-section">
            <h3 className="section-label">Past Quizzes</h3>
            <div className="history-list">
              {quizHistory.map(renderHistoryItem)}
            </div>
          </section>
        )}
      </div>
    );
  }

  // Document loaded — show actions
  return (
    <div className="notes-page page">
      <div className="page-header">
        <h1 className="page-title">📝 My Notes</h1>
      </div>

      <section className="document-info-card">
        <div className="doc-header">
          <div className="doc-icon">
            {document.fileType === 'pdf' ? '📄' : '📊'}
          </div>
          <div className="doc-details">
            <h2 className="doc-title">{document.fileName}</h2>
            <div className="doc-meta">
              <span className={`type-badge ${document.fileType}`}>
                {document.fileType.toUpperCase()}
              </span>
              <span className="page-count">
                {document.pageCount} {document.fileType === 'pdf' ? 'pages' : 'slides'}
              </span>
              <span className="doc-year-badge">
                {activeYearLabel.replace(' BHMS', '')} - {activeSubject}
              </span>
            </div>
          </div>
        </div>
        <div className="doc-preview">
          <p>{document.text.substring(0, 200)}...</p>
        </div>
      </section>

      <section className="action-buttons-grid">
        <button className="action-card" onClick={() => navigate('/notes/quiz')}>
          <span className="action-icon">🧠</span>
          <h3>Generate Quiz</h3>
          <p>Test your knowledge with AI-generated MCQs</p>
        </button>

        <button className="action-card" onClick={() => navigate('/notes/flashcards')}>
          <span className="action-icon">📇</span>
          <h3>Generate Flashcards</h3>
          <p>Review key terms and concepts quickly</p>
        </button>

        <button className="action-card" onClick={() => navigate('/notes/qa')}>
          <span className="action-icon">💬</span>
          <h3>Ask a Question</h3>
          <p>Chat with your document for instant answers</p>
        </button>

        <button className="action-card" onClick={() => navigate('/notes/compare')}>
          <span className="action-icon">⚖️</span>
          <h3>Compare Topics</h3>
          <p>Compare two concepts side-by-side using AI</p>
        </button>
      </section>

      <div className="remove-doc-container">
        <button className="btn-remove-doc" onClick={clearDocument}>
          Remove Document
        </button>
      </div>

      {quizHistory && quizHistory.length > 0 && (
        <section className="quiz-history-section">
          <h3 className="section-label">Past Quizzes</h3>
          <div className="history-list">
            {quizHistory.map(renderHistoryItem)}
          </div>
        </section>
      )}
    </div>
  );
};

export default NotesPage;
