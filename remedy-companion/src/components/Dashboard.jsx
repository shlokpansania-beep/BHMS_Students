import React from 'react';
import { useActiveYear, YEAR_OPTIONS } from '../hooks/useActiveYear';
import './Dashboard.css';

const SUBJECT_METADATA = {
  "Anatomy": { icon: "🦴", desc: "Study of human structure and organs" },
  "Physiology & Biochemistry": { icon: "🧪", desc: "Functions of human systems and chemistry" },
  "Pharmacy": { icon: "🌿", desc: "Homoeopathic drug prep and dispensing" },
  "Materia Medica": { icon: "📖", desc: "Symptomatology and drug pathogenesis" },
  "Organon of Medicine": { icon: "🏛️", desc: "Principles and philosophy of Homoeopathy" },
  "Practice of Medicine": { icon: "🏥", desc: "Clinical diagnosis and therapeutic application" },
  "Obstetrics & Gynaecology": { icon: "👶", desc: "Pregnancy, child birth, and women's health" },
  "Surgery": { icon: "🩺", desc: "Surgical pathology, diagnosis, and therapeutics" },
  "Forensic Medicine & Toxicology": { icon: "⚖️", desc: "Medical jurisprudence and poisons" },
  "General Pathology & Microbiology": { icon: "🔬", desc: "Disease mechanisms, bacteria, and viruses" },
  "Community Medicine": { icon: "🏘️", desc: "Public health and preventive medicine" },
  "Repertory": { icon: "📊", desc: "Repertorization and symptom index systems" }
};

const Dashboard = () => {
  const { activeYear, subjects, setActiveSubject } = useActiveYear();

  const activeYearLabel = YEAR_OPTIONS.find(opt => opt.value === activeYear)?.label || 'All Years';

  return (
    <div className="dashboard page">
      <div className="page-header text-center">
        <span className="dashboard-welcome">🌿 Study Center</span>
        <h1 className="page-title justify-center">Remedy Companion</h1>
        <p className="page-subtitle">Select a subject for {activeYearLabel} to unlock practice tools</p>
      </div>

      <div className="subjects-grid">
        {subjects.map((sub) => {
          const meta = SUBJECT_METADATA[sub] || { icon: "📚", desc: "Syllabus review and study cards" };
          return (
            <button
              key={sub}
              className="subject-card card"
              onClick={() => setActiveSubject(sub)}
            >
              <div className="subject-icon">{meta.icon}</div>
              <div className="subject-details">
                <h3>{sub}</h3>
                <p>{meta.desc}</p>
              </div>
              <div className="subject-arrow">→</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
