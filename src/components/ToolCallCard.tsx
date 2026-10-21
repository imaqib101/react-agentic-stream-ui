import React, { useState } from 'react';
import { ToolCallState } from '../types';

export interface ToolCallCardProps {
  toolCall: ToolCallState;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  className?: string;
}

export const ToolCallCard: React.FC<ToolCallCardProps> = ({
  toolCall,
  onApprove,
  onReject,
  className = '',
}) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  const durationMs =
    toolCall.startedAt && toolCall.completedAt
      ? toolCall.completedAt - toolCall.startedAt
      : undefined;

  const getStatusColor = (status: ToolCallState['status']) => {
    switch (status) {
      case 'executing':
        return '#3b82f6';
      case 'completed':
        return '#10b981';
      case 'failed':
        return '#ef4444';
      case 'requires_action':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '12px 16px',
        margin: '8px 0',
        backgroundColor: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
      className={`agentic-tool-card ${className}`}
      data-testid={`tool-card-${toolCall.id}`}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>
            🛠️ {toolCall.name}
          </span>
          <span
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '9999px',
              color: '#ffffff',
              backgroundColor: getStatusColor(toolCall.status),
              fontWeight: 500,
              textTransform: 'uppercase',
            }}
          >
            {toolCall.status}
          </span>
          {durationMs !== undefined && (
            <span style={{ fontSize: '12px', color: '#6b7280' }}>({durationMs}ms)</span>
          )}
        </div>

        <button
          type="button"
          style={{
            background: 'none',
            border: 'none',
            color: '#6b7280',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          {expanded ? 'Hide Details ▲' : 'Show Details ▼'}
        </button>
      </div>

      {toolCall.status === 'requires_action' && (
        <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => onApprove?.(toolCall.id)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Approve Call
          </button>
          <button
            type="button"
            onClick={() => onReject?.(toolCall.id)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Reject
          </button>
        </div>
      )}

      {expanded && (
        <div style={{ marginTop: '12px', borderTop: '1px solid #f3f4f6', paddingTop: '10px' }}>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>Arguments:</span>
            <pre
              style={{
                backgroundColor: '#f9fafb',
                padding: '8px',
                borderRadius: '4px',
                fontSize: '12px',
                overflowX: 'auto',
                color: '#1f2937',
              }}
            >
              {toolCall.arguments || '{}'}
            </pre>
          </div>

          {toolCall.output && (
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#047857' }}>Output:</span>
              <pre
                style={{
                  backgroundColor: '#ecfdf5',
                  padding: '8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflowX: 'auto',
                  color: '#065f46',
                }}
              >
                {toolCall.output}
              </pre>
            </div>
          )}

          {toolCall.error && (
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#b91c1c' }}>Error:</span>
              <pre
                style={{
                  backgroundColor: '#fef2f2',
                  padding: '8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflowX: 'auto',
                  color: '#991b1b',
                }}
              >
                {toolCall.error}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
