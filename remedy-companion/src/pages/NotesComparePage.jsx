import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useNotesStore } from '../hooks/useNotesStore';
import { compareTopics } from '../utils/apiClient';
import './NotesComparePage.css';

const NotesComparePage = () => {
  const navigate = useNavigate();
  const { document } = useNotesStore();

  const [topicA, setTopicA] = useState('');
  const [topicB, setTopicB] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  // Redirect if no document loaded
  useEffect(() => {
    if (!document) {
      navigate('/notes');
    }
  }, [document, navigate]);

  if (!document) return null;

  const handleCompare = async (e) => {
    e.preventDefault();
    if (!topicA.trim() || !topicB.trim()) {
      setError('Please enter both topics to compare.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await compareTopics(document.text, topicA.trim(), topicB.trim());
      setResult(response);
    } catch (err) {
      setError(err.message || 'Failed to generate comparison. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderComparisonText = (text) => {
    if (!text) return null;
    return text.split('\n').map((para, idx) => {
      const trimmed = para.trim();
      if (!trimmed) return null;

      // Handle bullet points
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        return (
          <li key={idx} className="md-bullet">
            {parseBold(trimmed.substring(1).trim())}
          </li>
        );
      }

      // Handle headings
      if (trimmed.startsWith('###')) {
        return <h4 key={idx} className="md-h4">{parseBold(trimmed.replace('###', '').trim())}</h4>;
      }
      if (trimmed.startsWith('##')) {
        return <h3 key={idx} className="md-h3">{parseBold(trimmed.replace('##', '').trim())}</h3>;
      }

      return <p key={idx} className="md-para">{parseBold(trimmed)}</p>;
    });
  };

  const parseBold = (text) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        return <strong key={idx}>{part}</strong>;
      }
      return part;
    });
  };

  const isHtmlTable = result?.table && (result.table.trim().startsWith('<table') || result.table.trim().includes('</table>'));

  return (
    <div className="notes-compare-page page">
      <div className="notes-back-link">
        <Link to="/notes">← Back to Notes</Link>
      </div>

      <div className="page-header">
        <h1 className="page-title">⚖️ Compare Topics</h1>
        <p className="page-subtitle">Compare two concepts side-by-side using AI based on your notes</p>
      </div>

      <div className="compare-form-card card">
        <form onSubmit={handleCompare}>
          <div className="input-fields-row">
            <div className="compare-input-group">
              <label htmlFor="topic-a">First Topic / Term</label>
              <input
                id="topic-a"
                type="text"
                placeholder="e.g. Erythropoiesis"
                value={topicA}
                onChange={(e) => setTopicA(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <span className="compare-vs">VS</span>
            <div className="compare-input-group">
              <label htmlFor="topic-b">Second Topic / Term</label>
              <input
                id="topic-b"
                type="text"
                placeholder="e.g. Leukopoiesis"
                value={topicB}
                onChange={(e) => setTopicB(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {error && <div className="compare-error-banner">{error}</div>}

          <button type="submit" className="compare-submit-btn" disabled={isLoading}>
            {isLoading ? 'Comparing with AI...' : 'Compare with AI'}
          </button>
        </form>
      </div>

      {isLoading && (
        <div className="compare-loading-container">
          <div className="loader-dots">
            <div className="loader-dot"></div>
            <div className="loader-dot"></div>
            <div className="loader-dot"></div>
          </div>
          <p>Analyzing document content and drafting comparison...</p>
        </div>
      )}

      {result && (
        <div className="compare-results-container fade-in">
          {result.summary && (
            <div className="compare-summary-card card">
              <h4>🌿 Key Takeaway</h4>
              <p>{result.summary}</p>
            </div>
          )}

          {result.table && (
            <div className="compare-table-card card">
              <h4>📋 Side-by-Side Analysis</h4>
              {isHtmlTable ? (
                <div 
                  className="compare-html-table-wrapper"
                  dangerouslySetInnerHTML={{ __html: result.table }} 
                />
              ) : (
                <pre className="compare-fallback-table">{result.table}</pre>
              )}
            </div>
          )}

          {result.comparison && (
            <div className="compare-detail-card card">
              <h4>💡 Detailed Review</h4>
              <div className="detailed-review-content">
                {renderComparisonText(result.comparison)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotesComparePage;
