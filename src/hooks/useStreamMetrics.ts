import { useState, useEffect, useRef } from "react";
import { AgenticStreamState } from "../types";

export interface StreamMetrics {
  elapsedSeconds: number;
  tokensPerSecond: number;
  totalTokens: number;
  isStreaming: boolean;
}

export function useStreamMetrics(state: AgenticStreamState): StreamMetrics {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const [totalTokens, setTotalTokens] = useState<number>(0);

  useEffect(() => {
    if (state.isStreaming) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }
      const interval = setInterval(() => {
        if (startTimeRef.current) {
          const diff = (Date.now() - startTimeRef.current) / 1000;
          setElapsedSeconds(diff);
        }
      }, 100);
      return () => clearInterval(interval);
    } else {
      startTimeRef.current = null;
    }
  }, [state.isStreaming]);

  useEffect(() => {
    const contentLength = state.tokens.length;
    // Rough estimate: ~4 chars per token
    const estimatedTokens = Math.round(contentLength / 4);
    setTotalTokens(estimatedTokens);
  }, [state.tokens]);

  const tokensPerSecond = elapsedSeconds > 0 ? Number((totalTokens / elapsedSeconds).toFixed(1)) : 0;

  return {
    elapsedSeconds: Number(elapsedSeconds.toFixed(1)),
    tokensPerSecond,
    totalTokens,
    isStreaming: state.isStreaming,
  };
}
