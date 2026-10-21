import React, { useMemo } from 'react';

export interface TokenStreamRendererProps {
  tokens: string;
  isStreaming?: boolean;
  className?: string;
}

export const TokenStreamRenderer: React.FC<TokenStreamRendererProps> = ({
  tokens,
  isStreaming = false,
  className = '',
}) => {
  const renderedContent = useMemo(() => {
    return tokens;
  }, [tokens]);

  return (
    <div
      className={`agentic-token-stream ${className}`}
      style={{
        lineHeight: 1.6,
        fontSize: '15px',
        color: '#1f2937',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      {renderedContent}
      {isStreaming && (
        <span
          className="agentic-streaming-cursor"
          style={{
            display: 'inline-block',
            width: '6px',
            height: '14px',
            backgroundColor: '#3b82f6',
            marginLeft: '4px',
            verticalAlign: 'middle',
            animation: 'pulse 1s infinite',
          }}
        />
      )}
    </div>
  );
};
