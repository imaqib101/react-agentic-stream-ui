# ⚡ @imaqib101/react-agentic-stream-ui

[![CI](https://github.com/imaqib101/react-agentic-stream-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/imaqib101/react-agentic-stream-ui/actions)
[![npm version](https://img.shields.io/badge/npm-v1.0.0-blue?style=flat-square&logo=npm)](https://github.com/imaqib101/react-agentic-stream-ui)
[![React 18 & 19 Ready](https://img.shields.io/badge/React-18%20%7C%2019-61dafb?style=flat-square&logo=react)](https://react.dev)
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
import { useAgenticStream, TokenStreamRenderer, ToolCallCard } from '@imaqib101/react-agentic-stream-ui';

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
    startStream();
    const res = await fetch('/api/agent', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });

    const reader = res.body?.getReader();
    // Feed parsed chunks into state machine
    // feedChunk({ type: 'token', content: '...' });
    // feedChunk({ type: 'tool_call_start', toolCallId: '1', toolName: 'sql_exec' });
  };

  return (
    <div className="agent-container">
      {thought && (
        <details className="thought-box">
          <summary>🧠 Model Reasoning</summary>
          <p>{thought}</p>
        </details>
      )}

      <TokenStreamRenderer tokens={tokens} isStreaming={isStreaming} />

      <div className="tools-list">
        {toolCalls.map((tc) => (
          <ToolCallCard
            key={tc.id}
            toolCall={tc}
            onApprove={approveTool}
            onReject={rejectTool}
          />
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
  proposedArguments={{ recipient: "vendor@corp.internal", amount: 4500 }}
  onApprove={(id) => handleExecute(id)}
  onReject={(id, reason) => handleCancel(id, reason)}
  title="Financial Action Confirmation"
/>
```

---

## 🧪 Testing & Quality Suite

Tested with **Vitest** and **@testing-library/react**:

```bash
# Run unit tests
npm test

# Type checking
npm run typecheck

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
