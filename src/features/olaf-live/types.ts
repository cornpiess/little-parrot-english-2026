export interface PerceptionEvent {
  type: 'face' | 'hand';
  confidence: number;
  x?: number;
  y?: number;
  gesture?: 'wave' | 'raise-hand' | 'smile';
  timestamp: number;
}

export interface CharacterToolCall {
  name: 'perform_turn' | 'direct_performance' | 'shape_performance' | 'shape_expression' | 'shape_locomotion' | 'set_attention' | 'set_presence';
  args: Record<string, unknown>;
}

export interface CharacterSessionEvent {
  type: 'audio' | 'voice-features' | 'transcript' | 'input-transcript' | 'tool-call' | 'status' | 'error';
  data?: unknown;
}

export type CharacterSessionListener = (event: CharacterSessionEvent) => void;

export type ConversationInput =
  | { type: 'audio'; chunk: ArrayBuffer }
  | { type: 'text'; text: string }
  | { type: 'perception'; event: PerceptionEvent };

export interface RealtimeCharacterSession {
  readonly inputMode: 'streaming-audio' | 'text';
  connect(): Promise<void>;
  send(input: ConversationInput): void;
  interrupt(): void;
  close(): void;
  subscribe(listener: CharacterSessionListener): () => void;
}
