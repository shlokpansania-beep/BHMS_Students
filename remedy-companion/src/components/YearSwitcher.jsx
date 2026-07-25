import React from 'react';
import { useActiveYear, YEAR_OPTIONS } from '../hooks/useActiveYear';
import './YearSwitcher.css';

const YearSwitcher = () => {
  const { activeYear, setActiveYear } = useActiveYear();

  return (
    <div className="year-switcher-container">
      <span className="year-switcher-icon">🎓</span>
      <select
        className="year-switcher-select"
        value={activeYear}
        onChange={(e) => setActiveYear(e.target.value)}
        aria-label="Select BHMS Year"
      >
        {YEAR_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default YearSwitcher;
