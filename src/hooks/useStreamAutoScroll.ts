import { useRef, useState, useCallback, useEffect } from 'react';

export interface UseStreamAutoScrollOptions {
  /**
   * Distance in pixels from the bottom within which the viewport is considered "at bottom".
   * Default: 48
   */
  threshold?: number;
  /**
   * Scroll behavior when automatically keeping up with streaming updates.
   * Default: 'smooth'
   */
  behavior?: ScrollBehavior;
  /**
   * Whether auto-scrolling is enabled.
   * Default: true
   */
  enabled?: boolean;
  /**
   * Optional dependency (e.g. tokens, toolCalls, message array) whose changes
   * trigger auto-scrolling if user is already at the bottom.
   */
  dependency?: unknown;
}

export interface UseStreamAutoScrollResult<T extends HTMLElement = HTMLDivElement> {
  /** Ref to attach to the scrollable container element. */
  scrollRef: React.RefObject<T>;
  /** Whether the container is currently scrolled within `threshold` of the bottom. */
  isAtBottom: boolean;
  /** Whether the user has manually scrolled up away from the bottom. */
  userScrolledUp: boolean;
  /** Number of dependency updates since user scrolled up. Resets on scroll to bottom. */
  unreadCount: number;
  /** Scroll the container directly to the bottom. */
  scrollToBottom: (customBehavior?: ScrollBehavior) => void;
  /** Scroll event listener to attach to container's onScroll. */
  handleScroll: () => void;
}

/**
 * Headless React hook for managing auto-scrolling in AI copilot / streaming interfaces.
 * Automatically pins the viewport to the bottom as tokens or tool outputs stream in,
 * while respecting manual user scroll up to review previous steps.
 */
export function useStreamAutoScroll<T extends HTMLElement = HTMLDivElement>(
  options: UseStreamAutoScrollOptions = {}
): UseStreamAutoScrollResult<T> {
  const { threshold = 48, behavior = 'smooth', enabled = true, dependency } = options;

  const scrollRef = useRef<T>(null);
  const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
  const [userScrolledUp, setUserScrolledUp] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const wasAtBottomRef = useRef<boolean>(true);

  const checkIfAtBottom = useCallback((): boolean => {
    const el = scrollRef.current;
    if (!el) return true;
    const distanceToBottom = el.scrollHeight - el.clientHeight - el.scrollTop;
    return distanceToBottom <= threshold;
  }, [threshold]);

  const scrollToBottom = useCallback(
    (customBehavior?: ScrollBehavior) => {
      const el = scrollRef.current;
      if (!el) return;

      const targetScrollTop = el.scrollHeight - el.clientHeight;

      if (typeof el.scrollTo === 'function') {
        el.scrollTo({
          top: targetScrollTop,
          behavior: customBehavior || behavior,
        });
      } else {
        el.scrollTop = targetScrollTop;
      }

      wasAtBottomRef.current = true;
      setIsAtBottom(true);
      setUserScrolledUp(false);
      setUnreadCount(0);
    },
    [behavior]
  );

  const handleScroll = useCallback(() => {
    const atBottom = checkIfAtBottom();
    wasAtBottomRef.current = atBottom;
    setIsAtBottom(atBottom);

    if (atBottom) {
      setUserScrolledUp(false);
      setUnreadCount(0);
    } else {
      setUserScrolledUp(true);
    }
  }, [checkIfAtBottom]);

  // React to dependency updates (e.g. streaming chunks or message array)
  useEffect(() => {
    if (!enabled) return;

    if (wasAtBottomRef.current) {
      // User is following the live stream, keep pinned to bottom
      scrollToBottom(behavior);
    } else {
      // User has scrolled up to inspect earlier content; increment unread badge
      setUnreadCount((prev) => prev + 1);
    }
  }, [dependency, enabled, behavior, scrollToBottom]);

  return {
    scrollRef,
    isAtBottom,
    userScrolledUp,
    unreadCount,
    scrollToBottom,
    handleScroll,
  };
}
