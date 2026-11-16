import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StreamScrollContainer } from '../src/components/StreamScrollContainer';

describe('StreamScrollContainer', () => {
  it('renders children inside the scrollable container', () => {
    render(
      <StreamScrollContainer>
        <div data-testid="chat-message">Hello Agent</div>
      </StreamScrollContainer>
    );

    expect(screen.getByTestId('chat-message')).toBeDefined();
    expect(screen.getByTestId('chat-message').textContent).toBe('Hello Agent');
    expect(screen.getByTestId('stream-scroll-viewport')).toBeDefined();
    expect(screen.queryByTestId('stream-scroll-to-bottom-btn')).toBeNull();
  });

  it('renders custom button content and unread badge when user scrolled up', () => {
    const { rerender } = render(
      <StreamScrollContainer scrollDependency="init">
        <div style={{ height: '1000px' }}>Content</div>
      </StreamScrollContainer>
    );

    const viewport = screen.getByTestId('stream-scroll-viewport');

    // Mock dimensions to simulate user scrolling up
    Object.defineProperty(viewport, 'scrollHeight', { value: 2000, configurable: true });
    Object.defineProperty(viewport, 'clientHeight', { value: 400, configurable: true });
    Object.defineProperty(viewport, 'scrollTop', { value: 100, configurable: true, writable: true });
    viewport.scrollTo = vi.fn();

    // Trigger scroll event
    fireEvent.scroll(viewport);

    // Update dependency to trigger unread increment
    rerender(
      <StreamScrollContainer scrollDependency="next_chunk">
        <div style={{ height: '1000px' }}>Content</div>
      </StreamScrollContainer>
    );

    const button = screen.getByTestId('stream-scroll-to-bottom-btn');
    expect(button).toBeDefined();

    const badge = screen.getByTestId('stream-scroll-unread-badge');
    expect(badge.textContent).toBe('1');

    // Clicking button triggers scrollTo
    fireEvent.click(button);
    expect(viewport.scrollTo).toHaveBeenCalled();
  });

  it('supports custom renderScrollButton prop', () => {
    render(
      <StreamScrollContainer
        renderScrollButton={({ onClick, unreadCount }) => (
          <button data-testid="custom-scroll-btn" onClick={onClick}>
            Custom ({unreadCount})
          </button>
        )}
      >
        <div>Content</div>
      </StreamScrollContainer>
    );

    const viewport = screen.getByTestId('stream-scroll-viewport');
    Object.defineProperty(viewport, 'scrollHeight', { value: 2000, configurable: true });
    Object.defineProperty(viewport, 'clientHeight', { value: 400, configurable: true });
    Object.defineProperty(viewport, 'scrollTop', { value: 100, configurable: true, writable: true });

    fireEvent.scroll(viewport);

    const customBtn = screen.getByTestId('custom-scroll-btn');
    expect(customBtn).toBeDefined();
    expect(customBtn.textContent).toContain('Custom');
  });
});
