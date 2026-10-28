import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AgentReasoningAccordion } from '../src/components/AgentReasoningAccordion';

describe('AgentReasoningAccordion', () => {
  it('returns null when thought is empty and not streaming', () => {
    const { container } = render(<AgentReasoningAccordion thought="" isStreaming={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders streaming state with pulsating indicator', () => {
    render(
      <AgentReasoningAccordion
        thought="Analyzing user query..."
        isStreaming={true}
        title="Active Reasoning"
      />,
    );

    expect(screen.getByTestId('agent-reasoning-accordion')).toBeDefined();
    expect(screen.getByText('Active Reasoning')).toBeDefined();
    expect(screen.getByTestId('reasoning-streaming-badge')).toBeDefined();
    expect(screen.getByText('Thinking...')).toBeDefined();
    // Auto-expands when streaming
    expect(screen.getByTestId('reasoning-content')).toBeDefined();
    expect(screen.getByText('Analyzing user query...')).toBeDefined();
  });

  it('renders collapsed by default when not streaming, toggles on click and Enter key', () => {
    render(
      <AgentReasoningAccordion
        thought="Detailed step 1: fetch data\nStep 2: parse response."
        defaultExpanded={false}
      />,
    );

    const header = screen.getByTestId('reasoning-header');
    expect(header.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByTestId('reasoning-content')).toBeNull();

    // Toggle expand via click
    fireEvent.click(header);
    expect(header.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByTestId('reasoning-content')).toBeDefined();

    // Toggle collapse via keyboard Enter
    fireEvent.keyDown(header, { key: 'Enter' });
    expect(header.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByTestId('reasoning-content')).toBeNull();
  });

  it('displays duration badge and word count accurately', () => {
    render(
      <AgentReasoningAccordion
        thought="First step is to validate the schema."
        durationMs={1850}
        showWordCount={true}
      />,
    );

    expect(screen.getByTestId('reasoning-duration-badge')).toBeDefined();
    expect(screen.getByText('Thought for 1.9s')).toBeDefined();
    expect(screen.getByTestId('reasoning-word-count')).toBeDefined();
    expect(screen.getByText('7 words')).toBeDefined();
  });

  it('handles copy button click and triggers onCopy callback', () => {
    const onCopyMock = vi.fn();
    render(
      <AgentReasoningAccordion
        thought="Chain-of-thought hypothesis."
        defaultExpanded={true}
        onCopy={onCopyMock}
      />,
    );

    const copyBtn = screen.getByTestId('reasoning-copy-btn');
    expect(copyBtn).toBeDefined();
    fireEvent.click(copyBtn);

    expect(onCopyMock).toHaveBeenCalledWith('Chain-of-thought hypothesis.');
    expect(screen.getByText('✓ Copied')).toBeDefined();
  });
});
