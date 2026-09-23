import type {
  CharacterSessionEvent,
  CharacterSessionListener,
  CharacterToolCall,
  ConversationInput,
  RealtimeCharacterSession,
} from './types';

export const DEFAULT_LIVE_MODEL = 'models/gemini-3.1-flash-live-preview';

const CHARACTER_SYSTEM_INSTRUCTION = `
You are Olaf, a warm and playful learning companion for a three-year-old child.
Speak in tiny, vivid turns and leave room for the child. Before every meaningful turn,
call perform_turn once. Describe meaning, never joints or animation. When teaching a
concrete noun such as apple, include teaching_goal, concept, and expected_response;
the local stage director will select and handle the prop, gaze, gesture and response arc.
Never narrate stage directions. Always respond with audio.
`.trim();

export const CHARACTER_TOOL_DECLARATIONS = [
  {
    name: 'perform_turn',
    description: 'Give the local actor one compact semantic performance turn. Concrete teaching turns automatically become embodied prop scenes.',
    parameters: {
      type: 'OBJECT',
      properties: {
        dramatic_goal: {
          type: 'STRING',
          enum: ['celebrate', 'comfort', 'invite', 'discover', 'reassure', 'play', 'listen'],
          description: 'What the child should feel in this turn.',
        },
        speech_act: { type: 'STRING', enum: ['teach', 'ask', 'answer', 'encourage', 'comfort', 'tell', 'react'] },
        teaching_goal: { type: 'STRING', enum: ['introduce', 'repeat', 'recognize', 'choose', 'compare', 'use'] },
        concept: { type: 'STRING', description: 'Concrete learning object, for example apple. Omit for non-teaching talk.' },
        emoji: { type: 'STRING', description: 'Optional single Emoji for an object not yet in the local catalog.' },
        object_action: { type: 'STRING', enum: ['show', 'offer', 'wear', 'eat', 'smell', 'open', 'read', 'place', 'play'] },
        expected_response: { type: 'STRING', enum: ['repeat', 'point', 'choose', 'answer', 'none'] },
        objects: {
          type: 'ARRAY', description: 'Optional; at most two objects for compare/choose scenes.',
          items: { type: 'OBJECT', properties: {
            concept: { type: 'STRING' }, emoji: { type: 'STRING' },
            action: { type: 'STRING', enum: ['show', 'offer', 'wear', 'eat', 'smell', 'open', 'read', 'place', 'play'] },
            target: { type: 'STRING', enum: ['self', 'child', 'stage'] },
          } },
        },
        intensity: { type: 'NUMBER', description: 'Discrete acting intensity: 0 quiet, 1 gentle, 2 lively, 3 big.' },
      },
      required: ['dramatic_goal', 'speech_act', 'intensity'],
    },
  },
];

export interface LiveSetupMessage {
  setup: {
    model: string;
    generationConfig: { responseModalities: ['AUDIO']; speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: string } } } };
    systemInstruction: { parts: [{ text: string }] };
    tools: [{ functionDeclarations: typeof CHARACTER_TOOL_DECLARATIONS }];
    inputAudioTranscription: Record<string, never>;
    outputAudioTranscription: Record<string, never>;
    realtimeInputConfig: { automaticActivityDetection: { disabled: false } };
  };
}

export function buildLiveSetupMessage(model = DEFAULT_LIVE_MODEL, instruction = CHARACTER_SYSTEM_INSTRUCTION, voiceName = 'Puck'): LiveSetupMessage {
  return {
    setup: {
      model,
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
      },
      systemInstruction: { parts: [{ text: instruction }] },
      tools: [{ functionDeclarations: CHARACTER_TOOL_DECLARATIONS }],
      inputAudioTranscription: {},
      outputAudioTranscription: {},
      realtimeInputConfig: { automaticActivityDetection: { disabled: false } },
    },
  };
}

export function base64ToArrayBuffer(value: string): ArrayBuffer {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes.buffer;
}

