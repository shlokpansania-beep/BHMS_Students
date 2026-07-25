import React from 'react';
import './RemedyDetail.css';

const RemedyDetail = ({ remedy, onClose, onNavigate }) => {
  if (!remedy) return null;

  return (
    <div className="remedy-detail-overlay">
      <div className="remedy-detail-modal">
        <button className="close-btn" onClick={onClose} aria-label="Close">
          ✕
        </button>
        
        <div className="remedy-detail-content">
          <header className="remedy-header">
            <h2>{remedy.name}</h2>
            <p className="source">{remedy.source}</p>
          </header>

          <div className="remedy-sections">
            {remedy.keynotes && remedy.keynotes.length > 0 && (
              <section className="detail-section">
                <h3>Keynotes</h3>
                <ul>
                  {remedy.keynotes.map((item, idx) => <li key={idx}>{item}</li>)}
                </ul>
              </section>
            )}

            {remedy.mind_symptoms && remedy.mind_symptoms.length > 0 && (
              <section className="detail-section">
                <h3>Mind Symptoms</h3>
                <ul>
                  {remedy.mind_symptoms.map((item, idx) => <li key={idx}>{item}</li>)}
                </ul>
              </section>
            )}

            {remedy.modalities && (
              <section className="detail-section modalities-section">
                <div className="modality-col">
                  <h3>Worse ▼</h3>
                  <ul>
                    {remedy.modalities.worse?.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                </div>
                <div className="modality-col">
                  <h3>Better ▲</h3>
                  <ul>
                    {remedy.modalities.better?.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                </div>
              </section>
            )}

            {remedy.common_uses && remedy.common_uses.length > 0 && (
              <section className="detail-section">
                <h3>Common Uses</h3>
                <ul>
                  {remedy.common_uses.map((item, idx) => <li key={idx}>{item}</li>)}
                </ul>
              </section>
            )}

            {remedy.related_remedies && remedy.related_remedies.length > 0 && (
              <section className="detail-section">
                <h3>Related Remedies</h3>
                <div className="related-pills">
                  {remedy.related_remedies.map((relId, idx) => (
                    <button 
                      key={idx} 
                      className="related-pill"
                      onClick={() => onNavigate && onNavigate(relId)}
                    >
                      {relId}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemedyDetail;
