import { useState, useRef, useEffect, useCallback, memo } from 'react';
import ReactMarkdown from 'react-markdown';

const SUGGESTIONS = [
  'How do I register to vote in India?',
  'What is the role of the Election Commission?',
  'How does an EVM work?',
  'Explain the election timeline step by step',
  'What is NOTA and how does it work?',
  'What is the Model Code of Conduct?',
];

export default memo(function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = useCallback(async function sendMessage(question) {
    const q = (question || input).trim();
    if (!q || loading) return;

    const userMsg = { role: 'user', content: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
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
  }, [input, loading]);

  const handleKeyDown = useCallback(function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  return (
    <section className="flex flex-col h-[calc(100vh-180px)]" aria-label="Chat with election assistant">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4" role="log" aria-live="polite" aria-label="Chat messages">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">🇮🇳</p>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Ask anything about Indian elections
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Voter registration, EVMs, election process, timelines, and more
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 hover:border-saffron hover:text-saffron transition-colors"
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
                  ? 'bg-navy text-white rounded-br-sm'
                  : 'bg-white border border-gray-200 shadow-sm rounded-bl-sm'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className="prose text-sm">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                  {msg.sources?.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2 border-t pt-1">
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
          <label htmlFor="chat-input" className="sr-only">Ask about the Indian election process</label>
          <input
            id="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about the Indian election process…"
            className="flex-1 border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-saffron focus:ring-2 focus:ring-saffron"
            disabled={loading}
            autoComplete="off"
            aria-describedby="chat-hint"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Submit question"
            className="bg-navy text-white rounded-full px-6 py-2.5 text-sm font-medium hover:bg-blue-900 disabled:opacity-40 transition-colors focus:outline-none focus:ring-2 focus:ring-navy focus:ring-offset-2"
          >
            Ask
          </button>
        </div>
        <p id="chat-hint" className="sr-only">Press Enter to submit your question</p>
      </form>
    </section>
  );
});
