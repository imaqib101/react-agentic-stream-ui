import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useStreamMetrics } from "../src/hooks/useStreamMetrics";
import { AgenticStreamState } from "../src/types";

describe("useStreamMetrics", () => {
  it("initializes with zero metrics when not streaming", () => {
    const initialState: AgenticStreamState = {
      isStreaming: false,
      tokens: "",
      thought: "",
      toolCalls: [],
      status: "idle",
      error: null,
      stepCount: 0,
    };

    const { result } = renderHook(() => useStreamMetrics(initialState));

    expect(result.current.isStreaming).toBe(false);
    expect(result.current.elapsedSeconds).toBe(0);
    expect(result.current.tokensPerSecond).toBe(0);
    expect(result.current.totalTokens).toBe(0);
  });

  it("calculates token metrics when tokens accumulate", () => {
    const activeState: AgenticStreamState = {
      isStreaming: true,
      tokens: "Hello world! This is a test message for metrics calculation.",
      thought: "",
      toolCalls: [],
      status: "streaming",
      error: null,
      stepCount: 1,
    };

    const { result } = renderHook(() => useStreamMetrics(activeState));

    expect(result.current.isStreaming).toBe(true);
    expect(result.current.totalTokens).toBeGreaterThan(0);
  });
});
