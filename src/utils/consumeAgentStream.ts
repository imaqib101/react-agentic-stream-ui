import { StreamChunk } from '../types';

export type AgentStreamSource =
  | Response
  | ReadableStream<Uint8Array>
  | AsyncIterable<string>
  | AsyncIterable<Uint8Array>;

export interface ConsumeAgentStreamOptions {
  signal?: AbortSignal;
  onChunk: (chunk: StreamChunk) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

/**
 * Consumes a streaming response, ReadableStream, or AsyncIterable emitting
 * Server-Sent Events (SSE) or newline-delimited JSON chunks, decoding and
 * dispatching structured `StreamChunk` objects to the provided handler.
 */
export async function consumeAgentStream(
  source: AgentStreamSource,
  optionsOrHandler: ConsumeAgentStreamOptions | ((chunk: StreamChunk) => void),
  legacyOptions?: Partial<ConsumeAgentStreamOptions>
): Promise<void> {
  const options: ConsumeAgentStreamOptions =
    typeof optionsOrHandler === 'function'
      ? { onChunk: optionsOrHandler, ...legacyOptions }
      : optionsOrHandler;

  const { signal, onChunk, onError, onComplete } = options;

  if (signal?.aborted) {
    return;
  }

  let lineBuffer = '';

  const processLine = (rawLine: string) => {
    const line = rawLine.trim();
    if (!line) return;

    // Ignore SSE comments
    if (line.startsWith(':')) return;

    // Strip SSE "data: " prefix
    let payload = line;
    if (line.startsWith('data:')) {
      payload = line.slice(5).trim();
    }

    if (!payload || payload === '[DONE]') {
      return;
    }

    try {
      const parsed = JSON.parse(payload) as StreamChunk;
      if (parsed && typeof parsed === 'object' && typeof parsed.type === 'string') {
        onChunk(parsed);
      }
    } catch {
      // Non-JSON or raw text fallback (treat as token if non-empty)
      // Ignore syntax errors for partial chunks
    }
  };

  const processText = (text: string) => {
    lineBuffer += text;
    const lines = lineBuffer.split(/\r?\n/);
    // Keep last incomplete piece in the buffer
    lineBuffer = lines.pop() || '';

    for (const line of lines) {
      processLine(line);
    }
  };

  try {
    // 1. Response object
    if (typeof Response !== 'undefined' && source instanceof Response) {
      if (!source.ok) {
        throw new Error(`HTTP error ${source.status}: ${source.statusText}`);
      }
      if (!source.body) {
        throw new Error('Response body is null and cannot be streamed.');
      }
      await readReadableStream(source.body, processText, signal);
    }
    // 2. ReadableStream<Uint8Array>
    else if (
      typeof ReadableStream !== 'undefined' &&
      source instanceof ReadableStream
    ) {
      await readReadableStream(source, processText, signal);
    }
    // 3. AsyncIterable (strings or Uint8Array)
    else if (source && typeof source === 'object' && Symbol.asyncIterator in source) {
      const decoder = new TextDecoder('utf-8');
      for await (const chunk of source as AsyncIterable<string | Uint8Array>) {
        if (signal?.aborted) break;
        if (typeof chunk === 'string') {
          processText(chunk);
        } else if (chunk instanceof Uint8Array) {
          processText(decoder.decode(chunk, { stream: true }));
        }
      }
    } else {
      throw new TypeError(
        'Invalid stream source. Expected Response, ReadableStream, or AsyncIterable.'
      );
    }

    // Process any remaining buffered text
    if (lineBuffer.trim() && !signal?.aborted) {
      processLine(lineBuffer);
      lineBuffer = '';
    }

    onComplete?.();
  } catch (err: unknown) {
    if (signal?.aborted) {
      return;
    }
    const error = err instanceof Error ? err : new Error(String(err));
    if (onError) {
      onError(error);
    } else {
      throw error;
    }
  }
}

async function readReadableStream(
  stream: ReadableStream<Uint8Array>,
  onText: (text: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder('utf-8');

  try {
    while (true) {
      if (signal?.aborted) {
        await reader.cancel();
        break;
      }

      const { done, value } = await reader.read();
      if (done) break;

      if (value) {
        const text = decoder.decode(value, { stream: true });
        onText(text);
      }
    }
  } finally {
    reader.releaseLock();
  }
}