export function arrayBufferToBase64(value: ArrayBuffer): string {
  const bytes = new Uint8Array(value);
  let binary = '';
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

export interface GeminiLiveSessionOptions {
  model?: string;
  tokenEndpoint?: string;
  apiKey?: string;
  voiceName?: string;
  systemInstruction?: string;
  webSocketFactory?: (url: string) => WebSocket;
}

type TokenResponse = { token?: string; accessToken?: string };

interface GeminiServerMessage {
  serverContent?: {
    modelTurn?: { parts?: Array<{ inlineData?: { data?: string }; text?: string }> };
    inputTranscription?: { text?: string };
    outputTranscription?: { text?: string };
    turnComplete?: boolean;
  };
  toolCall?: { functionCalls?: Array<{ id?: string; name: string; args?: Record<string, unknown> }> };
  setupComplete?: Record<string, unknown>;
  goAway?: Record<string, unknown>;
}

const characterToolNames = new Set<CharacterToolCall['name']>(['perform_turn', 'direct_performance', 'shape_performance', 'shape_expression', 'shape_locomotion', 'set_attention', 'set_presence']);

function parseServerMessage(raw: string): GeminiServerMessage | null {
  try { return JSON.parse(raw) as GeminiServerMessage; } catch { return null; }
}

export class GeminiLiveSession implements RealtimeCharacterSession {
  readonly inputMode = 'streaming-audio' as const;
  private socket: WebSocket | null = null;
  private listeners = new Set<CharacterSessionListener>();
  private options: GeminiLiveSessionOptions;
  private accessToken = '';
  private setupResolve: (() => void) | null = null;
  private setupReject: ((reason?: unknown) => void) | null = null;

  constructor(options: GeminiLiveSessionOptions = {}) {
    this.options = options;
  }

  async connect() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) return;
    this.emit({ type: 'status', data: 'authenticating' });
    const token = await this.getToken();
    const isEphemeral = !this.options.apiKey && !this.envApiKey;
    const endpoint = isEphemeral
      ? `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained?access_token=${encodeURIComponent(token)}`
      : `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${encodeURIComponent(token)}`;
    const factory = this.options.webSocketFactory ?? ((url: string) => new WebSocket(url));
    this.socket = factory(endpoint);
    await new Promise<void>((resolve, reject) => {
      this.setupResolve = resolve;
      this.setupReject = reject;
      const socket = this.socket!;
      const onOpen = () => {
        socket.removeEventListener('open', onOpen);
        socket.removeEventListener('error', onError);
        socket.send(JSON.stringify(buildLiveSetupMessage(
          this.options.model ?? DEFAULT_LIVE_MODEL,
          this.options.systemInstruction ?? CHARACTER_SYSTEM_INSTRUCTION,
          this.options.voiceName ?? 'Puck',
        )));
        this.emit({ type: 'status', data: 'connected' });
      };
      const onError = () => {
        socket.removeEventListener('open', onOpen);
        socket.removeEventListener('error', onError);
        const error = new Error('Unable to connect to Gemini Live');
        this.setupReject?.(error);
        this.setupReject = null;
        this.setupResolve = null;
      };
      socket.addEventListener('open', onOpen);
      socket.addEventListener('error', onError);
      socket.addEventListener('message', (event) => this.handleMessage(event.data));
      socket.addEventListener('close', () => {
        this.emit({ type: 'status', data: 'closed' });
        if (this.setupReject) {
          const rejectSetup = this.setupReject;
          this.setupReject = null;
          this.setupResolve = null;
          rejectSetup(new Error('Gemini Live closed before setup completed'));
        }
      });
    }).catch((error) => {
      this.emit({ type: 'error', data: error instanceof Error ? error.message : 'Gemini Live connection failed' });
      this.setupReject = null;
      this.setupResolve = null;
      throw error;
    });
  }

  send(input: ConversationInput) {
    if (input.type === 'audio') {
      this.sendWire({ realtimeInput: { audio: { mimeType: 'audio/pcm;rate=16000', data: arrayBufferToBase64(input.chunk) } } });
    } else if (input.type === 'perception') {
      this.sendWire({ realtimeInput: { text: `[perception] ${JSON.stringify(input.event)}` } });
    }
  }

  interrupt() {
    this.sendWire({ realtimeInput: { activityStart: {} } });
  }

  close() {
    this.socket?.close();
    this.socket = null;
    this.accessToken = '';
    this.setupResolve = null;
    this.setupReject = null;
  }

  subscribe(listener: CharacterSessionListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private get envApiKey() {
    return typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_GEMINI_API_KEY as string | undefined) ?? '' : '';
  }

  private async getToken() {
    const directKey = this.options.apiKey ?? this.envApiKey;
    if (directKey) return directKey;
    if (this.accessToken) return this.accessToken;
    const response = await fetch(this.options.tokenEndpoint ?? '/api/gemini-token');
    if (!response.ok) throw new Error('No Gemini ephemeral token endpoint is available');
    const body = await response.json() as TokenResponse;
    this.accessToken = body.token ?? body.accessToken ?? '';
    if (!this.accessToken) throw new Error('Gemini token endpoint returned no token');
    return this.accessToken;
  }

  private handleMessage(raw: string | Blob) {
    if (typeof raw !== 'string') return;
    const message = parseServerMessage(raw);
    if (!message) return;
    const content = message.serverContent;
    for (const part of content?.modelTurn?.parts ?? []) {
      const audio = part.inlineData?.data;
      if (audio) this.emit({ type: 'audio', data: base64ToArrayBuffer(audio) });
      if (part.text) this.emit({ type: 'transcript', data: part.text });
    }
    if (content?.inputTranscription?.text) this.emit({ type: 'input-transcript', data: content.inputTranscription.text });
    if (content?.outputTranscription?.text) this.emit({ type: 'transcript', data: content.outputTranscription.text });
    for (const functionCall of message.toolCall?.functionCalls ?? []) {
      if (characterToolNames.has(functionCall.name as CharacterToolCall['name'])) {
        const call: CharacterToolCall = { name: functionCall.name as CharacterToolCall['name'], args: functionCall.args ?? {} };
        this.emit({ type: 'tool-call', data: call });
      }
      this.sendWire({ toolResponse: { functionResponses: [{ id: functionCall.id, name: functionCall.name, response: { result: 'applied' } }] } });
    }
    if (content?.turnComplete) this.emit({ type: 'status', data: 'turn-complete' });
    if (message.setupComplete) {
      this.emit({ type: 'status', data: 'ready' });
      this.setupResolve?.();
      this.setupResolve = null;
      this.setupReject = null;
    }
    if (message.goAway) this.emit({ type: 'status', data: 'reconnect-required' });
  }

  private emit(event: CharacterSessionEvent) {
    this.listeners.forEach((listener) => listener(event));
  }

  private sendWire(message: unknown) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return false;
    this.socket.send(JSON.stringify(message));
    return true;
  }
}
