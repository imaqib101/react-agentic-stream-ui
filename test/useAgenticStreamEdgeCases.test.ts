import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAgenticStream } from '../src/hooks/useAgenticStream';

describe('useAgenticStream edge cases', () => {
  it('marks the stream completed on a done chunk and via finishStream', () => {
    const { result } = renderHook(() => useAgenticStream());

    act(() => {
      result.current.startStream();
      result.current.feedChunk({ type: 'done' });
    });
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.status).toBe('completed');

    act(() => {
      result.current.startStream();
      result.current.finishStream();
    });
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.status).toBe('completed');
  });

  it('records an error chunk with its message', () => {
    const { result } = renderHook(() => useAgenticStream());

    act(() => {
      result.current.startStream();
      result.current.feedChunk({ type: 'error', error: 'upstream failed' });
    });
    expect(result.current.status).toBe('error');
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.error?.message).toBe('upstream failed');
  });

  it('falls back to a default message for an error chunk without text', () => {
    const { result } = renderHook(() => useAgenticStream());

    act(() => {
      result.current.feedChunk({ type: 'error' });
    });
    expect(result.current.error?.message).toBe('Agent stream error');
  });

  it('marks a tool call failed when the result carries an error', () => {
    const { result } = renderHook(() => useAgenticStream());

    act(() => {
      result.current.startStream();
      result.current.feedChunk({ type: 'tool_call_start', toolCallId: 't1', toolName: 'sql' });
      result.current.feedChunk({ type: 'tool_call_result', toolCallId: 't1', error: 'boom' });
    });
    const tc = result.current.toolCalls[0];
    expect(tc.status).toBe('failed');
    expect(tc.error).toBe('boom');
    expect(tc.completedAt).toBeTypeOf('number');
  });

  it('ignores tool chunks without a toolCallId and unknown ids', () => {
    const { result } = renderHook(() => useAgenticStream());

    act(() => {
      result.current.feedChunk({ type: 'tool_call_start' });
      result.current.feedChunk({ type: 'tool_call_delta', toolArguments: '{}' });
      result.current.feedChunk({ type: 'tool_call_result', toolResult: 'x' });
      result.current.feedChunk({ type: 'tool_call_start', toolCallId: 't1', toolName: 'a' });
      result.current.feedChunk({
        type: 'tool_call_delta',
        toolCallId: 'other',
        toolArguments: '{}',
      });
    });
    expect(result.current.toolCalls).toHaveLength(1);
    expect(result.current.toolCalls[0].arguments).toBe('');
  });

  it('uses unknown_tool as the default name and keeps partial JSON unparsed', () => {
    const { result } = renderHook(() => useAgenticStream());

    act(() => {
      result.current.feedChunk({ type: 'tool_call_start', toolCallId: 't1' });
      result.current.feedChunk({
        type: 'tool_call_delta',
        toolCallId: 't1',
        toolArguments: '{"a":',
      });
    });
    expect(result.current.toolCalls[0].name).toBe('unknown_tool');
    expect(result.current.toolCalls[0].parsedArguments).toBeUndefined();

    act(() => {
      result.current.feedChunk({ type: 'tool_call_delta', toolCallId: 't1', toolArguments: '1}' });
    });
    expect(result.current.toolCalls[0].parsedArguments).toEqual({ a: 1 });
  });

  it('approveTool sets the tool back to executing', () => {
    const { result } = renderHook(() => useAgenticStream());

    act(() => {
      result.current.feedChunk({ type: 'tool_call_start', toolCallId: 't1', toolName: 'a' });
      result.current.rejectTool('t1');
    });
    expect(result.current.toolCalls[0].error).toBe('Rejected by user');

    act(() => {
      result.current.approveTool('t1');
    });
    expect(result.current.toolCalls[0].status).toBe('executing');
  });

  it('reset clears all state and startStream returns a fresh abort signal', () => {
    const { result } = renderHook(() => useAgenticStream());

    let first!: AbortSignal;
    let second!: AbortSignal;
    act(() => {
      first = result.current.startStream();
      result.current.feedChunk({ type: 'token', content: 'hi' });
    });
    act(() => {
      second = result.current.startStream();
    });
    expect(first.aborted).toBe(true);
    expect(second.aborted).toBe(false);
    expect(result.current.tokens).toBe('');

    act(() => {
      result.current.feedChunk({ type: 'token', content: 'hi' });
      result.current.reset();
    });
    expect(second.aborted).toBe(true);
    expect(result.current.tokens).toBe('');
    expect(result.current.status).toBe('idle');
  });
});

describe('useAgenticStream lifecycle', () => {
  it('aborts the active stream signal on unmount', () => {
    const { result, unmount } = renderHook(() => useAgenticStream());

    let signal!: AbortSignal;
    act(() => {
      signal = result.current.startStream();
    });
    expect(signal.aborted).toBe(false);

    unmount();
    expect(signal.aborted).toBe(true);
  });
});
