import { memo } from 'react';
import PropTypes from 'prop-types';
import TOPICS_BY_COUNTRY from '../data/topics';

function TopicCards({ country }) {
  const topics = TOPICS_BY_COUNTRY[country.id] || TOPICS_BY_COUNTRY.india;

  return (
    <section aria-label="Election topics">
      <h2 className="text-lg font-bold mb-2" style={{ color: country.accent }}>Explore Topics</h2>
      <p className="text-sm text-gray-600 mb-6">
        Browse key topics about the {country.name} election process. Switch to the <strong>Ask</strong> tab
        to dive deeper into any topic.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list">
        {topics.map((t, i) => (
          <article
            key={i}
            role="listitem"
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all focus-within:ring-2"
            style={{ '--tw-ring-color': country.accent }}
            aria-label={t.title}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl" aria-hidden="true">{t.emoji}</span>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">{t.title}</h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{t.summary}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

TopicCards.propTypes = {
  country: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    accent: PropTypes.string.isRequired,
  }).isRequired,
};

export default memo(TopicCards);
