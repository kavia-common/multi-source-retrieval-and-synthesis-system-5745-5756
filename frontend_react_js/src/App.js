import React, { useState, useEffect } from 'react';
import './App.css';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import SourcesPage from './pages/SourcesPage';
import QueryConsolePage from './pages/QueryConsolePage';

const themeColors = {
  primary: '#2563EB',
  secondary: '#F59E0B',
  error: '#EF4444',
  background: '#f9fafb',
  surface: '#ffffff',
  text: '#111827',
};

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="App" style={{ background: themeColors.background, minHeight: '100vh' }}>
      <header
        className="App-header"
        style={{
          background: themeColors.surface,
          color: themeColors.text,
          minHeight: 'auto',
          padding: '12px 24px',
          alignItems: 'stretch',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: `linear-gradient(135deg, ${themeColors.primary}22, ${themeColors.secondary}22)`,
                border: `1px solid ${themeColors.primary}33`,
              }}
              aria-hidden
            />
            <nav style={{ display: 'flex', gap: 12 }}>
              <Link
                to="/sources"
                style={{
                  textDecoration: 'none',
                  padding: '8px 12px',
                  borderRadius: 8,
                  color: location.pathname.startsWith('/sources') ? themeColors.surface : themeColors.text,
                  background: location.pathname.startsWith('/sources') ? themeColors.primary : 'transparent',
                  border: `1px solid ${themeColors.primary}33`,
                  transition: 'all .2s ease',
                }}
              >
                Sources
              </Link>
              <Link
                to="/query"
                style={{
                  textDecoration: 'none',
                  padding: '8px 12px',
                  borderRadius: 8,
                  color: location.pathname.startsWith('/query') ? themeColors.surface : themeColors.text,
                  background: location.pathname.startsWith('/query') ? themeColors.primary : 'transparent',
                  border: `1px solid ${themeColors.primary}33`,
                  transition: 'all .2s ease',
                }}
              >
                Query
              </Link>
            </nav>
          </div>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            style={{
              backgroundColor: themeColors.primary,
              color: '#fff',
            }}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </header>

      <main style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/query" replace />} />
          <Route path="/sources" element={<SourcesPage />} />
          <Route path="/query" element={<QueryConsolePage />} />
          <Route path="*" element={<Navigate to="/query" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
