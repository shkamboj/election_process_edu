import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ElectionTimeline from '../components/ElectionTimeline';

const INDIA = {
  id: 'india', name: 'India', flag: '🇮🇳', accent: '#000080',
  headerGradient: 'linear-gradient(to right, #FF9933, #FFFFFF, #138808)',
};

const USA = {
  id: 'usa', name: 'United States', flag: '🇺🇸', accent: '#3C3B6E',
  headerGradient: 'linear-gradient(to right, #3C3B6E, #FFFFFF, #B22234)',
};

describe('ElectionTimeline', () => {
  it('renders the timeline heading for India', () => {
    render(<ElectionTimeline country={INDIA} />);
    expect(screen.getByText('India Election Timeline')).toBeInTheDocument();
  });

  it('renders India phases', () => {
    render(<ElectionTimeline country={INDIA} />);
    expect(screen.getByText('Pre-Election')).toBeInTheDocument();
    expect(screen.getByText('Nomination')).toBeInTheDocument();
    expect(screen.getByText('Campaigning')).toBeInTheDocument();
    expect(screen.getByText('Polling')).toBeInTheDocument();
    expect(screen.getByText('Counting & Results')).toBeInTheDocument();
    expect(screen.getByText('Government Formation')).toBeInTheDocument();
  });

  it('renders USA phases when country is USA', () => {
    render(<ElectionTimeline country={USA} />);
    expect(screen.getByText('United States Election Timeline')).toBeInTheDocument();
    expect(screen.getByText('Primaries & Caucuses')).toBeInTheDocument();
    expect(screen.getByText('Electoral College')).toBeInTheDocument();
    expect(screen.getByText('Inauguration')).toBeInTheDocument();
  });

  it('renders expandable step details', () => {
    render(<ElectionTimeline country={INDIA} />);
    expect(screen.getByText('Election Announcement')).toBeInTheDocument();
    expect(screen.getByText('Silence Period')).toBeInTheDocument();
  });
});
