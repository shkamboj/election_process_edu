import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Chat from '../components/Chat';

describe('Chat', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the welcome message', () => {
    render(<Chat />);
    expect(screen.getByText('Ask anything about Indian elections')).toBeInTheDocument();
  });

  it('renders suggestion buttons', () => {
    render(<Chat />);
    expect(screen.getByText('How do I register to vote in India?')).toBeInTheDocument();
    expect(screen.getByText('How does an EVM work?')).toBeInTheDocument();
    expect(screen.getByText('What is NOTA and how does it work?')).toBeInTheDocument();
  });

  it('renders the input field', () => {
    render(<Chat />);
    expect(
      screen.getByPlaceholderText('Ask about the Indian election process…')
    ).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    render(<Chat />);
    expect(screen.getByRole('button', { name: 'Submit question' })).toBeInTheDocument();
  });

  it('submit button is disabled when input is empty', () => {
    render(<Chat />);
    const askBtn = screen.getByRole('button', { name: 'Submit question' });
    expect(askBtn).toBeDisabled();
  });

  it('enables submit button when user types a question', () => {
    render(<Chat />);
    const input = screen.getByPlaceholderText('Ask about the Indian election process…');
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

    render(<Chat />);
    const input = screen.getByPlaceholderText('Ask about the Indian election process…');
    fireEvent.change(input, { target: { value: 'What is EVM?' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit question' }));

    // User message appears
    expect(screen.getByText('What is EVM?')).toBeInTheDocument();

    // Wait for assistant response
    await waitFor(() => {
      expect(screen.getByText(/Electronic Voting Machine/)).toBeInTheDocument();
    });

    // Verify fetch was called correctly
    expect(global.fetch).toHaveBeenCalledWith('/ask', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ question: 'What is EVM?' }),
    }));
  });

  it('displays error message on network failure', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

    render(<Chat />);
    const input = screen.getByPlaceholderText('Ask about the Indian election process…');
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

    render(<Chat />);
    const input = screen.getByPlaceholderText('Ask about the Indian election process…');
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

    render(<Chat />);
    const input = screen.getByPlaceholderText('Ask about the Indian election process…');
    fireEvent.change(input, { target: { value: 'My question' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit question' }));

    expect(input.value).toBe('');
  });

  it('sends message via suggestion button click', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ answer: 'Answer about EVMs', sources: [] }),
    });

    render(<Chat />);
    fireEvent.click(screen.getByText('How does an EVM work?'));

    await waitFor(() => {
      expect(screen.getByText(/Answer about EVMs/)).toBeInTheDocument();
    });
  });

  it('has accessible chat log region', () => {
    render(<Chat />);
    expect(screen.getByRole('log')).toBeInTheDocument();
  });

  it('has accessible search form', () => {
    render(<Chat />);
    expect(screen.getByRole('search')).toBeInTheDocument();
  });
});
