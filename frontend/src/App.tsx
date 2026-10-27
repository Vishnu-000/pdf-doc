import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { ToolPage } from './pages/ToolPage';

export const App: React.FC = () => {
  const [currentToolId, setCurrentToolId] = useState<string | null>(() => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    return hash || null;
  });

  // Keep URL hash in sync with state
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      setCurrentToolId(hash || null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectTool = (toolId: string) => {
    window.location.hash = `#/${toolId}`;
    setCurrentToolId(toolId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateHome = () => {
    window.location.hash = '';
    setCurrentToolId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header
        currentToolId={currentToolId}
        onNavigateHome={handleNavigateHome}
        onSelectTool={handleSelectTool}
      />

      <main className="flex-1">
        {currentToolId ? (
          <ToolPage
            toolId={currentToolId}
            onNavigateHome={handleNavigateHome}
          />
        ) : (
          <HomePage onSelectTool={handleSelectTool} />
        )}
      </main>

      <Footer onSelectTool={handleSelectTool} />
    </div>
  );
};

export default App;
