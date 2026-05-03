import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Chat from '../components/Chat';

const INDIA = {
  id: 'india', name: 'India', flag: '🇮🇳', accent: '#000080',
  language: 'hi', ttsLanguage: 'hi-IN', languageName: 'हिन्दी',
  headerGradient: 'linear-gradient(to right, #FF9933, #FFFFFF, #138808)',
};

const USA = {
  id: 'usa', name: 'United States', flag: '🇺🇸', accent: '#3C3B6E',
  language: 'en', ttsLanguage: 'en-US', languageName: 'English',
  headerGradient: 'linear-gradient(to right, #3C3B6E, #FFFFFF, #B22234)',
};

describe('Chat', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the welcome message', () => {
    render(<Chat country={INDIA} />);
    expect(screen.getByText('Ask anything about India elections')).toBeInTheDocument();
  });

  it('renders suggestion buttons', () => {
    render(<Chat country={INDIA} />);
    expect(screen.getByText('How do I register to vote in India?')).toBeInTheDocument();
  });

  it('renders the input field', () => {
    render(<Chat country={INDIA} />);
    expect(
      screen.getByPlaceholderText('Ask about the India election process…')
    ).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    render(<Chat country={INDIA} />);
    expect(screen.getByRole('button', { name: 'Submit question' })).toBeInTheDocument();
  });

  it('submit button is disabled when input is empty', () => {
    render(<Chat country={INDIA} />);
    const askBtn = screen.getByRole('button', { name: 'Submit question' });
    expect(askBtn).toBeDisabled();
  });

  it('enables submit button when user types a question', () => {
    render(<Chat country={INDIA} />);
    const input = screen.getByPlaceholderText('Ask about the India election process…');
    fireEvent.change(input, { target: { value: 'What is EVM?' } });
    const askBtn = screen.getByRole('button', { name: 'Submit question' });
    expect(askBtn).not.toBeDisabled();
  });

  it('sends a message and displays the response', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        answer: 'EVM stands for Electronic Voting Machine.',
        sources: ['evm_vvpat'],
      }),
    });

    render(<Chat country={INDIA} />);
    const input = screen.getByPlaceholderText('Ask about the India election process…');
    fireEvent.change(input, { target: { value: 'What is EVM?' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit question' }));

    expect(screen.getByText('What is EVM?')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Electronic Voting Machine/)).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/ask', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ question: 'What is EVM?', country: 'india' }),
    }));
  });

  it('displays error message on network failure', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

    render(<Chat country={INDIA} />);
    const input = screen.getByPlaceholderText('Ask about the India election process…');
    fireEvent.change(input, { target: { value: 'Test question' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit question' }));

    await waitFor(() => {
      expect(screen.getByText(/Error: Network error/)).toBeInTheDocument();
    });
  });

  it('displays error on non-ok response', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: () => Promise.resolve({ detail: 'Service temporarily unavailable' }),
    });

    render(<Chat country={INDIA} />);
    const input = screen.getByPlaceholderText('Ask about the India election process…');
    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit question' }));

    await waitFor(() => {
      expect(screen.getByText(/Service temporarily unavailable/)).toBeInTheDocument();
    });
  });

  it('clears input after sending message', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ answer: 'Answer', sources: [] }),
    });

    render(<Chat country={INDIA} />);
    const input = screen.getByPlaceholderText('Ask about the India election process…');
    fireEvent.change(input, { target: { value: 'My question' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit question' }));

    expect(input.value).toBe('');
  });

  it('sends message via suggestion button click', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ answer: 'Answer about EVMs', sources: [] }),
    });

    render(<Chat country={INDIA} />);
    fireEvent.click(screen.getByText('How does an EVM work?'));

    await waitFor(() => {
      expect(screen.getByText(/Answer about EVMs/)).toBeInTheDocument();
    });
  });

  it('has accessible chat log region', () => {
    render(<Chat country={INDIA} />);
    expect(screen.getByRole('log')).toBeInTheDocument();
  });

  it('has accessible search form', () => {
    render(<Chat country={INDIA} />);
    expect(screen.getByRole('search')).toBeInTheDocument();
  });

  it('sends message on Enter key press', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ answer: 'Enter key answer', sources: [] }),
    });
    render(<Chat country={INDIA} />);
    const input = screen.getByPlaceholderText('Ask about the India election process…');
    fireEvent.change(input, { target: { value: 'EVM question' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });
    await waitFor(() => {
      expect(screen.getByText(/Enter key answer/)).toBeInTheDocument();
    });
  });

  it('does not send message on Shift+Enter', () => {
    global.fetch = vi.fn();
    render(<Chat country={INDIA} />);
    const input = screen.getByPlaceholderText('Ask about the India election process…');
    fireEvent.change(input, { target: { value: 'My question' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('shows translate button for non-English country', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ answer: 'India elections use EVMs.', sources: [] }),
    });
    render(<Chat country={INDIA} />);
    const input = screen.getByPlaceholderText('Ask about the India election process…');
    fireEvent.change(input, { target: { value: 'What is EVM?' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit question' }));
    await waitFor(() => {
      expect(screen.getByText(/India elections use EVMs/)).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/Translate to हिन्दी/)).toBeInTheDocument();
  });

  it('hides translate button for English country', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ answer: 'US elections use Electoral College.', sources: [] }),
    });
    render(<Chat country={USA} />);
    const input = screen.getByPlaceholderText('Ask about the United States election process…');
    fireEvent.change(input, { target: { value: 'How does voting work?' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit question' }));
    await waitFor(() => {
      expect(screen.getByText(/Electoral College/)).toBeInTheDocument();
    });
    expect(screen.queryByLabelText(/Translate to/)).not.toBeInTheDocument();
  });

  it('shows Listen button after receiving an answer', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ answer: 'An EVM is a voting machine.', sources: [] }),
    });
    render(<Chat country={INDIA} />);
    const input = screen.getByPlaceholderText('Ask about the India election process…');
    fireEvent.change(input, { target: { value: 'EVM?' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit question' }));
    await waitFor(() => {
      expect(screen.getByLabelText(/Listen to this answer/)).toBeInTheDocument();
    });
  });

  it('shows translated text when translate button clicked (success)', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ answer: 'EVMs are secure.', sources: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ translated_text: 'ईवीएम सुरक्षित हैं।', source_language: 'en', target_language: 'hi' }),
      });
    render(<Chat country={INDIA} />);
    const input = screen.getByPlaceholderText('Ask about the India election process…');
    fireEvent.change(input, { target: { value: 'Are EVMs secure?' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit question' }));
    await waitFor(() => screen.getByText(/EVMs are secure/));
    fireEvent.click(screen.getByLabelText(/Translate to हिन्दी/));
    await waitFor(() => {
      expect(screen.getByText('ईवीएम सुरक्षित हैं।')).toBeInTheDocument();
    });
  });

  it('shows error when translate fails', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ answer: 'EVMs are secure.', sources: [] }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ detail: 'Translation service unavailable' }),
      });
    render(<Chat country={INDIA} />);
    const input = screen.getByPlaceholderText('Ask about the India election process…');
    fireEvent.change(input, { target: { value: 'EVMs?' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit question' }));
    await waitFor(() => screen.getByText(/EVMs are secure/));
    fireEvent.click(screen.getByLabelText(/Translate to हिन्दी/));
    await waitFor(() => {
      expect(screen.getByText(/Translation service unavailable/)).toBeInTheDocument();
    });
  });

  it('toggles translation off on second click', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ answer: 'EVMs are secure.', sources: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ translated_text: 'ईवीएम सुरक्षित हैं।', source_language: 'en', target_language: 'hi' }),
      });
    render(<Chat country={INDIA} />);
    const input = screen.getByPlaceholderText('Ask about the India election process…');
    fireEvent.change(input, { target: { value: 'EVM?' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit question' }));
    await waitFor(() => screen.getByText(/EVMs are secure/));
    fireEvent.click(screen.getByLabelText(/Translate to हिन्दी/));
    await waitFor(() => screen.getByText('ईवीएम सुरक्षित हैं।'));
    // Second click hides translation
    fireEvent.click(screen.getByLabelText(/Hide हिन्दी/));
    await waitFor(() => {
      expect(screen.queryByText('ईवीएम सुरक्षित हैं।')).not.toBeInTheDocument();
    });
  });

  it('shows error state when TTS fails', async () => {
    // Mock Audio to avoid jsdom issues
    global.Audio = vi.fn(() => ({ play: vi.fn(), pause: vi.fn() }));
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ answer: 'An EVM answer.', sources: [] }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ detail: 'TTS unavailable' }),
      });
    render(<Chat country={INDIA} />);
    const input = screen.getByPlaceholderText('Ask about the India election process…');
    fireEvent.change(input, { target: { value: 'EVM?' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit question' }));
    await waitFor(() => screen.getByText(/An EVM answer/));
    await act(async () => {
      fireEvent.click(screen.getByLabelText(/Listen to this answer/));
    });
    await waitFor(() => {
      // After error, button should be back (error state clears ttsState slot)
      expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
    });
  });
});
