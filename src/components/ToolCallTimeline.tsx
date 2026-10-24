import React, { useState } from 'react';
import { ToolCallState } from '../types';

export interface ToolCallTimelineProps {
  toolCalls: ToolCallState[];
  activeToolCallId?: string;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onSelectToolCall?: (id: string) => void;
  allowToggleExpand?: boolean;
  emptyMessage?: string;
  className?: string;
}

export const ToolCallTimeline: React.FC<ToolCallTimelineProps> = ({
  toolCalls,
  activeToolCallId,
  onApprove,
  onReject,
  onSelectToolCall,
  allowToggleExpand = true,
  emptyMessage = 'No tool calls recorded in this execution timeline.',
  className = '',
}) => {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    if (!allowToggleExpand) return;
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

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
      case 'pending':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: ToolCallState['status']) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'failed':
        return '✕';
      case 'requires_action':
        return '⚠️';
      case 'executing':
        return '⚙';
      case 'pending':
        return '⏳';
      default:
        return '•';
    }
  };

  if (!toolCalls || toolCalls.length === 0) {
    return (
      <div
        className={`agentic-tool-timeline-empty ${className}`}
        data-testid="timeline-empty"
        style={{
          padding: '24px',
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '14px',
          border: '1px dashed #d1d5db',
          borderRadius: '8px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      className={`agentic-tool-timeline ${className}`}
      data-testid="tool-timeline"
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        margin: '12px 0',
      }}
    >
      {toolCalls.map((call, index) => {
        const isLast = index === toolCalls.length - 1;
        const isActive = activeToolCallId === call.id;
        const isExpanded = !!expandedIds[call.id];
        const statusColor = getStatusColor(call.status);
        const durationMs =
          call.startedAt && call.completedAt
            ? call.completedAt - call.startedAt
            : undefined;

        return (
          <div
            key={call.id}
            data-testid={`timeline-item-${call.id}`}
            style={{
              display: 'flex',
              position: 'relative',
              paddingBottom: isLast ? '0px' : '20px',
            }}
          >
            {/* Timeline connector track and node */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginRight: '14px',
                position: 'relative',
                minWidth: '32px',
              }}
            >
              <div
                data-testid={`timeline-step-${index}`}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: statusColor,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 700,
                  boxShadow: isActive ? `0 0 0 3px #bfdbfe` : 'none',
                  zIndex: 2,
                  userSelect: 'none',
                }}
              >
                {getStatusIcon(call.status)}
              </div>

              {!isLast && (
                <div
                  style={{
                    position: 'absolute',
                    top: '28px',
                    bottom: '0px',
                    width: '2px',
                    backgroundColor: '#e5e7eb',
                    zIndex: 1,
                  }}
                />
              )}
            </div>

            {/* Content card */}
            <div
              style={{
                flex: 1,
                border: `1px solid ${isActive ? '#3b82f6' : '#e5e7eb'}`,
                borderRadius: '8px',
                backgroundColor: isActive ? '#f8fafc' : '#ffffff',
                overflow: 'hidden',
                boxShadow: isActive ? '0 1px 3px rgba(59, 130, 246, 0.1)' : 'none',
              }}
            >
              {/* Card header */}
              <div
                style={{
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: allowToggleExpand ? 'pointer' : 'default',
                  backgroundColor: '#f9fafb',
                  borderBottom: isExpanded ? '1px solid #e5e7eb' : 'none',
                }}
                onClick={() => {
                  toggleExpand(call.id);
                  if (onSelectToolCall) {
                    onSelectToolCall(call.id);
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>
                    #{index + 1}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>
                    {call.name}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontWeight: 600,
                      backgroundColor: `${statusColor}18`,
                      color: statusColor,
                    }}
                  >
                    {call.status}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {durationMs !== undefined && (
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {durationMs}ms
                    </span>
                  )}
                  {allowToggleExpand && (
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                      {isExpanded ? '▲ Hide' : '▼ Details'}
                    </span>
                  )}
                </div>
              </div>

              {/* Collapsible details */}
              {isExpanded && (
                <div style={{ padding: '12px 14px', fontSize: '13px' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#4b5563', marginBottom: '4px' }}>
                      INPUT ARGUMENTS
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        padding: '8px 10px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '4px',
                        fontSize: '12px',
                        overflowX: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {call.arguments || '(empty)'}
                    </pre>
                  </div>

                  {call.output && (
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#16a34a', marginBottom: '4px' }}>
                        OUTPUT RESULT
                      </div>
                      <pre
                        style={{
                          margin: 0,
                          padding: '8px 10px',
                          backgroundColor: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          borderRadius: '4px',
                          fontSize: '12px',
                          overflowX: 'auto',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {call.output}
                      </pre>
                    </div>
                  )}

                  {call.error && (
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#dc2626', marginBottom: '4px' }}>
                        ERROR
                      </div>
                      <pre
                        style={{
                          margin: 0,
                          padding: '8px 10px',
                          backgroundColor: '#fef2f2',
                          border: '1px solid #fecaca',
                          borderRadius: '4px',
                          fontSize: '12px',
                          color: '#b91c1c',
                          overflowX: 'auto',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {call.error}
                      </pre>
                    </div>
                  )}

                  {call.status === 'requires_action' && (onApprove || onReject) && (
                    <div
                      style={{
                        marginTop: '12px',
                        paddingTop: '10px',
                        borderTop: '1px dashed #e5e7eb',
                        display: 'flex',
                        gap: '8px',
                      }}
                    >
                      {onApprove && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onApprove(call.id);
                          }}
                          style={{
                            backgroundColor: '#16a34a',
                            color: '#ffffff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          Approve Step
                        </button>
                      )}
                      {onReject && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onReject(call.id);
                          }}
                          style={{
                            backgroundColor: '#ffffff',
                            color: '#dc2626',
                            border: '1px solid #f87171',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          Reject Step
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
