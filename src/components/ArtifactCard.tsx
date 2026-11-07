import React, { useState } from 'react';
import { StreamArtifact } from '../hooks/useStreamArtifacts';

export interface ArtifactCardProps {
  artifact: StreamArtifact;
  onCopy?: (content: string) => void;
  className?: string;
  defaultExpanded?: boolean;
}

export const ArtifactCard: React.FC<ArtifactCardProps> = ({
  artifact,
  onCopy,
  className = '',
  defaultExpanded = true,
}) => {
  const [expanded, setExpanded] = useState<boolean>(defaultExpanded);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCopy) {
      onCopy(artifact.content);
    } else if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(artifact.content);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = artifact.content ? artifact.content.split('\n').length : 0;

  return (
    <div
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        margin: '12px 0',
        overflow: 'hidden',
        backgroundColor: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
      className={`agentic-artifact-card ${className}`}
      data-testid={`artifact-card-${artifact.id}`}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          backgroundColor: '#ffffff',
          borderBottom: expanded ? '1px solid #e2e8f0' : 'none',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '15px' }}>📦</span>
          <span style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>
            {artifact.title}
          </span>
          {artifact.language && (
            <span
              style={{
                fontSize: '11px',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: '#e0e7ff',
                color: '#3730a3',
                fontFamily: 'monospace',
                fontWeight: 500,
              }}
            >
              {artifact.language}
            </span>
          )}
          {!artifact.isComplete && (
            <span
              style={{
                fontSize: '11px',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: '#fef3c7',
                color: '#92400e',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              data-testid="artifact-streaming-indicator"
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#d97706',
                }}
              />
              Streaming...
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            {lineCount} {lineCount === 1 ? 'line' : 'lines'}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            style={{
              fontSize: '12px',
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              cursor: 'pointer',
            }}
            data-testid="artifact-copy-btn"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            {expanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {expanded && (
        <pre
          style={{
            margin: 0,
            padding: '12px 14px',
            fontSize: '12px',
            lineHeight: 1.5,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            overflowX: 'auto',
          }}
          data-testid="artifact-content"
        >
          <code>{artifact.content}</code>
        </pre>
      )}
    </div>
  );
};
