import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useActiveYear } from './useActiveYear';

const NotesStoreContext = createContext(null);

function readJson(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

export function NotesStoreProvider({ children }) {
  const { activeYear, activeSubject } = useActiveYear();
  
  const docStorageKey = `remedy-companion-notes-year-${activeYear}-subject-${activeSubject || 'none'}`;
  const quizHistoryKey = `remedy-companion-notes-quizzes-year-${activeYear}-subject-${activeSubject || 'none'}`;
  const flashcardsCacheKey = `remedy-companion-notes-flashcards-cache-year-${activeYear}-subject-${activeSubject || 'none'}`;

  const [document, setDocument] = useState(() => readJson(docStorageKey, null));
  const [quizHistory, setQuizHistory] = useState(() => readJson(quizHistoryKey, []));
  const [flashcardsCache, setFlashcardsCache] = useState(() => readJson(flashcardsCacheKey, {}));

  // Sync state when activeYear or activeSubject changes
  useEffect(() => {
    setDocument(readJson(docStorageKey, null));
    setQuizHistory(readJson(quizHistoryKey, []));
    setFlashcardsCache(readJson(flashcardsCacheKey, {}));
  }, [docStorageKey, quizHistoryKey, flashcardsCacheKey]);

  // Persist state changes
  useEffect(() => {
    if (document) {
      localStorage.setItem(docStorageKey, JSON.stringify(document));
    } else {
      localStorage.removeItem(docStorageKey);
    }
  }, [document, docStorageKey]);

  useEffect(() => {
    localStorage.setItem(quizHistoryKey, JSON.stringify(quizHistory));
  }, [quizHistory, quizHistoryKey]);

  useEffect(() => {
    localStorage.setItem(flashcardsCacheKey, JSON.stringify(flashcardsCache));
  }, [flashcardsCache, flashcardsCacheKey]);

  const loadDocument = useCallback((doc) => {
    setDocument({
      fileName: doc.fileName,
      fileType: doc.fileType,
      text: doc.text,
      pageCount: doc.pageCount,
      uploadedAt: Date.now(),
    });
  }, []);

  const clearDocument = useCallback(() => {
    setDocument(null);
  }, []);

  const documentCacheKey = document
    ? `${document.fileName}:${document.uploadedAt}`
    : null;

  const getCachedFlashcards = useCallback(
    (cardCount) => {
      if (!documentCacheKey) return null;
      const entry = flashcardsCache[`${documentCacheKey}:${cardCount}`];
      return entry?.cards?.length ? entry.cards : null;
    },
    [documentCacheKey, flashcardsCache]
  );

  const setCachedFlashcards = useCallback(
    (cardCount, cards) => {
      if (!documentCacheKey || !cards?.length) return;
      setFlashcardsCache((prev) => ({
        ...prev,
        [`${documentCacheKey}:${cardCount}`]: {
          cards,
          savedAt: Date.now(),
        },
      }));
    },
    [documentCacheKey]
  );

  const saveQuiz = useCallback((quiz) => {
    setQuizHistory((prev) =>
      [
        {
          id: Date.now(),
          fileName: quiz.fileName,
          questionCount: quiz.questionCount,
          score: quiz.score,
          total: quiz.total,
          percentage: Math.round((quiz.score / quiz.total) * 100),
          completedAt: Date.now(),
          questions: quiz.questions,
          userAnswers: quiz.userAnswers,
        },
        ...prev,
      ].slice(0, 20)
    );
  }, []);

  const getQuizHistory = useCallback(() => {
    return quizHistory.map((q) => ({
      id: q.id,
      fileName: q.fileName,
      questionCount: q.questionCount,
      score: q.score,
      total: q.total,
      percentage: q.percentage,
      completedAt: q.completedAt,
    }));
  }, [quizHistory]);

  const getQuizById = useCallback(
    (id) => quizHistory.find((q) => q.id === id) || null,
    [quizHistory]
  );

  const deleteQuiz = useCallback((id) => {
    setQuizHistory((prev) => prev.filter((q) => q.id !== id));
  }, []);

  const value = {
    document,
    quizHistory,
    loadDocument,
    clearDocument,
    saveQuiz,
    getQuizHistory,
    getQuizById,
    deleteQuiz,
    getCachedFlashcards,
    setCachedFlashcards,
  };

  return (
    <NotesStoreContext.Provider value={value}>{children}</NotesStoreContext.Provider>
  );
}

export function useNotesStore() {
  const ctx = useContext(NotesStoreContext);
  if (!ctx) {
    throw new Error('useNotesStore must be used within NotesStoreProvider');
  }
  return ctx;
}
