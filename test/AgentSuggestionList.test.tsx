import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AgentSuggestionList, AgentSuggestionItem } from '../src/components/AgentSuggestionList';

describe('AgentSuggestionList', () => {
  it('returns null if suggestions array is empty', () => {
    const { container } = render(
      <AgentSuggestionList suggestions={[]} onSelect={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders chips variant with string suggestions and handles clicks', () => {
    const onSelect = vi.fn();
    const suggestions = ['Generate Unit Tests', 'Explain Code', 'Optimize Query'];

    render(
      <AgentSuggestionList
        suggestions={suggestions}
        onSelect={onSelect}
        title="Next steps"
        variant="chips"
      />
    );

    expect(screen.getByTestId('suggestion-list-title').textContent).toContain('Next steps');
    expect(screen.getByText('Generate Unit Tests')).toBeDefined();
    expect(screen.getByText('Explain Code')).toBeDefined();
    expect(screen.getByText('Optimize Query')).toBeDefined();

    const chip1 = screen.getByTestId('suggestion-chip-0');
    fireEvent.click(chip1);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('Generate Unit Tests', 0);
  });

  it('renders cards variant with structured suggestions and categories', () => {
    const onSelect = vi.fn();
    const suggestions: AgentSuggestionItem[] = [
      {
        id: 'opt-1',
        label: 'Run Benchmarks',
        description: 'Simulate 10,000 requests/sec with p99 latency tracking',
        category: 'Performance',
      },
      {
        id: 'opt-2',
        label: 'Security Audit',
        description: 'Check for OWASP Top 10 vulnerabilities in API routes',
        category: 'Security',
      },
    ];

    render(
      <AgentSuggestionList
        suggestions={suggestions}
        onSelect={onSelect}
        title="Recommended Actions"
        variant="cards"
      />
    );

    expect(screen.getByText('Run Benchmarks')).toBeDefined();
    expect(
      screen.getByText('Simulate 10,000 requests/sec with p99 latency tracking')
    ).toBeDefined();
    expect(screen.getByText('Performance')).toBeDefined();

    const card2 = screen.getByTestId('suggestion-card-1');
    fireEvent.click(card2);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(suggestions[1], 1);
  });

  it('renders list variant and supports keyboard navigation via Enter key', () => {
    const onSelect = vi.fn();
    const suggestions = ['Refactor to functional style', 'Add JSDoc documentation'];

    render(
      <AgentSuggestionList
        suggestions={suggestions}
        onSelect={onSelect}
        variant="list"
      />
    );

    const item = screen.getByTestId('suggestion-list-item-0');
    fireEvent.keyDown(item, { key: 'Enter', code: 'Enter' });

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('Refactor to functional style', 0);
  });

  it('disables all buttons and suppresses interactions when disabled=true', () => {
    const onSelect = vi.fn();
    const suggestions = ['Draft reply', 'Summarize thread'];

    render(
      <AgentSuggestionList
        suggestions={suggestions}
        onSelect={onSelect}
        disabled={true}
      />
    );

    const chip = screen.getByTestId('suggestion-chip-0') as HTMLButtonElement;
    expect(chip.disabled).toBe(true);

    fireEvent.click(chip);
    fireEvent.keyDown(chip, { key: 'Enter' });

    expect(onSelect).not.toHaveBeenCalled();
  });
});
