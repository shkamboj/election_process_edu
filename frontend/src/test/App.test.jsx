import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App', () => {
  it('renders the header title', () => {
    render(<App />);
    expect(screen.getByText('Indian Election Process')).toBeInTheDocument();
  });

  it('renders all three navigation tabs', () => {
    render(<App />);
    expect(screen.getByRole('tab', { name: 'Timeline' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Topics' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Ask' })).toBeInTheDocument();
  });

  it('defaults to Timeline tab', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Election Timeline — From Announcement to Government')).toBeInTheDocument();
    });
  });

  it('switches to Topics tab when clicked', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: 'Topics' }));
    await waitFor(() => {
      expect(screen.getByText('Explore Topics')).toBeInTheDocument();
    });
  });

  it('switches to Ask tab when clicked', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: 'Ask' }));
    await waitFor(() => {
      expect(screen.getByText('Ask anything about Indian elections')).toBeInTheDocument();
    });
  });

  it('renders the footer disclaimer', () => {
    render(<App />);
    expect(screen.getByText(/Educational purposes only/)).toBeInTheDocument();
  });
});
