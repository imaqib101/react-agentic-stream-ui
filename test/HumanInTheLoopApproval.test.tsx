import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HumanInTheLoopApproval } from '../src/components/HumanInTheLoopApproval';

describe('HumanInTheLoopApproval', () => {
  it('renders title, tool name, and formatted arguments', () => {
    const handleApprove = vi.fn();
    const handleReject = vi.fn();

    render(
      <HumanInTheLoopApproval
        toolCallId="call-99"
        toolName="execute_sql_migration"
        proposedArguments={{ script: 'DROP TABLE old_logs;' }}
        onApprove={handleApprove}
        onReject={handleReject}
      />,
    );

    expect(screen.getByTestId('human-approval-card')).toBeDefined();
    expect(screen.getByText('Tool Execution Approval Required')).toBeDefined();
    expect(screen.getByText('execute_sql_migration')).toBeDefined();
    expect(screen.getByText(/DROP TABLE old_logs;/i)).toBeDefined();
  });

  it('triggers onApprove when Approve Execution is clicked', () => {
    const handleApprove = vi.fn();
    const handleReject = vi.fn();

    render(
      <HumanInTheLoopApproval
        toolCallId="call-99"
        toolName="execute_sql_migration"
        proposedArguments={{ script: 'DROP TABLE old_logs;' }}
        onApprove={handleApprove}
        onReject={handleReject}
      />,
    );

    const approveBtn = screen.getByText(/Approve Execution/i);
    fireEvent.click(approveBtn);

    expect(handleApprove).toHaveBeenCalledWith('call-99');
    expect(handleReject).not.toHaveBeenCalled();
  });

  it('allows entering a rejection reason and submitting rejection', () => {
    const handleApprove = vi.fn();
    const handleReject = vi.fn();

    render(
      <HumanInTheLoopApproval
        toolCallId="call-99"
        toolName="execute_sql_migration"
        proposedArguments={{ script: 'DROP TABLE old_logs;' }}
        onApprove={handleApprove}
        onReject={handleReject}
      />,
    );

    const initialRejectBtn = screen.getByText(/Reject/i);
    fireEvent.click(initialRejectBtn);

    const input = screen.getByPlaceholderText('Reason for rejection...');
    fireEvent.change(input, { target: { value: 'Requires DBA approval first' } });

    const confirmRejectBtn = screen.getByText('Confirm Rejection');
    fireEvent.click(confirmRejectBtn);

    expect(handleReject).toHaveBeenCalledWith('call-99', 'Requires DBA approval first');
    expect(handleApprove).not.toHaveBeenCalled();
  });

  it('allows canceling rejection flow', () => {
    const handleApprove = vi.fn();
    const handleReject = vi.fn();

    render(
      <HumanInTheLoopApproval
        toolCallId="call-99"
        toolName="execute_sql_migration"
        proposedArguments={{ script: 'DROP TABLE old_logs;' }}
        onApprove={handleApprove}
        onReject={handleReject}
      />,
    );

    fireEvent.click(screen.getByText(/Reject/i));
    expect(screen.getByPlaceholderText('Reason for rejection...')).toBeDefined();

    const cancelBtn = screen.getByText('Cancel');
    fireEvent.click(cancelBtn);

    expect(screen.queryByPlaceholderText('Reason for rejection...')).toBeNull();
  });
});
