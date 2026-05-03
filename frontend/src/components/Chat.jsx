import { useState, useRef, useEffect, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import SUGGESTIONS_BY_COUNTRY from '../data/suggestions';
import { trackQuestionAsked, trackTranslate, trackListenTTS } from '../utils/analytics';

// Strip markdown syntax to plain text for TTS input
function stripMarkdown(text) {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/[*_`~]/g, '')
    .replace(/\n{2,}/g, ' ')
    .trim();
}

function Chat({ country }) {
  const suggestions = SUGGESTIONS_BY_COUNTRY[country.id] || SUGGESTIONS_BY_COUNTRY.india;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  // ttsState: { [msgIndex]: 'loading' | 'playing' | 'error' }
  const [ttsState, setTtsState] = useState({});
  // translatedMessages: { [msgIndex]: { text, loading, error } }
  const [translatedMessages, setTranslatedMessages] = useState({});
  const bottomRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Reset TTS/translations when country changes
  useEffect(() => {
    setTtsState({});
    setTranslatedMessages({});
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, [country.id]);

  const sendMessage = useCallback(async function sendMessage(question) {
    const q = (question || input).trim();
    if (!q || loading) return;

    const userMsg = { role: 'user', content: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    trackQuestionAsked(country.id, q.length);

    try {
      const res = await fetch('/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, country: country.id }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Server error' }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer,
          sources: data.sources,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `⚠️ Error: ${err.message}`, sources: [], isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, country]);

  const handleKeyDown = useCallback(function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const handleListen = useCallback(async function handleListen(msgIndex, text) {
    // Stop current playback if any
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setTtsState((prev) => ({ ...prev, [msgIndex]: 'loading' }));
    trackListenTTS(country.id);

    try {
      const plain = stripMarkdown(text).slice(0, 1000);
      const res = await fetch('/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: plain, language_code: country.ttsLanguage }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'TTS failed' }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const audio = new Audio(`data:audio/mp3;base64,${data.audio_base64}`);
      audioRef.current = audio;
      audio.play();
      setTtsState((prev) => ({ ...prev, [msgIndex]: 'playing' }));
      audio.onended = () => setTtsState((prev) => ({ ...prev, [msgIndex]: null }));
    } catch {
      setTtsState((prev) => ({ ...prev, [msgIndex]: 'error' }));
    }
  }, [country]);

  const handleTranslate = useCallback(async function handleTranslate(msgIndex, text) {
    // If already translated, toggle off
    if (translatedMessages[msgIndex]?.text) {
      setTranslatedMessages((prev) => {
        const next = { ...prev };
        delete next[msgIndex];
        return next;
      });
      return;
    }

    setTranslatedMessages((prev) => ({ ...prev, [msgIndex]: { loading: true } }));
    trackTranslate(country.id, country.language);

    try {
      const res = await fetch('/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: stripMarkdown(text), target_language: country.language }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Translation failed' }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setTranslatedMessages((prev) => ({
        ...prev,
        [msgIndex]: { text: data.translated_text },
      }));
    } catch (err) {
      setTranslatedMessages((prev) => ({
        ...prev,
        [msgIndex]: { error: err.message },
      }));
    }
  }, [country, translatedMessages]);

  const showTranslateButton = country.language !== 'en';

  return (
    <section className="flex flex-col h-[calc(100vh-180px)]" aria-label={`Chat with ${country.name} election assistant`}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4" role="log" aria-live="polite" aria-label="Chat messages">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">{country.flag}</p>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Ask anything about {country.name} elections
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Election process, voter registration, timelines, legislation, and more
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            role={msg.isError ? 'alert' : undefined}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'text-white rounded-br-sm'
                  : 'bg-white border border-gray-200 shadow-sm rounded-bl-sm'
              }`}
              style={msg.role === 'user' ? { backgroundColor: country.accent } : undefined}
            >
              {msg.role === 'assistant' ? (
                <div className="prose text-sm">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>

                  {/* Translated text */}
                  {translatedMessages[i]?.loading && (
                    <p className="text-xs text-gray-400 mt-2 italic">Translating…</p>
                  )}
                  {translatedMessages[i]?.text && (
                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-400 mb-1">{country.languageName}</p>
                      <p className="text-sm text-gray-700">{translatedMessages[i].text}</p>
                    </div>
                  )}
                  {translatedMessages[i]?.error && (
                    <p className="text-xs text-red-500 mt-2">{translatedMessages[i].error}</p>
                  )}

                  {/* Action bar: Listen + Translate */}
                  {!msg.isError && (
                    <div className="flex items-center gap-2 mt-2 pt-1 border-t border-gray-100">
                      <button
                        onClick={() => handleListen(i, msg.content)}
                        disabled={ttsState[i] === 'loading'}
                        aria-label={ttsState[i] === 'playing' ? 'Playing audio' : 'Listen to this answer'}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors focus:outline-none focus:underline"
                        title="Listen with Google Text-to-Speech"
                      >
                        {ttsState[i] === 'loading' ? '⏳' : ttsState[i] === 'playing' ? '🔊' : '🔈'}
                        <span>{ttsState[i] === 'loading' ? 'Loading…' : ttsState[i] === 'playing' ? 'Playing' : 'Listen'}</span>
                      </button>

                      {showTranslateButton && (
                        <button
                          onClick={() => handleTranslate(i, msg.content)}
                          disabled={translatedMessages[i]?.loading}
                          aria-label={translatedMessages[i]?.text ? `Hide ${country.languageName} translation` : `Translate to ${country.languageName}`}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors focus:outline-none focus:underline"
                          title="Translate with Google Cloud Translation"
                        >
                          🌐
                          <span>{translatedMessages[i]?.text ? `Hide ${country.languageName}` : `${country.languageName}`}</span>
                        </button>
                      )}
                    </div>
                  )}

                  {msg.sources?.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Sources: {msg.sources.join(', ')}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm">{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start" role="status" aria-label="Loading response">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1" aria-hidden="true">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form className="border-t bg-white pt-3" onSubmit={(e) => { e.preventDefault(); sendMessage(); }} role="search" aria-label="Ask a question">
        <div className="flex gap-2">
          <label htmlFor="chat-input" className="sr-only">Ask about the {country.name} election process</label>
          <input
            id="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask about the ${country.name} election process…`}
            className="flex-1 border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': country.accent }}
            disabled={loading}
            autoComplete="off"
            aria-describedby="chat-hint"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Submit question"
            className="text-white rounded-full px-6 py-2.5 text-sm font-medium disabled:opacity-40 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ backgroundColor: country.accent, '--tw-ring-color': country.accent }}
          >
            Ask
          </button>
        </div>
        <p id="chat-hint" className="sr-only">Press Enter to submit your question</p>
      </form>
    </section>
  );
}

Chat.propTypes = {
  country: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    flag: PropTypes.string.isRequired,
    accent: PropTypes.string.isRequired,
    language: PropTypes.string.isRequired,
    ttsLanguage: PropTypes.string.isRequired,
    languageName: PropTypes.string.isRequired,
  }).isRequired,
};

export default memo(Chat);
