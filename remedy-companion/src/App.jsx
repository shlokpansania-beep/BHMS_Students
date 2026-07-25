import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import YearSwitcher from './components/YearSwitcher';
import FlashcardsPage from './pages/FlashcardsPage';
import QuizPage from './pages/QuizPage';
import SearchPage from './pages/SearchPage';
import ComparePage from './pages/ComparePage';
import NotesPage from './pages/NotesPage';
import NotesQuizPage from './pages/NotesQuizPage';
import NotesFlashcardsPage from './pages/NotesFlashcardsPage';
import NotesQAPage from './pages/NotesQAPage';
import NotesComparePage from './pages/NotesComparePage';
import { ActiveYearProvider, useActiveYear, YEAR_OPTIONS } from './hooks/useActiveYear';
import { NotesStoreProvider } from './hooks/useNotesStore';
import './App.css';

function AppContent() {
  const { activeYear, activeSubject, setActiveSubject, theme, setTheme } = useActiveYear();

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const activeYearLabel = YEAR_OPTIONS.find(opt => opt.value === activeYear)?.label || 'All Years';

  return (
    <HashRouter>
      <div className="app">
        <div className="top-controls">
          <YearSwitcher />
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>

        {/* Subject Breadcrumb Header */}
        {activeSubject && (
          <div className="active-subject-header">
            <span className="breadcrumb-path">
              🎓 {activeYearLabel.replace(' BHMS', '')} &gt; {activeSubject}
            </span>
            <button className="change-subject-btn" onClick={() => setActiveSubject(null)}>
              Change Subject
            </button>
          </div>
        )}

        {/* Dynamic Route/Dashboard Content */}
        <Routes>
          {/* Notes routes are accessible regardless of whether activeSubject is selected */}
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/notes/quiz" element={<NotesQuizPage />} />
          <Route path="/notes/flashcards" element={<NotesFlashcardsPage />} />
          <Route path="/notes/qa" element={<NotesQAPage />} />
          <Route path="/notes/compare" element={<NotesComparePage />} />

          {/* Curriculum routes require activeSubject; otherwise, show Dashboard to pick one */}
          <Route 
            path="/flashcards" 
            element={activeSubject ? <FlashcardsPage /> : <Dashboard />} 
          />
          <Route 
            path="/quiz" 
            element={activeSubject ? <QuizPage /> : <Dashboard />} 
          />
          <Route 
            path="/search" 
            element={activeSubject ? <SearchPage /> : <Dashboard />} 
          />
          <Route 
            path="/compare" 
            element={activeSubject ? <ComparePage /> : <Dashboard />} 
          />
          
          {/* Fallback: Redirect to flashcards if a subject is active, else to notes dashboard */}
          <Route 
            path="*" 
            element={<Navigate to={activeSubject ? "/flashcards" : "/notes"} replace />} 
          />
        </Routes>

        <Navbar />
      </div>
    </HashRouter>
  );
}

function App() {
  return (
    <ActiveYearProvider>
      <NotesStoreProvider>
        <AppContent />
      </NotesStoreProvider>
    </ActiveYearProvider>
  );
}

export default App;
