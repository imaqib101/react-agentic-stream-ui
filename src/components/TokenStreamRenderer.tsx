import React, { useMemo } from 'react';

export interface TokenStreamRendererProps {
  tokens: string;
  isStreaming?: boolean;
  className?: string;
  placeholder?: string;
  cursorChar?: string;
  cursorColor?: string;
}

export const TokenStreamRenderer: React.FC<TokenStreamRendererProps> = ({
  tokens,
  isStreaming = false,
  className = '',
  placeholder,
  cursorChar,
  cursorColor = '#3b82f6',
}) => {
  const renderedContent = useMemo(() => {
    return tokens;
  }, [tokens]);

  const isEmpty = !renderedContent || renderedContent.length === 0;

  return (
    <div
      data-testid="token-stream-container"
      aria-live={isStreaming ? 'polite' : 'off'}
      className={`agentic-token-stream ${className}`}
      style={{
        lineHeight: 1.6,
        fontSize: '15px',
        color: '#1f2937',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      {isEmpty && placeholder && !isStreaming ? (
        <span
          data-testid="token-stream-placeholder"
          style={{ color: '#9ca3af', fontStyle: 'italic' }}
        >
          {placeholder}
        </span>
      ) : (
        renderedContent
      )}
      {isStreaming && (
        <span
          data-testid="token-stream-cursor"
          className="agentic-streaming-cursor"
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: cursorChar ? 'auto' : '6px',
            height: cursorChar ? 'auto' : '14px',
            backgroundColor: cursorChar ? 'transparent' : cursorColor,
            color: cursorChar ? cursorColor : undefined,
            marginLeft: '4px',
            verticalAlign: 'middle',
            animation: 'pulse 1s infinite',
            fontWeight: 'bold',
          }}
        >
          {cursorChar || ''}
        </span>
      )}
    </div>
  );
};
