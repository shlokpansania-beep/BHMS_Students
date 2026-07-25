import { useState, useEffect } from 'react';
import { useActiveYear } from './useActiveYear';

// SM-2 Algorithm parameters
const MIN_EASE = 1.3;

const loadSrData = (key) => {
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse SR data', e);
    }
  }
  return {};
};

export function useSpacedRepetition() {
  const { activeYear, activeSubject } = useActiveYear();
  const storageKey = `remedy-companion-sr-data-year-${activeYear}-subject-${activeSubject || 'none'}`;

  const [srData, setSrData] = useState(() => loadSrData(storageKey));

  // Sync state when active year or subject changes
  useEffect(() => {
    setSrData(loadSrData(storageKey));
  }, [storageKey]);

  // Persist state changes
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(srData));
  }, [srData, storageKey]);

  const recordReview = (remedyId, quality) => {
    setSrData(prev => {
      const item = prev[remedyId] || { easeFactor: 2.5, interval: 0, repetitions: 0 };
      let { easeFactor, interval, repetitions } = item;
      
      // Update repetitions
      if (quality < 3) {
        repetitions = 0;
      } else {
        repetitions += 1;
      }

      // Update interval
      if (repetitions <= 1) {
        interval = 1;
      } else if (repetitions === 2) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }

      // Update ease factor
      easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      if (easeFactor < MIN_EASE) easeFactor = MIN_EASE;

      const nextReview = Date.now() + interval * 24 * 60 * 60 * 1000;

      return {
        ...prev,
        [remedyId]: { easeFactor, interval, repetitions, nextReview }
      };
    });
  };

  const getNextRemedyToReview = (remedies) => {
    const now = Date.now();
    
    const dueRemedies = remedies.filter(remedy => {
      const data = srData[remedy.id];
      if (!data) return true; // Never reviewed
      return data.nextReview <= now;
    });

    if (dueRemedies.length === 0) {
      // If none due, pick a random one
      return remedies[Math.floor(Math.random() * remedies.length)];
    }
    
    // Sort by most overdue first, put new items at the end
    dueRemedies.sort((a, b) => {
      const dataA = srData[a.id];
      const dataB = srData[b.id];
      if (!dataA && !dataB) return 0;
      if (!dataA) return 1;
      if (!dataB) return -1;
      return dataA.nextReview - dataB.nextReview;
    });

    return dueRemedies[0];
  };

  const getDueCount = (remedies) => {
    const now = Date.now();
    return remedies.filter(remedy => {
      const data = srData[remedy.id];
      return !data || data.nextReview <= now;
    }).length;
  };

  return {
    srData,
    recordReview,
    getNextRemedyToReview,
    getDueCount
  };
}
