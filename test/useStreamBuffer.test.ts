import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useStreamBuffer } from "../src/hooks/useStreamBuffer";

describe("useStreamBuffer", () => {
  it("buffers incoming stream text and flushes over intervals", () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(
      ({ text }) => useStreamBuffer(text, { flushIntervalMs: 50, maxChunkSize: 5 }),
      { initialProps: { text: "" } }
    );

    rerender({ text: "Hello streaming world" });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.bufferedText.length).toBeGreaterThan(0);

    vi.useRealTimers();
  });

  it("supports immediate flush", () => {
    vi.useFakeTimers();
    const { result } = renderHook(
      () => useStreamBuffer("Immediate content")
    );

    act(() => {
      result.current.flushImmediate();
    });

    expect(result.current.bufferedText).toBe("Immediate content");
    vi.useRealTimers();
  });
});
