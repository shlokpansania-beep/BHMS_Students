import { useState, useEffect } from 'react';
import { useActiveYear } from './useActiveYear';

const loadProgress = (key) => {
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse quiz progress', e);
    }
  }
  return {
    totalAttempted: 0,
    totalCorrect: 0,
    streakCurrent: 0,
    streakBest: 0,
    history: []
  };
};

export function useQuizProgress() {
  const { activeYear, activeSubject } = useActiveYear();
  const storageKey = `remedy-companion-quiz-progress-year-${activeYear}-subject-${activeSubject || 'none'}`;

  const [progress, setProgress] = useState(() => loadProgress(storageKey));

  // Sync state when active year or subject changes
  useEffect(() => {
    setProgress(loadProgress(storageKey));
  }, [storageKey]);

  // Persist state changes
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(progress));
  }, [progress, storageKey]);

  const recordAnswer = (remedyId, isCorrect) => {
    setProgress(prev => {
      const newStreak = isCorrect ? prev.streakCurrent + 1 : 0;
      const newBestStreak = Math.max(prev.streakBest, newStreak);
      
      return {
        totalAttempted: prev.totalAttempted + 1,
        totalCorrect: prev.totalCorrect + (isCorrect ? 1 : 0),
        streakCurrent: newStreak,
        streakBest: newBestStreak,
        history: [
          { remedyId, correct: isCorrect, timestamp: Date.now() },
          ...prev.history
        ].slice(0, 100)
      };
    });
  };

  const getStats = () => {
    return {
      totalAttempted: progress.totalAttempted,
      totalCorrect: progress.totalCorrect,
      streakCurrent: progress.streakCurrent,
      streakBest: progress.streakBest
    };
  };

  const resetProgress = () => {
    setProgress({
      totalAttempted: 0,
      totalCorrect: 0,
      streakCurrent: 0,
      streakBest: 0,
      history: []
    });
  };

  return {
    progress,
    getStats,
    recordAnswer,
    resetProgress
  };
}
