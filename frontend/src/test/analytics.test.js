import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  trackEvent,
  trackQuestionAsked,
  trackCountryChanged,
  trackTabChanged,
  trackTranslate,
  trackListenTTS,
} from '../utils/analytics';

describe('analytics', () => {
  beforeEach(() => {
    // Reset gtag mock before each test
    delete window.gtag;
  });

  it('trackEvent does nothing when gtag is not defined', () => {
    // Should not throw
    expect(() => trackEvent('test_event', { foo: 'bar' })).not.toThrow();
  });

  it('trackEvent calls window.gtag when defined', () => {
    window.gtag = vi.fn();
    trackEvent('test_event', { country: 'india' });
    expect(window.gtag).toHaveBeenCalledWith('event', 'test_event', { country: 'india' });
  });

  it('trackQuestionAsked fires question_asked event', () => {
    window.gtag = vi.fn();
    trackQuestionAsked('india', 42);
    expect(window.gtag).toHaveBeenCalledWith('event', 'question_asked', expect.objectContaining({
      country: 'india',
      question_length: 42,
    }));
  });

  it('trackCountryChanged fires country_changed event', () => {
    window.gtag = vi.fn();
    trackCountryChanged('india', 'usa');
    expect(window.gtag).toHaveBeenCalledWith('event', 'country_changed', expect.objectContaining({
      from_country: 'india',
      to_country: 'usa',
    }));
  });

  it('trackTabChanged fires tab_changed event', () => {
    window.gtag = vi.fn();
    trackTabChanged('Timeline');
    expect(window.gtag).toHaveBeenCalledWith('event', 'tab_changed', expect.objectContaining({
      tab_name: 'Timeline',
    }));
  });

  it('trackTranslate fires translate_answer event', () => {
    window.gtag = vi.fn();
    trackTranslate('india', 'hi');
    expect(window.gtag).toHaveBeenCalledWith('event', 'translate_answer', expect.objectContaining({
      country: 'india',
      target_language: 'hi',
    }));
  });

  it('trackListenTTS fires listen_tts event', () => {
    window.gtag = vi.fn();
    trackListenTTS('india');
    expect(window.gtag).toHaveBeenCalledWith('event', 'listen_tts', expect.objectContaining({
      country: 'india',
    }));
  });
});
