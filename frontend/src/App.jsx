import { useState } from 'react';
import Chat from './components/Chat';
import Timeline from './components/ElectionTimeline';
import TopicCards from './components/TopicCards';

const TABS = ['Timeline', 'Topics', 'Ask'];

export default function App() {
  const [tab, setTab] = useState('Timeline');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-saffron via-white to-india_green shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🗳️</span>
            <div>
              <h1 className="text-xl font-bold text-navy">Indian Election Process</h1>
              <p className="text-xs text-gray-600">Learn &middot; Explore &middot; Ask</p>
            </div>
          </div>
          <nav className="flex gap-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
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
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        {tab === 'Ask' && <Chat />}
        {tab === 'Timeline' && <Timeline />}
        {tab === 'Topics' && <TopicCards />}
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 py-3 border-t">
        Educational purposes only &middot; Data sourced from ECI, Constitution of India &middot; Not an official government resource
      </footer>
    </div>
  );
}
