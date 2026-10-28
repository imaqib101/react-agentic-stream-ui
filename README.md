# ⚡ @imaqib101/react-agentic-stream-ui

[![CI](https://github.com/imaqib101/react-agentic-stream-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/imaqib101/react-agentic-stream-ui/actions/workflows/ci.yml)
[![React >=18](https://img.shields.io/badge/React-%E2%89%A518-61dafb?style=flat-square&logo=react)](https://react.dev)
[![TypeScript 5.x](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

> **Composable React component primitives & streaming state hooks for generative AI copilots, real-time tool-call visualizations, thought logs, and human-in-the-loop approvals.**

---

## 🎯 Motivation

Building next-generation generative AI interfaces requires handling complex streaming states:

1. **Interleaved Text & Reasoning:** Displaying token streams while isolating scratchpad/thought processes.
2. **Dynamic Tool Execution:** Rendering multi-step tool calls, streaming argument deltas, and visual outputs with execution latencies.
3. **Human-in-the-loop (HITL) Guardrails:** Enabling developers to gate critical tool operations behind interactive approval dialogs.

`react-agentic-stream-ui` provides lightweight, headless and styled UI primitives designed to bridge autonomous AI backends with modern React frontend UX.

---

## 📦 Installation

```bash
npm install @imaqib101/react-agentic-stream-ui
# or
pnpm add @imaqib101/react-agentic-stream-ui
# or
yarn add @imaqib101/react-agentic-stream-ui
```

---

## 🚀 Key Primitives & Usage

### 1. `useAgenticStream` Hook

Reduces chunked server-sent events or WebSocket tokens into a clean, predictable state machine.

```tsx
import {
  useAgenticStream,
  AgentReasoningAccordion,
  TokenStreamRenderer,
  ToolCallCard,
  type StreamChunk,
} from '@imaqib101/react-agentic-stream-ui';

function AgentChat() {
  const {
    tokens,
    thought,
    toolCalls,
    isStreaming,
    feedChunk,
    startStream,
    approveTool,
    rejectTool,
  } = useAgenticStream();

  // Connect to backend SSE / fetch stream
  const runPrompt = async (prompt: string) => {
    const signal = startStream(); // aborted automatically on reset/unmount
    const res = await fetch('/api/agent', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
      signal,
    });

    // Read newline-delimited JSON chunks and feed them into the state machine.
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (line.trim()) feedChunk(JSON.parse(line) as StreamChunk);
      }
    }
    feedChunk({ type: 'done' });
  };

  return (
    <div className="agent-container">
      <AgentReasoningAccordion thought={thought} isStreaming={isStreaming} />

      <TokenStreamRenderer tokens={tokens} isStreaming={isStreaming} />

      <div className="tools-list">
        {toolCalls.map((tc) => (
          <ToolCallCard key={tc.id} toolCall={tc} onApprove={approveTool} onReject={rejectTool} />
        ))}
      </div>
    </div>
  );
}
```

---

### 2. `HumanInTheLoopApproval`

Interactive UI gatekeeper component for high-stakes tool invocations (e.g. database deletions, payment triggers, email transmissions).

```tsx
import { HumanInTheLoopApproval } from '@imaqib101/react-agentic-stream-ui';

<HumanInTheLoopApproval
  toolCallId="call_tx99"
  toolName="transfer_funds"
  proposedArguments={{ recipient: 'vendor@corp.internal', amount: 4500 }}
  onApprove={(id) => handleExecute(id)}
  onReject={(id, reason) => handleCancel(id, reason)}
  title="Financial Action Confirmation"
/>;
```

---

### 3. `AgentReasoningAccordion`

Collapsible reasoning and chain-of-thought accordion for deep reasoning models (Claude extended thinking, DeepSeek-R1, OpenAI o1/o3-mini). Features live streaming indicator, auto-expansion, duration formatting, word count, and clipboard copy:

```tsx
import { AgentReasoningAccordion } from '@imaqib101/react-agentic-stream-ui';

<AgentReasoningAccordion
  thought={stream.thought}
  isStreaming={stream.isStreaming}
  durationMs={2450}
  title="Autonomous Plan & Reasoning"
  showWordCount={true}
/>;
```

---

### 4. `ToolCallTimeline`

Visualize multi-step agentic execution traces in a connected step-by-step timeline, complete with execution durations, expandable argument/output inspectors, and embedded action triggers:

```tsx
import { ToolCallTimeline } from '@imaqib101/react-agentic-stream-ui';

<ToolCallTimeline
  toolCalls={stream.toolCalls}
  activeToolCallId="call_active"
  onApprove={(id) => stream.approveTool(id)}
  onReject={(id) => stream.rejectTool(id, 'User rejected step')}
/>;
```

---

## API reference

### `useAgenticStream(initial?)`

Returns the current state plus actions.

| State         | Type                                                                     | Description                                                            |
| ------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `tokens`      | `string`                                                                 | Accumulated answer text                                                |
| `thought`     | `string`                                                                 | Accumulated reasoning text                                             |
| `toolCalls`   | `ToolCallState[]`                                                        | Tool calls in arrival order                                            |
| `isStreaming` | `boolean`                                                                | `true` between `startStream()` and done/error                          |
| `status`      | `'idle' \| 'streaming' \| 'awaiting_approval' \| 'completed' \| 'error'` | Overall stream status (the hook never sets `awaiting_approval` itself) |
| `error`       | `Error \| null`                                                          | Set by an `error` chunk                                                |
| `stepCount`   | `number`                                                                 | Number of `step_finish` chunks seen                                    |

| Action                    | Description                                                                |
| ------------------------- | -------------------------------------------------------------------------- |
| `startStream()`           | Clears state, aborts any previous stream and returns a fresh `AbortSignal` |
| `feedChunk(chunk)`        | Applies one `StreamChunk` to the state                                     |
| `approveTool(id)`         | Sets a tool call back to `executing`                                       |
| `rejectTool(id, reason?)` | Marks a tool call `failed` (default reason: `Rejected by user`)            |
| `finishStream()`          | Marks the stream `completed`                                               |
| `reset()`                 | Aborts the active stream and returns to the initial state                  |

The active stream is also aborted when the consuming component unmounts.

### `StreamChunk`

`type` is one of `token`, `thought`, `tool_call_start`, `tool_call_delta`, `tool_call_result`, `step_finish`, `error`, `done`. Optional fields: `content` (token/thought text), `toolCallId`, `toolName`, `toolArguments` (JSON text, appended on each delta and parsed into `parsedArguments` once valid), `toolResult`, `error`, `timestamp`.

### `TokenStreamRenderer`

Renders `tokens` as pre-wrapped text with a blinking cursor while `isStreaming`. Props: `tokens`, `isStreaming?`, `className?`. The cursor uses a CSS animation named `pulse`; define `@keyframes pulse` in your stylesheet to animate it.

### Components at a glance

`ToolCallCard` (`toolCall`, `onApprove?`, `onReject?`), `ToolCallTimeline`, `HumanInTheLoopApproval` and `AgentReasoningAccordion` are documented above; every prop is typed and exported as `<Component>Props`.

---

## 🧪 Development

Tested with **Vitest** and **@testing-library/react**. See [CONTRIBUTING.md](CONTRIBUTING.md).

```bash
# Run unit tests
npm test

# Type checking
npm run typecheck

# Lint and formatting
npm run lint
npm run format:check

# Production build
npm run build
```

---

## 👤 Author & Maintainer

**Mohammed Aqib**

- GitHub: [@imaqib101](https://github.com/imaqib101)
- Location: Bengaluru, India
- Focus: Senior Full-Stack & Frontend Architecture (React, Vue 3, TypeScript, Distributed Systems)

---

## 📄 License

MIT © [Mohammed Aqib](https://github.com/imaqib101)
