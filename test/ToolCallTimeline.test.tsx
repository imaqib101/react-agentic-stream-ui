import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToolCallTimeline } from '../src/components/ToolCallTimeline';
import { ToolCallState } from '../src/types';

describe('ToolCallTimeline', () => {
  const sampleCalls: ToolCallState[] = [
    {
      id: 'call-1',
      name: 'database_query',
      arguments: '{"table": "users", "limit": 10}',
      output: '{"count": 10, "rows": []}',
      status: 'completed',
      startedAt: 1000,
      completedAt: 1240,
    },
    {
      id: 'call-2',
      name: 'send_webhook',
      arguments: '{"url": "https://api.internal/hook"}',
      status: 'requires_action',
      startedAt: 1250,
    },
    {
      id: 'call-3',
      name: 'generate_report',
      arguments: '{"format": "pdf"}',
      status: 'pending',
    },
  ];

  it('renders empty message when no tool calls are provided', () => {
    render(<ToolCallTimeline toolCalls={[]} emptyMessage="No actions performed yet" />);
    expect(screen.getByTestId('timeline-empty')).toBeDefined();
    expect(screen.getByText('No actions performed yet')).toBeDefined();
  });

  it('renders list of tool calls in chronological order with step numbers and badges', () => {
    render(<ToolCallTimeline toolCalls={sampleCalls} />);

    expect(screen.getByTestId('tool-timeline')).toBeDefined();
    expect(screen.getByText('#1')).toBeDefined();
    expect(screen.getByText('database_query')).toBeDefined();
    expect(screen.getByText('240ms')).toBeDefined();

    expect(screen.getByText('#2')).toBeDefined();
    expect(screen.getByText('send_webhook')).toBeDefined();

    expect(screen.getByText('#3')).toBeDefined();
    expect(screen.getByText('generate_report')).toBeDefined();
  });

  it('highlights the active tool call step', () => {
    render(<ToolCallTimeline toolCalls={sampleCalls} activeToolCallId="call-2" />);
    const activeItem = screen.getByTestId('timeline-item-call-2');
    expect(activeItem).toBeDefined();
  });

  it('toggles collapsible details on header click', () => {
    render(<ToolCallTimeline toolCalls={sampleCalls} />);

    // Initially arguments details are not shown
    expect(screen.queryByText('INPUT ARGUMENTS')).toBeNull();

    // Click first item to expand
    const firstHeader = screen.getByText('database_query');
    fireEvent.click(firstHeader);

    expect(screen.getByText('INPUT ARGUMENTS')).toBeDefined();
    expect(screen.getByText(/database_query/i)).toBeDefined();
    expect(screen.getByText(/table.*users/i)).toBeDefined();
    expect(screen.getByText('OUTPUT RESULT')).toBeDefined();

    // Click again to collapse
    fireEvent.click(firstHeader);
    expect(screen.queryByText('INPUT ARGUMENTS')).toBeNull();
  });

  it('triggers onApprove and onReject callbacks for requires_action items', () => {
    const handleApprove = vi.fn();
    const handleReject = vi.fn();

    render(
      <ToolCallTimeline
        toolCalls={sampleCalls}
        onApprove={handleApprove}
        onReject={handleReject}
      />,
    );

    // Expand call-2 which has requires_action status
    fireEvent.click(screen.getByText('send_webhook'));

    const approveBtn = screen.getByText('Approve Step');
    const rejectBtn = screen.getByText('Reject Step');

    expect(approveBtn).toBeDefined();
    expect(rejectBtn).toBeDefined();

    fireEvent.click(approveBtn);
    expect(handleApprove).toHaveBeenCalledWith('call-2');

    fireEvent.click(rejectBtn);
    expect(handleReject).toHaveBeenCalledWith('call-2');
  });

  it('invokes onSelectToolCall when an item is clicked', () => {
    const handleSelect = vi.fn();
    render(<ToolCallTimeline toolCalls={sampleCalls} onSelectToolCall={handleSelect} />);

    fireEvent.click(screen.getByText('database_query'));
    expect(handleSelect).toHaveBeenCalledWith('call-1');
  });
});
