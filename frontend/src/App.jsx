import { useState, useRef, useEffect, lazy, Suspense } from 'react';

const Chat = lazy(() => import('./components/Chat'));
const Timeline = lazy(() => import('./components/ElectionTimeline'));
const TopicCards = lazy(() => import('./components/TopicCards'));

const TABS = ['Timeline', 'Topics', 'Ask'];

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-20" role="status" aria-label="Loading">
      <div className="w-8 h-8 border-4 border-gray-200 border-t-navy rounded-full animate-spin"></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState('Timeline');
  const panelRef = useRef(null);

  useEffect(() => {
    panelRef.current?.focus();
  }, [tab]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip to main content link for keyboard/screen reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-navy focus:text-white focus:px-4 focus:py-2 focus:rounded"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="bg-gradient-to-r from-saffron via-white to-india_green shadow-md" role="banner">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden="true">🗳️</span>
            <div>
              <h1 className="text-xl font-bold text-navy">Indian Election Process</h1>
              <p className="text-xs text-gray-600">Learn &middot; Explore &middot; Ask</p>
            </div>
          </div>
          <nav aria-label="Main navigation" className="flex gap-1" role="tablist">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                role="tab"
                aria-selected={tab === t}
                aria-controls={`tabpanel-${t}`}
                id={`tab-${t}`}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-navy focus:ring-offset-2 ${
                  tab === t
                    ? 'bg-navy text-white'
                    : 'bg-white/70 text-gray-700 hover:bg-white'
                }`}
              >
                {t}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1 max-w-4xl w-full mx-auto px-4 py-6" role="main">
        <div
          role="tabpanel"
          id={`tabpanel-${tab}`}
          aria-labelledby={`tab-${tab}`}
          tabIndex={-1}
          ref={panelRef}
        >
          <Suspense fallback={<LoadingSpinner />}>
            {tab === 'Ask' && <Chat />}
            {tab === 'Timeline' && <Timeline />}
            {tab === 'Topics' && <TopicCards />}
          </Suspense>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-500 py-3 border-t" role="contentinfo">
        Educational purposes only &middot; Data sourced from ECI, Constitution of India &middot; Not an official government resource
      </footer>
    </div>
  );
}
