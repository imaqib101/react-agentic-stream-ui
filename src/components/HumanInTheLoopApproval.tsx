import React, { useState } from 'react';

export interface HumanInTheLoopApprovalProps {
  toolCallId: string;
  toolName: string;
  proposedArguments: Record<string, unknown> | string;
  onApprove: (toolCallId: string, updatedArguments?: Record<string, unknown>) => void;
  onReject: (toolCallId: string, reason: string) => void;
  title?: string;
  description?: string;
}

export const HumanInTheLoopApproval: React.FC<HumanInTheLoopApprovalProps> = ({
  toolCallId,
  toolName,
  proposedArguments,
  onApprove,
  onReject,
  title = 'Tool Execution Approval Required',
  description = 'An autonomous agentic action requires human verification before continuing.',
}) => {
  const [rejectReason, setRejectReason] = useState<string>('');
  const [showRejectInput, setShowRejectInput] = useState<boolean>(false);

  const formattedArgs =
    typeof proposedArguments === 'string'
      ? proposedArguments
      : JSON.stringify(proposedArguments, null, 2);

  return (
    <div
      style={{
        border: '2px solid #f59e0b',
        backgroundColor: '#fffbeb',
        borderRadius: '8px',
        padding: '16px',
        margin: '12px 0',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
      data-testid="human-approval-card"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ fontSize: '20px' }}>⚠️</span>
        <h4 style={{ margin: 0, color: '#92400e', fontSize: '16px', fontWeight: 600 }}>{title}</h4>
      </div>

      <p style={{ margin: '4px 0 12px 0', fontSize: '13px', color: '#78350f' }}>{description}</p>

      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#92400e', marginBottom: '4px' }}>
          Action Target: <code>{toolName}</code>
        </div>
        <pre
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #fde68a',
            padding: '10px',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#1f2937',
            overflowX: 'auto',
          }}
        >
          {formattedArgs}
        </pre>
      </div>

      {showRejectInput ? (
        <div style={{ marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="Reason for rejection..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '13px',
              boxSizing: 'border-box',
              marginBottom: '8px',
            }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => onReject(toolCallId, rejectReason || 'Declined by reviewer')}
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Confirm Rejection
            </button>
            <button
              type="button"
              onClick={() => setShowRejectInput(false)}
              style={{
                backgroundColor: '#e5e7eb',
                color: '#374151',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => onApprove(toolCallId)}
            style={{
              backgroundColor: '#16a34a',
              color: '#ffffff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
            }}
          >
            ✓ Approve Execution
          </button>
          <button
            type="button"
            onClick={() => setShowRejectInput(true)}
            style={{
              backgroundColor: '#ffffff',
              color: '#dc2626',
              border: '1px solid #f87171',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
            }}
          >
            ✕ Reject
          </button>
        </div>
      )}
    </div>
  );
};
