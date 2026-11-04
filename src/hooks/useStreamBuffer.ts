import { useState, useEffect, useRef, useCallback } from "react";

export interface StreamBufferOptions {
  flushIntervalMs?: number;
  maxChunkSize?: number;
}

export function useStreamBuffer(
  streamedText: string,
  options: StreamBufferOptions = {}
) {
  const flushIntervalMs = options.flushIntervalMs ?? 50;
  const maxChunkSize = options.maxChunkSize ?? 20;

  const [bufferedText, setBufferedText] = useState("");
  const queueRef = useRef<string>("");
  const lastTextLengthRef = useRef(0);

  useEffect(() => {
    if (streamedText.length > lastTextLengthRef.current) {
      const newChars = streamedText.slice(lastTextLengthRef.current);
      queueRef.current += newChars;
      lastTextLengthRef.current = streamedText.length;
    }
  }, [streamedText]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (queueRef.current.length > 0) {
        const chunk = queueRef.current.slice(0, maxChunkSize);
        queueRef.current = queueRef.current.slice(maxChunkSize);
        setBufferedText((prev) => prev + chunk);
      }
    }, flushIntervalMs);

    return () => clearInterval(timer);
  }, [flushIntervalMs, maxChunkSize]);

  const flushImmediate = useCallback(() => {
    if (queueRef.current.length > 0) {
      setBufferedText((prev) => prev + queueRef.current);
      queueRef.current = "";
    }
  }, []);

  return { bufferedText, flushImmediate, isBuffered: queueRef.current.length > 0 };
}
