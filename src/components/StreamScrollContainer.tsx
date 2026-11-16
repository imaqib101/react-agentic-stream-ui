import React from 'react';
import { useStreamAutoScroll } from '../hooks/useStreamAutoScroll';

export interface StreamScrollContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The scrollable content (e.g. chat messages, token streams, tool timelines). */
  children: React.ReactNode;
  /** Dependency value (tokens, toolCalls, message list) that triggers auto-scroll evaluations. */
  scrollDependency?: unknown;
  /** Distance in pixels from bottom within which viewport stays pinned. Default 48. */
  threshold?: number;
  /** Scroll animation behavior ('smooth' | 'auto'). Default 'smooth'. */
  scrollBehavior?: ScrollBehavior;
  /** Whether auto-scrolling is enabled. Default true. */
  enabled?: boolean;
  /** Whether to render the floating "Scroll to bottom" button when user scrolls up. Default true. */
  showScrollButton?: boolean;
  /** Custom label or content inside the floating scroll button. */
  scrollButtonContent?: React.ReactNode;
  /** Custom render prop for the scroll to bottom button. */
  renderScrollButton?: (props: {
    onClick: () => void;
    unreadCount: number;
    isAtBottom: boolean;
  }) => React.ReactNode;
}

/**
 * A responsive scroll container optimized for LLM token streaming, copilot chats, and tool call traces.
 * Automatically pins the viewport to the bottom as new content streams, but cleanly disengages
 * when the user scrolls up to read past reasoning or tool outputs.
 */
export const StreamScrollContainer: React.FC<StreamScrollContainerProps> = ({
  children,
  scrollDependency,
  threshold = 48,
  scrollBehavior = 'smooth',
  enabled = true,
  showScrollButton = true,
  scrollButtonContent,
  renderScrollButton,
  className = '',
  style,
  ...rest
}) => {
  const {
    scrollRef,
    isAtBottom,
    unreadCount,
    scrollToBottom,
    handleScroll,
  } = useStreamAutoScroll<HTMLDivElement>({
    threshold,
    behavior: scrollBehavior,
    enabled,
    dependency: scrollDependency,
  });

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        minHeight: 0,
      }}
    >
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        data-testid="stream-scroll-viewport"
        className={`agentic-stream-scroll-container ${className}`}
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          width: '100%',
          scrollBehavior: 'smooth',
          ...style,
        }}
        {...rest}
      >
        {children}
      </div>

      {showScrollButton && !isAtBottom && (
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '24px',
            zIndex: 10,
          }}
        >
          {renderScrollButton ? (
            renderScrollButton({
              onClick: () => scrollToBottom(),
              unreadCount,
              isAtBottom,
            })
          ) : (
            <button
              type="button"
              onClick={() => scrollToBottom()}
              data-testid="stream-scroll-to-bottom-btn"
              aria-label="Scroll to bottom"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                backgroundColor: '#1f2937',
                color: '#ffffff',
                border: '1px solid #374151',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.15s ease-in-out',
              }}
            >
              <span>{scrollButtonContent || '↓ Latest'}</span>
              {unreadCount > 0 && (
                <span
                  data-testid="stream-scroll-unread-badge"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '18px',
                    height: '18px',
                    padding: '0 4px',
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    borderRadius: '9999px',
                    fontSize: '10px',
                    fontWeight: 700,
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
