export type ToolExecutionStatus = 'idle' | 'pending' | 'executing' | 'requires_action' | 'completed' | 'failed';

export interface ToolCallState {
  id: string;
  name: string;
  arguments: string;
  parsedArguments?: Record<string, unknown>;
  output?: string;
  error?: string;
  status: ToolExecutionStatus;
  startedAt?: number;
  completedAt?: number;
}

export type StreamChunkType =
  | 'token'
  | 'thought'
  | 'tool_call_start'
  | 'tool_call_delta'
  | 'tool_call_result'
  | 'step_finish'
  | 'error'
  | 'done';

export interface StreamChunk {
  type: StreamChunkType;
  content?: string;
  toolCallId?: string;
  toolName?: string;
  toolArguments?: string;
  toolResult?: string;
  error?: string;
  timestamp?: number;
}

export interface AgenticStreamState {
  tokens: string;
  thought: string;
  toolCalls: ToolCallState[];
  isStreaming: boolean;
  status: 'idle' | 'streaming' | 'awaiting_approval' | 'completed' | 'error';
  error: Error | null;
  /** Number of completed agent steps (incremented on each `step_finish` chunk). */
  stepCount: number;
}
