import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArtifactCard } from '../src/components/ArtifactCard';
import { StreamArtifact } from '../src/hooks/useStreamArtifacts';

describe('ArtifactCard', () => {
  const mockArtifact: StreamArtifact = {
    id: 'art-1',
    type: 'code',
    title: 'Tailwind Config',
    language: 'javascript',
    content: 'module.exports = { content: ["./src/**/*.{js,ts,jsx,tsx}"] };',
    isComplete: true,
  };

  it('renders title, language badge, line count, and content', () => {
    render(<ArtifactCard artifact={mockArtifact} />);

    expect(screen.getByText('Tailwind Config')).toBeDefined();
    expect(screen.getByText('javascript')).toBeDefined();
    expect(screen.getByText(/1 line/i)).toBeDefined();
    expect(screen.getByTestId('artifact-content')).toBeDefined();
  });

  it('renders streaming indicator when isComplete is false', () => {
    const streamingArtifact: StreamArtifact = {
      ...mockArtifact,
      isComplete: false,
    };

    render(<ArtifactCard artifact={streamingArtifact} />);
    expect(screen.getByTestId('artifact-streaming-indicator')).toBeDefined();
    expect(screen.getByText(/Streaming\.\.\./i)).toBeDefined();
  });

  it('toggles accordion content when clicking header', () => {
    render(<ArtifactCard artifact={mockArtifact} defaultExpanded={true} />);

    expect(screen.getByTestId('artifact-content')).toBeDefined();

    // Click header to collapse
    fireEvent.click(screen.getByText('Tailwind Config'));
    expect(screen.queryByTestId('artifact-content')).toBeNull();

    // Click header to expand again
    fireEvent.click(screen.getByText('Tailwind Config'));
    expect(screen.getByTestId('artifact-content')).toBeDefined();
  });

  it('triggers onCopy callback when copy button is clicked', () => {
    const onCopy = vi.fn();
    render(<ArtifactCard artifact={mockArtifact} onCopy={onCopy} />);

    const copyBtn = screen.getByTestId('artifact-copy-btn');
    fireEvent.click(copyBtn);

    expect(onCopy).toHaveBeenCalledWith(mockArtifact.content);
    expect(screen.getByText('✓ Copied')).toBeDefined();
  });
});
