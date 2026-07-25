import React from 'react';
import './SearchBar.css';

const SearchBar = ({ value, onChange, placeholder, activeFilter, onFilterChange }) => {
  const filters = ['All', 'Mind', 'Modalities', 'Physical'];

  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'Search remedies...'}
        />
      </div>
      
      {onFilterChange && (
        <div className="search-filters">
          {filters.map((filter) => (
            <button
              key={filter}
              className={`filter-pill ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => onFilterChange(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
