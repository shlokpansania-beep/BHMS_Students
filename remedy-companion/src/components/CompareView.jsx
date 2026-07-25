import React from 'react';
import './CompareView.css';

const CompareView = ({ itemA, itemB, type = 'remedy' }) => {
  if (!itemA || !itemB) return <div className="compare-empty">Select two items to compare</div>;

  const compareArrays = (arrA = [], arrB = []) => {
    const aLower = arrA.map(i => i.toLowerCase());
    const bLower = arrB.map(i => i.toLowerCase());
    
    const uniqueA = arrA.filter(i => !bLower.includes(i.toLowerCase()));
    const uniqueB = arrB.filter(i => !aLower.includes(i.toLowerCase()));
    const shared = arrA.filter(i => bLower.includes(i.toLowerCase()));

    return { uniqueA, uniqueB, shared };
  };

  const renderComparisonSection = (title, key, subkey = null) => {
    const dataA = subkey ? itemA[key]?.[subkey] : itemA[key];
    const dataB = subkey ? itemB[key]?.[subkey] : itemB[key];
    
    if ((!dataA || dataA.length === 0) && (!dataB || dataB.length === 0)) return null;

    const { uniqueA, uniqueB, shared } = compareArrays(dataA || [], dataB || []);

    return (
      <div className="compare-row">
        <div className="compare-header-row">
          <h3>{title}</h3>
        </div>
        <div className="compare-cols">
          <div className="compare-col col-a">
            <ul>
              {uniqueA.map((item, idx) => <li key={`ua-${idx}`} className="unique-a">{item}</li>)}
              {shared.map((item, idx) => <li key={`sa-${idx}`} className="shared">{item}</li>)}
            </ul>
          </div>
          <div className="compare-col col-b">
            <ul>
              {uniqueB.map((item, idx) => <li key={`ub-${idx}`} className="unique-b">{item}</li>)}
              {shared.map((item, idx) => <li key={`sb-${idx}`} className="shared">{item}</li>)}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderTextComparisonSection = (title, keyA, keyB = null) => {
    const textA = itemA[keyA];
    const textB = itemB[keyB || keyA];

    if (!textA && !textB) return null;

    return (
      <div className="compare-row">
        <div className="compare-header-row">
          <h3>{title}</h3>
        </div>
        <div className="compare-cols">
          <div className="compare-col col-a">
            <p className="compare-text-content">{textA || 'Not specified'}</p>
          </div>
          <div className="compare-col col-b">
            <p className="compare-text-content">{textB || 'Not specified'}</p>
          </div>
        </div>
      </div>
    );
  };

  const nameA = itemA.name || itemA.title || `Aphorism ${itemA.aphorism_number}: ${itemA.principle_name}`;
  const nameB = itemB.name || itemB.title || `Aphorism ${itemB.aphorism_number}: ${itemB.principle_name}`;
  const sourceA = itemA.source || (type === 'concept' ? 'Concept' : 'Principle');
  const sourceB = itemB.source || (type === 'concept' ? 'Concept' : 'Principle');

  return (
    <div className="compare-view">
      <div className="compare-sticky-header">
        <div className="compare-cols">
          <div className="compare-col col-a title-col">
            <h2>{nameA}</h2>
            <p className="source">{sourceA}</p>
          </div>
          <div className="compare-col col-b title-col">
            <h2>{nameB}</h2>
            <p className="source">{sourceB}</p>
          </div>
        </div>
      </div>

      <div className="compare-body">
        {type === 'remedy' && (
          <>
            {renderComparisonSection('Keynotes', 'keynotes')}
            {renderComparisonSection('Mind Symptoms', 'mind_symptoms')}
            {renderComparisonSection('Worse', 'modalities', 'worse')}
            {renderComparisonSection('Better', 'modalities', 'better')}
            {renderComparisonSection('Common Uses', 'common_uses')}
          </>
        )}

        {type === 'concept' && (
          <>
            {renderTextComparisonSection('Definition', 'definition')}
            {renderComparisonSection('Key Points', 'key_points')}
            {renderComparisonSection('Related Terms', 'related_terms')}
          </>
        )}

        {type === 'principle' && (
          <>
            {renderTextComparisonSection('Aphorism Explanation', 'explanation')}
            {renderTextComparisonSection('Clinical Example', 'example')}
          </>
        )}
      </div>
      
      <div className="compare-legend">
        <span className="legend-item"><span className="dot dot-shared"></span> Shared</span>
        <span className="legend-item"><span className="dot dot-a"></span> Unique to A</span>
        <span className="legend-item"><span className="dot dot-b"></span> Unique to B</span>
      </div>
    </div>
  );
};

export default CompareView;
