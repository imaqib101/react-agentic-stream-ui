import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStreamAutoScroll } from '../src/hooks/useStreamAutoScroll';

describe('useStreamAutoScroll', () => {
  it('initializes with default at-bottom state', () => {
    const { result } = renderHook(() => useStreamAutoScroll());

    expect(result.current.isAtBottom).toBe(true);
    expect(result.current.userScrolledUp).toBe(false);
    expect(result.current.unreadCount).toBe(0);
    expect(result.current.scrollRef.current).toBeNull();
  });

  it('scrolls to bottom on dependency update when user is at bottom', () => {
    const mockElement = {
      scrollHeight: 1000,
      clientHeight: 400,
      scrollTop: 580, // distanceToBottom = 20 <= threshold (48)
      scrollTo: vi.fn(),
    } as unknown as HTMLDivElement;

    const { result, rerender } = renderHook(
      ({ dep }) => {
        const hook = useStreamAutoScroll<HTMLDivElement>({ dependency: dep });
        // simulate ref assignment
        (hook.scrollRef as { current: HTMLDivElement | null }).current = mockElement;
        return hook;
      },
      { initialProps: { dep: 'initial' } }
    );

    expect(result.current.isAtBottom).toBe(true);

    rerender({ dep: 'updated chunk' });

    expect(mockElement.scrollTo).toHaveBeenCalled();
    expect(result.current.unreadCount).toBe(0);
  });

  it('increments unreadCount on dependency update when user scrolled up', () => {
    const mockElement = {
      scrollHeight: 1000,
      clientHeight: 400,
      scrollTop: 200, // distanceToBottom = 400 > threshold
      scrollTo: vi.fn(),
    } as unknown as HTMLDivElement;

    const { result, rerender } = renderHook(
      ({ dep }) => {
        const hook = useStreamAutoScroll<HTMLDivElement>({ dependency: dep });
        (hook.scrollRef as { current: HTMLDivElement | null }).current = mockElement;
        return hook;
      },
      { initialProps: { dep: 'chunk 1' } }
    );

    // Simulate user scroll event up
    act(() => {
      result.current.handleScroll();
    });

    expect(result.current.isAtBottom).toBe(false);
    expect(result.current.userScrolledUp).toBe(true);

    // Stream adds new chunk while user is looking at past messages
    rerender({ dep: 'chunk 2' });
    expect(result.current.unreadCount).toBe(1);

    rerender({ dep: 'chunk 3' });
    expect(result.current.unreadCount).toBe(2);

    // Manual scrollToBottom resets unread count and scrolls
    act(() => {
      result.current.scrollToBottom();
    });

    expect(result.current.unreadCount).toBe(0);
    expect(result.current.isAtBottom).toBe(true);
    expect(result.current.userScrolledUp).toBe(false);
  });
});
