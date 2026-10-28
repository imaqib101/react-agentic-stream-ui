import { useReducer, useCallback, useRef, useEffect } from 'react';
import { AgenticStreamState, StreamChunk, ToolCallState } from '../types';

type AgenticAction =
  | { type: 'START_STREAM' }
  | { type: 'FEED_CHUNK'; chunk: StreamChunk }
  | { type: 'APPROVE_TOOL'; toolCallId: string }
  | { type: 'REJECT_TOOL'; toolCallId: string; reason?: string }
  | { type: 'FINISH_STREAM' }
  | { type: 'STREAM_ERROR'; error: Error }
  | { type: 'RESET' };

const initialState: AgenticStreamState = {
  tokens: '',
  thought: '',
  toolCalls: [],
  isStreaming: false,
  status: 'idle',
  error: null,
  stepCount: 0,
};

function agenticStreamReducer(
  state: AgenticStreamState,
  action: AgenticAction,
): AgenticStreamState {
  switch (action.type) {
    case 'START_STREAM':
      return {
        ...state,
        tokens: '',
        thought: '',
        toolCalls: [],
        isStreaming: true,
        status: 'streaming',
        error: null,
        stepCount: 0,
      };

    case 'FEED_CHUNK': {
      const { chunk } = action;

      switch (chunk.type) {
        case 'token':
          return {
            ...state,
            tokens: state.tokens + (chunk.content || ''),
          };

        case 'thought':
          return {
            ...state,
            thought: state.thought + (chunk.content || ''),
          };

        case 'tool_call_start': {
          if (!chunk.toolCallId) return state;
          const newToolCall: ToolCallState = {
            id: chunk.toolCallId,
            name: chunk.toolName || 'unknown_tool',
            arguments: chunk.toolArguments || '',
            status: 'executing',
            startedAt: chunk.timestamp || Date.now(),
          };
          return {
            ...state,
            toolCalls: [...state.toolCalls, newToolCall],
          };
        }

        case 'tool_call_delta': {
          if (!chunk.toolCallId) return state;
          return {
            ...state,
            toolCalls: state.toolCalls.map((tc) => {
              if (tc.id !== chunk.toolCallId) return tc;
              const nextArgs = tc.arguments + (chunk.toolArguments || '');
              let parsed: Record<string, unknown> | undefined;
              try {
                parsed = JSON.parse(nextArgs);
              } catch {
                // partial JSON still streaming
              }
              return {
                ...tc,
                arguments: nextArgs,
                parsedArguments: parsed || tc.parsedArguments,
              };
            }),
          };
        }

        case 'tool_call_result': {
          if (!chunk.toolCallId) return state;
          return {
            ...state,
            toolCalls: state.toolCalls.map((tc) => {
              if (tc.id !== chunk.toolCallId) return tc;
              let parsed: Record<string, unknown> | undefined;
              try {
                parsed = JSON.parse(tc.arguments);
              } catch {
                // keep existing
              }
              return {
                ...tc,
                parsedArguments: parsed || tc.parsedArguments,
                output: chunk.toolResult,
                error: chunk.error,
                status: chunk.error ? 'failed' : 'completed',
                completedAt: chunk.timestamp || Date.now(),
              };
            }),
          };
        }

        case 'step_finish':
          return {
            ...state,
            stepCount: state.stepCount + 1,
          };

        case 'done':
          return {
            ...state,
            isStreaming: false,
            status: 'completed',
          };

        case 'error':
          return {
            ...state,
            isStreaming: false,
            status: 'error',
            error: new Error(chunk.error || 'Agent stream error'),
          };

        default:
          return state;
      }
    }

    case 'APPROVE_TOOL':
      return {
        ...state,
        toolCalls: state.toolCalls.map((tc) =>
          tc.id === action.toolCallId ? { ...tc, status: 'executing' } : tc,
        ),
      };

    case 'REJECT_TOOL':
      return {
        ...state,
        toolCalls: state.toolCalls.map((tc) =>
          tc.id === action.toolCallId
            ? { ...tc, status: 'failed', error: action.reason || 'Rejected by user' }
            : tc,
        ),
      };

    case 'FINISH_STREAM':
      return {
        ...state,
        isStreaming: false,
        status: 'completed',
      };

    case 'STREAM_ERROR':
      return {
        ...state,
        isStreaming: false,
        status: 'error',
        error: action.error,
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

export function useAgenticStream(initial?: Partial<AgenticStreamState>) {
  const [state, dispatch] = useReducer(agenticStreamReducer, {
    ...initialState,
    ...initial,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Abort any in-flight stream when the consuming component unmounts.
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const startStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    dispatch({ type: 'START_STREAM' });
    return abortControllerRef.current.signal;
  }, []);

  const feedChunk = useCallback((chunk: StreamChunk) => {
    dispatch({ type: 'FEED_CHUNK', chunk });
  }, []);

  const approveTool = useCallback((toolCallId: string) => {
    dispatch({ type: 'APPROVE_TOOL', toolCallId });
  }, []);

  const rejectTool = useCallback((toolCallId: string, reason?: string) => {
    dispatch({ type: 'REJECT_TOOL', toolCallId, reason });
  }, []);

  const finishStream = useCallback(() => {
    dispatch({ type: 'FINISH_STREAM' });
  }, []);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    dispatch({ type: 'RESET' });
  }, []);

  return {
    ...state,
    startStream,
    feedChunk,
    approveTool,
    rejectTool,
    finishStream,
    reset,
  };
}
