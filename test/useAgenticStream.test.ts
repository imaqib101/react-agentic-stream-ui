import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAgenticStream } from '../src/hooks/useAgenticStream';

describe('useAgenticStream', () => {
  it('initializes with default empty state', () => {
    const { result } = renderHook(() => useAgenticStream());

    expect(result.current.tokens).toBe('');
    expect(result.current.thought).toBe('');
    expect(result.current.toolCalls).toEqual([]);
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.status).toBe('idle');
  });

  it('accumulates tokens and thoughts during streaming chunks', () => {
    const { result } = renderHook(() => useAgenticStream());

    act(() => {
      result.current.startStream();
      result.current.feedChunk({ type: 'thought', content: 'Analyzing user request... ' });
      result.current.feedChunk({ type: 'thought', content: 'Ready.' });
      result.current.feedChunk({ type: 'token', content: 'Hello ' });
      result.current.feedChunk({ type: 'token', content: 'World!' });
    });

    expect(result.current.isStreaming).toBe(true);
    expect(result.current.status).toBe('streaming');
    expect(result.current.thought).toBe('Analyzing user request... Ready.');
    expect(result.current.tokens).toBe('Hello World!');
  });

  it('tracks tool call lifecycle: start, delta accumulation, and result', () => {
    const { result } = renderHook(() => useAgenticStream());

    act(() => {
      result.current.startStream();
      result.current.feedChunk({
        type: 'tool_call_start',
        toolCallId: 'call_123',
        toolName: 'web_search',
        toolArguments: '{"query":',
      });
    });

    expect(result.current.toolCalls).toHaveLength(1);
    expect(result.current.toolCalls[0].name).toBe('web_search');
    expect(result.current.toolCalls[0].status).toBe('executing');

    act(() => {
      result.current.feedChunk({
        type: 'tool_call_delta',
        toolCallId: 'call_123',
        toolArguments: ' "React 19 release"}',
      });
    });

    expect(result.current.toolCalls[0].arguments).toBe('{"query": "React 19 release"}');
    expect(result.current.toolCalls[0].parsedArguments).toEqual({ query: 'React 19 release' });

    act(() => {
      result.current.feedChunk({
        type: 'tool_call_result',
        toolCallId: 'call_123',
        toolResult: 'React 19 RC released with Action hooks',
      });
      result.current.feedChunk({ type: 'done' });
    });

    expect(result.current.toolCalls[0].status).toBe('completed');
    expect(result.current.toolCalls[0].output).toBe('React 19 RC released with Action hooks');
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.status).toBe('completed');
  });

  it('handles user tool rejection', () => {
    const { result } = renderHook(() => useAgenticStream());

    act(() => {
      result.current.startStream();
      result.current.feedChunk({
        type: 'tool_call_start',
        toolCallId: 'call_danger',
        toolName: 'delete_database',
      });
      result.current.rejectTool('call_danger', 'Permission denied');
    });

    expect(result.current.toolCalls[0].status).toBe('failed');
    expect(result.current.toolCalls[0].error).toBe('Permission denied');
  });
});
