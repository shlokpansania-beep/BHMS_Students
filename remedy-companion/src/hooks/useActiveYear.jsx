import React, { createContext, useContext, useState, useEffect } from 'react';
import syllabusData from '../data/syllabus.json';

const ActiveYearContext = createContext(null);

export const YEAR_OPTIONS = [
  { value: 'all', label: 'All Years' },
  { value: '1', label: '1st Year BHMS' },
  { value: '2', label: '2nd Year BHMS' },
  { value: '3', label: '3rd Year BHMS' },
  { value: '4', label: '4th Year BHMS' }
];

export function ActiveYearProvider({ children }) {
  const [activeYear, setActiveYear] = useState(() => {
    return localStorage.getItem('remedy-companion-active-year') || 'all';
  });

  const [activeSubject, setActiveSubject] = useState(() => {
    return localStorage.getItem(`remedy-companion-active-subject-year-${activeYear}`) || null;
  });

  // Sync year changes and load that year's saved subject
  useEffect(() => {
    localStorage.setItem('remedy-companion-active-year', activeYear);
    const savedSubject = localStorage.getItem(`remedy-companion-active-subject-year-${activeYear}`);
    // Default to null to show dashboard when switching years
    setActiveSubject(savedSubject || null);
  }, [activeYear]);

  // Persist activeSubject changes
  useEffect(() => {
    const key = `remedy-companion-active-subject-year-${activeYear}`;
    if (activeSubject) {
      localStorage.setItem(key, activeSubject);
    } else {
      localStorage.removeItem(key);
    }
  }, [activeSubject, activeYear]);

  const getSubjectsForYear = (year) => {
    if (year === 'all') {
      return ["Materia Medica", "Organon of Medicine", "Practice of Medicine"];
    }
    return syllabusData[year] || [];
  };

  const subjects = getSubjectsForYear(activeYear);

  return (
    <ActiveYearContext.Provider value={{ 
      activeYear, 
      setActiveYear, 
      activeSubject, 
      setActiveSubject,
      subjects
    }}>
      {children}
    </ActiveYearContext.Provider>
  );
}

export function useActiveYear() {
  const context = useContext(ActiveYearContext);
  if (!context) {
    throw new Error('useActiveYear must be used within an ActiveYearProvider');
  }
  return context;
}
