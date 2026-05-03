import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TopicCards from '../components/TopicCards';

describe('TopicCards', () => {
  it('renders the heading', () => {
    render(<TopicCards />);
    expect(screen.getByText('Explore Topics')).toBeInTheDocument();
  });

  it('renders all 10 topic cards', () => {
    render(<TopicCards />);
    expect(screen.getByText('Indian Democracy Basics')).toBeInTheDocument();
    expect(screen.getByText('Election Commission of India')).toBeInTheDocument();
    expect(screen.getByText('Types of Elections')).toBeInTheDocument();
    expect(screen.getByText('Voter Registration')).toBeInTheDocument();
    expect(screen.getByText('Election Timeline')).toBeInTheDocument();
    expect(screen.getByText('EVM & VVPAT')).toBeInTheDocument();
    expect(screen.getByText('Voting Process')).toBeInTheDocument();
    expect(screen.getByText('Model Code of Conduct')).toBeInTheDocument();
    expect(screen.getByText('Post-Election Process')).toBeInTheDocument();
    expect(screen.getByText('Key Legislation')).toBeInTheDocument();
  });

  it('renders topic emojis', () => {
    render(<TopicCards />);
    expect(screen.getByText('🏛️')).toBeInTheDocument();
    expect(screen.getByText('⚖️')).toBeInTheDocument();
    expect(screen.getByText('🗳️')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(<TopicCards />);
    expect(screen.getByText(/Browse key topics/)).toBeInTheDocument();
  });
});
