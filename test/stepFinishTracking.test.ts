import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAgenticStream } from '../src/hooks/useAgenticStream';

describe('useAgenticStream — step_finish tracking', () => {
  it('initializes stepCount to 0', () => {
    const { result } = renderHook(() => useAgenticStream());
    expect(result.current.stepCount).toBe(0);
  });

  it('increments stepCount for each step_finish chunk', () => {
    const { result } = renderHook(() => useAgenticStream());

    act(() => {
      result.current.startStream();
      result.current.feedChunk({ type: 'token', content: 'Thinking...' });
      result.current.feedChunk({ type: 'step_finish' });
      result.current.feedChunk({ type: 'token', content: 'Step 2...' });
      result.current.feedChunk({ type: 'step_finish' });
    });

    expect(result.current.stepCount).toBe(2);
    expect(result.current.isStreaming).toBe(true);
  });

  it('preserves stepCount across token and tool_call chunks', () => {
    const { result } = renderHook(() => useAgenticStream());

    act(() => {
      result.current.startStream();
      result.current.feedChunk({ type: 'thought', content: 'Planning...' });
      result.current.feedChunk({ type: 'step_finish' });
      result.current.feedChunk({
        type: 'tool_call_start',
        toolCallId: 'tc_1',
        toolName: 'search',
        toolArguments: '{"q":"test"}',
      });
      result.current.feedChunk({
        type: 'tool_call_result',
        toolCallId: 'tc_1',
        toolResult: 'found it',
      });
      result.current.feedChunk({ type: 'step_finish' });
      result.current.feedChunk({ type: 'token', content: 'Here is the answer.' });
      result.current.feedChunk({ type: 'step_finish' });
    });

    expect(result.current.stepCount).toBe(3);
    expect(result.current.toolCalls).toHaveLength(1);
    expect(result.current.thought).toBe('Planning...');
  });

  it('resets stepCount to 0 on RESET', () => {
    const { result } = renderHook(() => useAgenticStream());

    act(() => {
      result.current.startStream();
      result.current.feedChunk({ type: 'step_finish' });
      result.current.feedChunk({ type: 'step_finish' });
    });

    expect(result.current.stepCount).toBe(2);

    act(() => {
      result.current.reset();
    });

    expect(result.current.stepCount).toBe(0);
    expect(result.current.status).toBe('idle');
  });

  it('resets stepCount to 0 on START_STREAM (new conversation)', () => {
    const { result } = renderHook(() => useAgenticStream());

    act(() => {
      result.current.startStream();
      result.current.feedChunk({ type: 'step_finish' });
      result.current.feedChunk({ type: 'step_finish' });
      result.current.feedChunk({ type: 'step_finish' });
    });

    expect(result.current.stepCount).toBe(3);

    // A second startStream represents a new turn — stepCount should reset
    act(() => {
      result.current.startStream();
    });

    expect(result.current.stepCount).toBe(0);
  });

  it('does not increment stepCount on other chunk types', () => {
    const { result } = renderHook(() => useAgenticStream());

    act(() => {
      result.current.startStream();
      result.current.feedChunk({ type: 'token', content: 'a' });
      result.current.feedChunk({ type: 'thought', content: 'b' });
      result.current.feedChunk({ type: 'done' });
    });

    expect(result.current.stepCount).toBe(0);
    expect(result.current.status).toBe('completed');
  });
});
