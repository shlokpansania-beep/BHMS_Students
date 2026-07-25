import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import remediesData from '../data/remedies.json';
import conceptsData from '../data/concepts.json';
import principlesData from '../data/principles.json';
import CompareView from '../components/CompareView';
import { useActiveYear } from '../hooks/useActiveYear';
import { getSubjectContentType } from '../utils/helpers';
import './ComparePage.css';

const QUICK_PICKS = [
  { id: 1, name: 'Pulsatilla vs Sepia', ids: ['pulsatilla', 'sepia'], subject: 'Materia Medica' },
  { id: 2, name: 'Nux Vomica vs Bryonia', ids: ['nux-vomica', 'bryonia-alba'], subject: 'Materia Medica' },
  { id: 3, name: 'Arsenicum vs Phosphorus', ids: ['arsenicum-album', 'phosphorus'], subject: 'Materia Medica' },
  { id: 4, name: 'Rhus Tox vs Bryonia', ids: ['rhus-toxicodendron', 'bryonia-alba'], subject: 'Materia Medica' },
  { id: 5, name: 'Ignatia vs Natrum Mur', ids: ['ignatia-amara', 'natrum-muriaticum'], subject: 'Materia Medica' },
  { id: 6, name: 'Belladonna vs Aconitum', ids: ['belladonna', 'aconitum-napellus'], subject: 'Materia Medica' },
];

const ComparePage = () => {
  const navigate = useNavigate();
  const { activeYear, activeSubject } = useActiveYear();
  const contentType = getSubjectContentType(activeSubject);

  const [remedy1Id, setRemedy1Id] = useState('');
  const [remedy2Id, setRemedy2Id] = useState('');

  // Load correct active database items based on syllabus mapping
  const sourceData = contentType === 'concept'
    ? conceptsData
    : contentType === 'principle'
      ? principlesData
      : remediesData;

  const activeRemedies = activeYear === 'all'
    ? sourceData.filter(r => r.syllabus && r.syllabus.some(s => s.subject === activeSubject))
    : sourceData.filter(r => r.syllabus && r.syllabus.some(s => s.year === Number(activeYear) && s.subject === activeSubject));

  // Only show quick-picks if we are in Materia Medica subject
  const activeQuickPicks = contentType === 'remedy'
    ? QUICK_PICKS.filter(pick => {
        return pick.subject === activeSubject && pick.ids.every(id => activeRemedies.some(r => r.id === id));
      })
    : [];

  // Reset selection if they don't belong to the active year/subject when switching
  useEffect(() => {
    if (remedy1Id && !activeRemedies.some(r => r.id === remedy1Id)) setRemedy1Id('');
    if (remedy2Id && !activeRemedies.some(r => r.id === remedy2Id)) setRemedy2Id('');
  }, [activeYear, activeSubject, activeRemedies, remedy1Id, remedy2Id]);

  const remedyA = activeRemedies.find(r => r.id === remedy1Id);
  const remedyB = activeRemedies.find(r => r.id === remedy2Id);

  const handleQuickPick = (ids) => {
    setRemedy1Id(ids[0]);
    setRemedy2Id(ids[1]);
  };

  const getItemLabel = (item) => {
    if (!item) return '';
    if (contentType === 'remedy') return item.name;
    if (contentType === 'concept') return item.title;
    if (contentType === 'principle') return `Aphorism ${item.aphorism_number}: ${item.principle_name}`;
    return '';
  };

  return (
    <div className="compare-page page">
      <div className="page-header">
        <h1 className="page-title">⚖️ Compare</h1>
        <p className="page-subtitle">Side-by-side comparison of topics in {activeSubject}</p>
      </div>

      {activeRemedies.length === 0 ? (
        <div className="empty-flashcards-state card" style={{ maxWidth: '480px', margin: '0 auto' }}>
          <div className="empty-icon">📝</div>
          <h3>No Seeded Topics for {activeSubject}</h3>
          <p>We don't have built-in data for this subject. Upload your own lecture slides, notes, or PDFs under the <strong>Notes</strong> tab to compare generated topics!</p>
          <button className="go-to-notes-btn" onClick={() => navigate('/notes')}>
            Go to Notes Upload
          </button>
        </div>
      ) : (
        <>
          <div className="compare-selectors">
            <div className="selectors">
              <select 
                value={remedy1Id} 
                onChange={(e) => setRemedy1Id(e.target.value)}
                className="remedy-select"
              >
                <option value="">Select Item 1</option>
                {activeRemedies.map(r => (
                  <option key={r.id} value={r.id}>{getItemLabel(r)}</option>
                ))}
              </select>
              <span className="vs-badge">VS</span>
              <select 
                value={remedy2Id} 
                onChange={(e) => setRemedy2Id(e.target.value)}
                className="remedy-select"
              >
                <option value="">Select Item 2</option>
                {activeRemedies.map(r => (
                  <option key={r.id} value={r.id}>{getItemLabel(r)}</option>
                ))}
              </select>
            </div>

            {activeQuickPicks.length > 0 && (
              <div className="quick-picks">
                <p className="section-label">Quick Comparisons</p>
                <div className="quick-picks-list">
                  {activeQuickPicks.map(pick => (
                    <button 
                      key={pick.id} 
                      className={`quick-pick-pill ${
                        remedy1Id === pick.ids[0] && remedy2Id === pick.ids[1] ? 'active' : ''
                      }`}
                      onClick={() => handleQuickPick(pick.ids)}
                    >
                      {pick.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="compare-content">
            {!remedyA || !remedyB ? (
              <div className="empty-compare">
                <div className="empty-icon">⚖️</div>
                <p>Select two items above to compare their definitions, details, or principles side-by-side.</p>
              </div>
            ) : (
              <CompareView itemA={remedyA} itemB={remedyB} type={contentType} />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ComparePage;
