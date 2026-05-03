import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Chat from '../components/Chat';

describe('Chat', () => {
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
});
