import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToolCallCard } from '../src/components/ToolCallCard';
import { ToolCallState } from '../src/types';

describe('ToolCallCard', () => {
  const mockToolCall: ToolCallState = {
    id: 'call_1',
    name: 'fetch_weather',
    arguments: '{"city": "Bengaluru"}',
    status: 'completed',
    output: '{"temp": 24, "condition": "Cloudy"}',
    startedAt: 1000,
    completedAt: 1150,
  };

  it('renders tool name and completed status', () => {
    render(<ToolCallCard toolCall={mockToolCall} />);

    expect(screen.getByText(/fetch_weather/i)).toBeDefined();
    expect(screen.getByText(/completed/i)).toBeDefined();
    expect(screen.getByText(/\(150ms\)/i)).toBeDefined();
  });

  it('toggles argument and output visibility when clicked', () => {
    render(<ToolCallCard toolCall={mockToolCall} />);

    expect(screen.queryByText(/Bengaluru/i)).toBeNull();

    // Click to expand
    fireEvent.click(screen.getByText(/fetch_weather/i));

    expect(screen.getByText(/Bengaluru/i)).toBeDefined();
    expect(screen.getByText(/Cloudy/i)).toBeDefined();
  });

  it('renders approve and reject actions for requires_action status', () => {
    const onApprove = vi.fn();
    const onReject = vi.fn();

    const pendingTool: ToolCallState = {
      id: 'call_2',
      name: 'send_email',
      arguments: '{"to": "alice@example.com"}',
      status: 'requires_action',
    };

    render(<ToolCallCard toolCall={pendingTool} onApprove={onApprove} onReject={onReject} />);

    const approveBtn = screen.getByText(/Approve Call/i);
    const rejectBtn = screen.getByText(/Reject/i);

    fireEvent.click(approveBtn);
    expect(onApprove).toHaveBeenCalledWith('call_2');

    fireEvent.click(rejectBtn);
    expect(onReject).toHaveBeenCalledWith('call_2');
  });
});
