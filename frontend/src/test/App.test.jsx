import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App', () => {
  it('renders the header title with India as default', () => {
    render(<App />);
    expect(screen.getByText('India Election Process')).toBeInTheDocument();
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
      expect(screen.getByText('India Election Timeline')).toBeInTheDocument();
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
      expect(screen.getByText('Ask anything about India elections')).toBeInTheDocument();
    });
  });

  it('renders the footer disclaimer', () => {
    render(<App />);
    expect(screen.getByText(/Educational purposes only/)).toBeInTheDocument();
  });

  it('renders country selector button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Select country/ })).toBeInTheDocument();
  });

  it('opens country selector and shows all 10 countries', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Select country/ }));
    await waitFor(() => {
      expect(screen.getByRole('listbox', { name: 'Select a country' })).toBeInTheDocument();
    });
    expect(screen.getByText('United States')).toBeInTheDocument();
    expect(screen.getByText('Brazil')).toBeInTheDocument();
    expect(screen.getByText('Japan')).toBeInTheDocument();
  });

  it('closes country selector on outside click', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Select country/ }));
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
    // Click outside the selector
    fireEvent.mouseDown(document.body);
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });
});
