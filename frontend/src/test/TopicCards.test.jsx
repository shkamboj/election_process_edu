import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TopicCards from '../components/TopicCards';

const INDIA = {
  id: 'india', name: 'India', flag: '🇮🇳', accent: '#000080',
  headerGradient: 'linear-gradient(to right, #FF9933, #FFFFFF, #138808)',
};

const USA = {
  id: 'usa', name: 'United States', flag: '🇺🇸', accent: '#3C3B6E',
  headerGradient: 'linear-gradient(to right, #3C3B6E, #FFFFFF, #B22234)',
};

describe('TopicCards', () => {
  it('renders the heading', () => {
    render(<TopicCards country={INDIA} />);
    expect(screen.getByText('Explore Topics')).toBeInTheDocument();
  });

  it('renders India topic cards', () => {
    render(<TopicCards country={INDIA} />);
    expect(screen.getByText('Indian Democracy Basics')).toBeInTheDocument();
    expect(screen.getByText('Election Commission of India')).toBeInTheDocument();
    expect(screen.getByText('EVM & VVPAT')).toBeInTheDocument();
  });

  it('renders USA topic cards when country is USA', () => {
    render(<TopicCards country={USA} />);
    expect(screen.getByText('Electoral College')).toBeInTheDocument();
    expect(screen.getByText('Campaign Finance')).toBeInTheDocument();
  });

  it('renders description text with country name', () => {
    render(<TopicCards country={INDIA} />);
    expect(screen.getByText(/India election process/)).toBeInTheDocument();
  });
});
