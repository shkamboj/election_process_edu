import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import YouTubeVideos from '../components/YouTubeVideos';

const INDIA = {
  id: 'india', name: 'India', flag: '🇮🇳', accent: '#000080',
};

const VIDEO = {
  video_id: 'abcdefghijk',
  title: 'How Elections Work',
  channel: 'NewsChannel',
  thumbnail: 'https://i.ytimg.com/vi/abcdefghijk/mqdefault.jpg',
};

describe('YouTubeVideos', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the section heading', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ videos: [VIDEO] }),
    });
    await act(async () => {
      render(<YouTubeVideos country={INDIA} />);
    });
    expect(screen.getByText('Learn more - YouTube')).toBeInTheDocument();
  });

  it('shows fetched videos from API', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ videos: [VIDEO] }),
    });
    await act(async () => {
      render(<YouTubeVideos country={INDIA} />);
    });
    await waitFor(() => {
      expect(screen.getByText('How Elections Work')).toBeInTheDocument();
    });
  });

  it('shows fallback videos when API returns empty list', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ videos: [] }),
    });
    await act(async () => {
      render(<YouTubeVideos country={INDIA} />);
    });
    await waitFor(() => {
      // Fallback videos should appear (default or india-specific)
      expect(screen.getAllByRole('button', { name: /Play:/ }).length).toBeGreaterThan(0);
    });
  });

  it('shows fallback videos when fetch throws (network error)', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));
    await act(async () => {
      render(<YouTubeVideos country={INDIA} />);
    });
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /Play:/ }).length).toBeGreaterThan(0);
    });
  });

  it('renders nothing when API returns 503 (unavailable)', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: () => Promise.resolve({}),
    });
    let container;
    await act(async () => {
      ({ container } = render(<YouTubeVideos country={INDIA} />));
    });
    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('plays video inline when VideoCard play button is clicked', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ videos: [VIDEO] }),
    });
    await act(async () => {
      render(<YouTubeVideos country={INDIA} />);
    });
    await waitFor(() => screen.getByRole('button', { name: /Play: How Elections Work/ }));
    fireEvent.click(screen.getByRole('button', { name: /Play: How Elections Work/ }));
    await waitFor(() => {
      const iframe = screen.getByTitle('How Elections Work');
      expect(iframe).toBeInTheDocument();
      expect(iframe.getAttribute('src')).toContain('abcdefghijk');
    });
  });

  it('shows loading skeleton initially', () => {
    // Fetch never resolves — stay in loading state
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<YouTubeVideos country={INDIA} />);
    // Skeleton cards are rendered as divs with animate-pulse
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows channel name in video card', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ videos: [VIDEO] }),
    });
    await act(async () => {
      render(<YouTubeVideos country={INDIA} />);
    });
    await waitFor(() => {
      expect(screen.getByText('NewsChannel')).toBeInTheDocument();
    });
  });
});
