import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import COUNTRIES from './data/countries';
import { trackCountryChanged, trackTabChanged } from './utils/analytics';

const Chat = lazy(() => import('./components/Chat'));
const Timeline = lazy(() => import('./components/ElectionTimeline'));
const TopicCards = lazy(() => import('./components/TopicCards'));

const TABS = ['Timeline', 'Topics', 'Ask'];

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-20" role="status" aria-label="Loading">
      <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export default function App() {
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [tab, setTab] = useState('Timeline');
  const [selectorOpen, setSelectorOpen] = useState(false);
  const panelRef = useRef(null);
  const selectorRef = useRef(null);

  useEffect(() => {
    panelRef.current?.focus();
  }, [tab]);

  // Close selector on outside click
  useEffect(() => {
    function handleClick(e) {
      if (selectorRef.current && !selectorRef.current.contains(e.target)) {
        setSelectorOpen(false);
      }
    }
    if (selectorOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [selectorOpen]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip to main content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:text-white focus:px-4 focus:py-2 focus:rounded"
        style={{ backgroundColor: country.accent }}
      >
        Skip to main content
      </a>

      {/* Header — gradient from country flag colors */}
      <header className="shadow-md" style={{ background: country.headerGradient }} role="banner">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden="true">{country.flag}</span>
            <div>
              <h1 className="text-xl font-bold" style={{ color: country.accent }}>
                {country.name} Election Process
              </h1>
              <p className="text-xs text-gray-600">Learn &middot; Explore &middot; Ask</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Country Selector */}
            <div className="relative" ref={selectorRef}>
              <button
                onClick={() => setSelectorOpen(!selectorOpen)}
                aria-expanded={selectorOpen}
                aria-haspopup="listbox"
                aria-label={`Select country: ${country.name}`}
                className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-3 py-1.5 text-sm hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ '--tw-ring-color': country.accent }}
              >
                <span aria-hidden="true">{country.flag}</span>
                <span className="hidden sm:inline">{country.name}</span>
                <span className="text-gray-400" aria-hidden="true">▾</span>
              </button>

              {selectorOpen && (
                <ul
                  role="listbox"
                  aria-label="Select a country"
                  className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 min-w-[200px] max-h-80 overflow-y-auto"
                >
                  {COUNTRIES.map((c) => (
                    <li
                      key={c.id}
                      role="option"
                      aria-selected={c.id === country.id}
                      className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${
                        c.id === country.id ? 'font-semibold bg-gray-50' : ''
                      }`}
                      onClick={() => {
                        trackCountryChanged(country.id, c.id);
                        setCountry(c);
                        setSelectorOpen(false);
                      }}
                    >
                      <span aria-hidden="true">{c.flag}</span>
                      <span>{c.name}</span>
                      {c.id === country.id && <span className="ml-auto text-green-600" aria-hidden="true">✓</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Tabs */}
            <nav aria-label="Main navigation" className="flex gap-1" role="tablist">
              {TABS.map((t) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={tab === t}
                  aria-controls={`tabpanel-${t}`}
                  id={`tab-${t}`}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    tab === t
                      ? 'text-white'
                      : 'bg-white/70 text-gray-700 hover:bg-white'
                  }`}
                  style={tab === t ? { backgroundColor: country.accent, '--tw-ring-color': country.accent } : { '--tw-ring-color': country.accent }}
                  onClick={() => { trackTabChanged(t); setTab(t); }}
                >
                  {t}
                </button>
              ))}
            </nav>
          </div>
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
            {tab === 'Ask' && <Chat country={country} />}
            {tab === 'Timeline' && <Timeline country={country} />}
            {tab === 'Topics' && <TopicCards country={country} />}
          </Suspense>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-500 py-3 border-t" role="contentinfo">
        Educational purposes only &middot; Not an official government resource
      </footer>
    </div>
  );
}
