import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ElectionTimeline from '../components/ElectionTimeline';

describe('ElectionTimeline', () => {
  it('renders the timeline heading', () => {
    render(<ElectionTimeline />);
    expect(
      screen.getByText('Election Timeline — From Announcement to Government')
    ).toBeInTheDocument();
  });

  it('renders all six phases', () => {
    render(<ElectionTimeline />);
    expect(screen.getByText('Pre-Election')).toBeInTheDocument();
    expect(screen.getByText('Nomination')).toBeInTheDocument();
    expect(screen.getByText('Campaigning')).toBeInTheDocument();
    expect(screen.getByText('Polling')).toBeInTheDocument();
    expect(screen.getByText('Counting & Results')).toBeInTheDocument();
    expect(screen.getByText('Government Formation')).toBeInTheDocument();
  });

  it('renders expandable step details', () => {
    render(<ElectionTimeline />);
    expect(screen.getByText('Election Announcement')).toBeInTheDocument();
    expect(screen.getByText('Filing of Nominations')).toBeInTheDocument();
    expect(screen.getByText('Silence Period')).toBeInTheDocument();
  });

  it('renders phase numbers 1–6', () => {
    render(<ElectionTimeline />);
    for (let i = 1; i <= 6; i++) {
      expect(screen.getByText(String(i))).toBeInTheDocument();
    }
  });
});
