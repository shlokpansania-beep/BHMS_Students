import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import remediesData from '../data/remedies.json';
import conceptsData from '../data/concepts.json';
import principlesData from '../data/principles.json';
import { searchRemedies } from '../utils/search';
import SearchBar from '../components/SearchBar';
import RemedyDetail from '../components/RemedyDetail';
import { useActiveYear } from '../hooks/useActiveYear';
import { getSubjectContentType } from '../utils/helpers';
import './SearchPage.css';

const SearchPage = () => {
  const navigate = useNavigate();
  const { activeYear, activeSubject } = useActiveYear();
  const contentType = getSubjectContentType(activeSubject);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [results, setResults] = useState([]);
  const [selectedRemedy, setSelectedRemedy] = useState(null);

  // Load correct active database items based on syllabus mapping
  const sourceData = contentType === 'concept'
    ? conceptsData
    : contentType === 'principle'
      ? principlesData
      : remediesData;

  const activeRemedies = activeYear === 'all'
    ? sourceData.filter(r => r.syllabus && r.syllabus.some(s => s.subject === activeSubject))
    : sourceData.filter(r => r.syllabus && r.syllabus.some(s => s.year === Number(activeYear) && s.subject === activeSubject));

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim() && activeRemedies.length > 0) {
        const searchResults = searchRemedies(activeRemedies, query, filter, contentType);
        setResults(searchResults);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, filter, activeYear, activeSubject, contentType, activeRemedies]);

  const getItemLabel = (item) => {
    if (!item) return '';
    if (contentType === 'remedy') return item.name;
    if (contentType === 'concept') return item.title;
    if (contentType === 'principle') return `Aphorism ${item.aphorism_number}: ${item.principle_name}`;
    return '';
  };

  const getItemDetails = (item) => {
    if (!item) return null;
    // Map concept and principle fields into detail-modal shape for backward compatibility
    if (contentType === 'concept') {
      return {
        id: item.id,
        name: item.title,
        source: 'Topic / Concept',
        keynotes: item.key_points || [],
        mind_symptoms: [item.definition],
        modalities: { worse: [], better: [] },
        common_uses: item.related_terms || [],
        related_remedies: []
      };
    }
    if (contentType === 'principle') {
      return {
        id: item.id,
        name: `Aphorism ${item.aphorism_number}: ${item.principle_name}`,
        source: 'Organon Principle',
        keynotes: [item.explanation],
        mind_symptoms: item.example ? [`Example: ${item.example}`] : [],
        modalities: { worse: [], better: [] },
        common_uses: [],
        related_remedies: []
      };
    }
    return item;
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <SearchBar 
          value={query}
          onChange={setQuery}
          placeholder={`Search ${activeSubject} topics...`}
        />
        {contentType === 'remedy' && (
          <div className="filter-tabs">
            {['all', 'mind', 'modalities', 'physical'].map(tab => (
              <button 
                key={tab}
                className={`filter-tab ${filter === tab ? 'active' : ''}`}
                onClick={() => setFilter(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {activeRemedies.length === 0 ? (
        <div className="empty-flashcards-state card" style={{ maxWidth: '480px', margin: '0 auto', width: '100%' }}>
          <div className="empty-icon">📝</div>
          <h3>No Seeded Data for {activeSubject}</h3>
          <p>We don't have built-in research topics for this subject. Upload your own lecture slides, notes, or PDFs under the <strong>Notes</strong> tab to search through generated topics!</p>
          <button className="go-to-notes-btn" onClick={() => navigate('/notes')}>
            Go to Notes Upload
          </button>
        </div>
      ) : (
        <div className="search-results">
          {!query.trim() && (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <p>Type a symptom, term, or topic to search...</p>
            </div>
          )}

          {query.trim() && results.length === 0 && (
            <div className="empty-state">
              <p>No results found for "{query}"</p>
            </div>
          )}

          {results.map(({ remedy, score, matchedFields }) => (
            <div 
              key={remedy.id} 
              className="result-card"
              onClick={() => setSelectedRemedy(remedy)}
            >
              <div className="result-header">
                <h3 className="remedy-name">{getItemLabel(remedy)}</h3>
                <span className="score-badge">Score: {score}</span>
              </div>
              {matchedFields.length > 0 && (
                <div className="matched-fields">
                  Matches in: {matchedFields.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedRemedy && (
        <RemedyDetail 
          remedy={getItemDetails(selectedRemedy)} 
          onClose={() => setSelectedRemedy(null)} 
        />
      )}
    </div>
  );
};

export default SearchPage;
