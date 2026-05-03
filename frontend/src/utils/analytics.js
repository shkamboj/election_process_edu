/**
 * Google Analytics 4 (GA4) event tracking helpers.
 * Wraps window.gtag safely so it never throws when GA is blocked or not loaded.
 */

/**
 * Fire a GA4 custom event.
 * @param {string} name  - GA4 event name (snake_case recommended)
 * @param {Object} params - Additional event parameters
 */
export function trackEvent(name, params = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  }
}

/**
 * Track when a user submits a question.
 * @param {string} country - Country ID (e.g. 'india')
 * @param {number} questionLength - Character count of the question
 */
export function trackQuestionAsked(country, questionLength) {
  trackEvent('question_asked', {
    event_category: 'engagement',
    country,
    question_length: questionLength,
  });
}

/**
 * Track when the user switches country.
 * @param {string} fromCountry
 * @param {string} toCountry
 */
export function trackCountryChanged(fromCountry, toCountry) {
  trackEvent('country_changed', {
    event_category: 'navigation',
    from_country: fromCountry,
    to_country: toCountry,
  });
}

/**
 * Track when the user switches the main tab.
 * @param {string} tab - Tab name (Timeline | Topics | Ask)
 */
export function trackTabChanged(tab) {
  trackEvent('tab_changed', {
    event_category: 'navigation',
    tab_name: tab,
  });
}

/**
 * Track when the user translates an answer.
 * @param {string} country
 * @param {string} targetLanguage - BCP-47 language code
 */
export function trackTranslate(country, targetLanguage) {
  trackEvent('translate_answer', {
    event_category: 'accessibility',
    country,
    target_language: targetLanguage,
  });
}

/**
 * Track when the user listens to a TTS answer.
 * @param {string} country
 */
export function trackListenTTS(country) {
  trackEvent('listen_tts', {
    event_category: 'accessibility',
    country,
  });
}
