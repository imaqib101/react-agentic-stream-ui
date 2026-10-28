import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { TokenStreamRenderer } from '../src/components/TokenStreamRenderer';

describe('TokenStreamRenderer', () => {
  it('renders the token text', () => {
    const { container } = render(<TokenStreamRenderer tokens="Hello world" />);
    expect(container.textContent).toBe('Hello world');
  });

  it('shows the streaming cursor only while streaming', () => {
    const { container, rerender } = render(<TokenStreamRenderer tokens="Hi" isStreaming />);
    expect(container.querySelector('.agentic-streaming-cursor')).not.toBeNull();

    rerender(<TokenStreamRenderer tokens="Hi" isStreaming={false} />);
    expect(container.querySelector('.agentic-streaming-cursor')).toBeNull();
  });

  it('applies a custom className', () => {
    const { container } = render(<TokenStreamRenderer tokens="x" className="custom" />);
    expect(container.firstElementChild?.classList.contains('custom')).toBe(true);
    expect(container.firstElementChild?.classList.contains('agentic-token-stream')).toBe(true);
  });
});
