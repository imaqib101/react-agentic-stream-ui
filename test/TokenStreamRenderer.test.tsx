import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TokenStreamRenderer } from '../src/components/TokenStreamRenderer';

describe('TokenStreamRenderer', () => {
  it('renders tokens text content cleanly', () => {
    render(<TokenStreamRenderer tokens="Hello, how can I help you today?" />);

    expect(screen.getByText('Hello, how can I help you today?')).toBeDefined();
    expect(screen.queryByTestId('token-stream-cursor')).toBeNull();
    expect(screen.queryByTestId('token-stream-placeholder')).toBeNull();
  });

  it('renders placeholder text when tokens is empty and not streaming', () => {
    render(
      <TokenStreamRenderer
        tokens=""
        isStreaming={false}
        placeholder="Waiting for response..."
      />
    );

    const placeholder = screen.getByTestId('token-stream-placeholder');
    expect(placeholder).toBeDefined();
    expect(placeholder.textContent).toBe('Waiting for response...');
    expect(screen.queryByTestId('token-stream-cursor')).toBeNull();
  });

  it('renders streaming cursor and sets aria-live to polite when streaming', () => {
    render(<TokenStreamRenderer tokens="Generating output" isStreaming={true} />);

    const container = screen.getByTestId('token-stream-container');
    expect(container.getAttribute('aria-live')).toBe('polite');

    const cursor = screen.getByTestId('token-stream-cursor');
    expect(cursor).toBeDefined();
    expect(cursor.style.backgroundColor).toBe('#3b82f6');
  });

  it('renders custom cursorChar and custom cursorColor', () => {
    render(
      <TokenStreamRenderer
        tokens="Live typing"
        isStreaming={true}
        cursorChar="▋"
        cursorColor="#10b981"
      />
    );

    const cursor = screen.getByTestId('token-stream-cursor');
    expect(cursor).toBeDefined();
    expect(cursor.textContent).toBe('▋');
    expect(cursor.style.color).toBe('#10b981');
    expect(cursor.style.backgroundColor).toBe('transparent');
  });

  it('applies custom className and preserves container styling', () => {
    render(
      <TokenStreamRenderer
        tokens="Custom styled tokens"
        className="custom-stream-box"
      />
    );

    const container = screen.getByTestId('token-stream-container');
    expect(container.classList.contains('custom-stream-box')).toBe(true);
    expect(container.classList.contains('agentic-token-stream')).toBe(true);
    expect(container.getAttribute('aria-live')).toBe('off');
  });
});
