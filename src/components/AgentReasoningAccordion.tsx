import React, { useState, useEffect } from 'react';

export interface AgentReasoningAccordionProps {
  thought: string;
  isStreaming?: boolean;
  defaultExpanded?: boolean;
  durationMs?: number;
  title?: string;
  className?: string;
  onCopy?: (thought: string) => void;
  showWordCount?: boolean;
}

export const AgentReasoningAccordion: React.FC<AgentReasoningAccordionProps> = ({
  thought,
  isStreaming = false,
  defaultExpanded = false,
  durationMs,
  title = 'Reasoning Process',
  className = '',
  onCopy,
  showWordCount = true,
}) => {
  const [expanded, setExpanded] = useState<boolean>(defaultExpanded);
  const [copied, setCopied] = useState<boolean>(false);

  // Auto-expand when streaming starts if not manually collapsed
  useEffect(() => {
    if (isStreaming) {
      setExpanded(true);
    }
  }, [isStreaming]);

  // Reset copy status after 2 seconds
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => {
      clearTimeout(timer);
    };
  }, [copied]);

  if (!thought && !isStreaming) {
    return null;
  }

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCopy) {
      onCopy(thought);
    } else if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(thought);
      } catch {
        // Fallback or ignore
      }
    }
    setCopied(true);
  };

  const wordCount = thought.trim() ? thought.trim().split(/\s+/).length : 0;
  const formattedDuration =
    durationMs !== undefined
      ? durationMs >= 1000
        ? `${(durationMs / 1000).toFixed(1)}s`
        : `${durationMs}ms`
      : null;

  return (
    <div
      className={`agentic-reasoning-accordion ${className}`}
      data-testid="agent-reasoning-accordion"
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        backgroundColor: '#fafafa',
        margin: '10px 0',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        data-testid="reasoning-header"
        onClick={() => setExpanded(!expanded)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          backgroundColor: '#f3f4f6',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '12px',
              transition: 'transform 0.2s ease',
              display: 'inline-block',
              transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
              color: '#6b7280',
            }}
          >
            ▶
          </span>
          <span style={{ fontSize: '15px' }}>🧠</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
            {title}
          </span>

          {isStreaming ? (
            <span
              data-testid="reasoning-streaming-badge"
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#2563eb',
                backgroundColor: '#dbeafe',
                padding: '2px 8px',
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#2563eb',
                  display: 'inline-block',
                }}
              />
              Thinking...
            </span>
          ) : (
            formattedDuration && (
              <span
                data-testid="reasoning-duration-badge"
                style={{
                  fontSize: '11px',
                  color: '#6b7280',
                  backgroundColor: '#e5e7eb',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                Thought for {formattedDuration}
              </span>
            )
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {showWordCount && wordCount > 0 && (
            <span
              data-testid="reasoning-word-count"
              style={{ fontSize: '11px', color: '#9ca3af' }}
            >
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </span>
          )}

          {thought && (
            <button
              type="button"
              data-testid="reasoning-copy-btn"
              onClick={handleCopy}
              style={{
                background: 'none',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                padding: '2px 8px',
                fontSize: '11px',
                cursor: 'pointer',
                color: copied ? '#059669' : '#4b5563',
                backgroundColor: copied ? '#ecfdf5' : '#ffffff',
                fontWeight: 500,
              }}
              title="Copy reasoning trace"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div
          role="region"
          aria-label={title}
          data-testid="reasoning-content"
          style={{
            padding: '12px 14px',
            borderTop: '1px solid #e5e7eb',
            backgroundColor: '#ffffff',
            fontSize: '13px',
            lineHeight: 1.6,
            color: '#4b5563',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxHeight: '400px',
            overflowY: 'auto',
          }}
        >
          {thought || (
            <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>
              Formulating thought trajectory...
            </span>
          )}
        </div>
      )}
    </div>
  );
};
