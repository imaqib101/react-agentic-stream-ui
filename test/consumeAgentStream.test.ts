import { describe, it, expect, vi } from 'vitest';
import { consumeAgentStream } from '../src/utils/consumeAgentStream';
import { StreamChunk } from '../src/types';

describe('consumeAgentStream', () => {
  it('parses Server-Sent Events from an AsyncIterable stream', async () => {
    const sseLines = [
      ': keep-alive\n\n',
      'data: {"type": "token", "content": "Hello "}\n\n',
      ': heartbeat comment\n\n',
      'data: {"type": "token", "content": "World!"}\n\n',
      'data: [DONE]\n\n',
    ];

    async function* generateLines() {
      for (const line of sseLines) {
        yield line;
      }
    }

    const receivedChunks: StreamChunk[] = [];
    const onComplete = vi.fn();

    await consumeAgentStream(generateLines(), {
      onChunk: (chunk) => receivedChunks.push(chunk),
      onComplete,
    });

    expect(receivedChunks).toHaveLength(2);
    expect(receivedChunks[0]).toEqual({ type: 'token', content: 'Hello ' });
    expect(receivedChunks[1]).toEqual({ type: 'token', content: 'World!' });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('handles chunks split across Uint8Array boundaries in ReadableStream', async () => {
    const encoder = new TextEncoder();
    // Intentionally splitting a single line across multiple Uint8Array chunks
    const chunk1 = encoder.encode('data: {"type": "thought", "con');
    const chunk2 = encoder.encode('tent": "Analyzing codebase"}\n\ndata: {"type": "step_finish"}\n\n');

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(chunk1);
        controller.enqueue(chunk2);
        controller.close();
      },
    });

    const receivedChunks: StreamChunk[] = [];
    await consumeAgentStream(stream, (chunk) => receivedChunks.push(chunk));

    expect(receivedChunks).toHaveLength(2);
    expect(receivedChunks[0]).toEqual({
      type: 'thought',
      content: 'Analyzing codebase',
    });
    expect(receivedChunks[1]).toEqual({
      type: 'step_finish',
    });
  });

  it('processes tool execution and approval chunks', async () => {
    const rawChunks = [
      '{"type":"tool_call_start","toolCallId":"call_1","toolName":"read_file"}\n',
      '{"type":"tool_call_requires_action","toolCallId":"call_1"}\n',
      '{"type":"tool_call_result","toolCallId":"call_1","toolResult":"file content"}\n',
    ];

    async function* source() {
      for (const chunk of rawChunks) {
        yield chunk;
      }
    }

    const chunks: StreamChunk[] = [];
    await consumeAgentStream(source(), (c) => chunks.push(c));

    expect(chunks).toHaveLength(3);
    expect(chunks[0].type).toBe('tool_call_start');
    expect(chunks[1].type).toBe('tool_call_requires_action');
    expect(chunks[2].type).toBe('tool_call_result');
  });

  it('halts cleanly when AbortSignal is aborted mid-stream', async () => {
    const abortController = new AbortController();
    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"type": "token", "content": "Part 1"}\n\n'));
        abortController.abort();
        controller.enqueue(encoder.encode('data: {"type": "token", "content": "Part 2"}\n\n'));
        controller.close();
      },
    });

    const receivedChunks: StreamChunk[] = [];
    await consumeAgentStream(stream, {
      signal: abortController.signal,
      onChunk: (c) => receivedChunks.push(c),
    });

    // Should only have processed up to abort
    expect(receivedChunks.length).toBeLessThanOrEqual(1);
  });

  it('reports error when Response status is not ok', async () => {
    const fakeResponse = new Response('Unauthorized', {
      status: 401,
      statusText: 'Unauthorized',
    });

    const onError = vi.fn();
    await consumeAgentStream(fakeResponse, {
      onChunk: vi.fn(),
      onError,
    });

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0].message).toContain('HTTP error 401');
  });
});
