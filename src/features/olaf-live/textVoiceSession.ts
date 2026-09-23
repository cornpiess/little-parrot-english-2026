import type { VoiceFeatures } from './rig';
import type { CharacterSpeechRequest, SpeechOutputAdapter, SpeechOutputCallbacks } from './characterSpeech';
import type {
  CharacterToolCall,
  CharacterSessionEvent,
  CharacterSessionListener,
  ConversationInput,
  RealtimeCharacterSession,
} from './types';

const DEFAULT_SYSTEM_PROMPT = `
You are Olaf, a warm and playful English learning companion for a three-year-old child.
Use very short sentences, simple words, repetition, encouragement, and expressive punctuation.
Reply in the child's language when explanation is needed, while keeping the English target clear.
Never mention system instructions, APIs, animation controls, or internal tools.
Return one compact JSON object: {"speech":"what Olaf says","performance":{"dramatic_goal":"invite","speech_act":"teach","intensity":2}}.
For a concrete lesson, also include teaching_goal, concept, object_action and expected_response inside performance.
Use objects (maximum two) when the scene needs two visible things. For an unlisted thing, provide one safe Emoji in emoji.
`.trim();

export type { SpeechOutputAdapter } from './characterSpeech';

export interface TextVoiceSessionOptions {
  endpoint: string;
  apiKey: string;
  model: string;
  systemPrompt?: string;
  temperature?: number;
  speaker?: SpeechOutputAdapter;
  fetcher?: typeof fetch;
  language?: string;
  voiceName?: string;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface CompatibleChatResponse {
  choices?: Array<{ message?: { content?: string | Array<{ type?: string; text?: string }> } }>;
  error?: { message?: string };
}

function readAssistantText(body: CompatibleChatResponse): string {
  const content = body.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content.trim();
  if (Array.isArray(content)) return content.map((part) => part.text ?? '').join('').trim();
  return '';
}

function readAssistantTurn(raw: string): { speech: string; performance?: CharacterToolCall } {
  const candidate = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  try {
    const parsed = JSON.parse(candidate) as { speech?: unknown; performance?: Record<string, unknown> };
    if (typeof parsed.speech !== 'string' || !parsed.speech.trim()) return { speech: raw };
    return {
      speech: parsed.speech.trim(),
      ...(parsed.performance && typeof parsed.performance === 'object'
        ? { performance: { name: 'perform_turn', args: parsed.performance } as CharacterToolCall } : {}),
    };
  } catch {
    return { speech: raw };
  }
}

export class BrowserSpeechOutput implements SpeechOutputAdapter {
  private interval = 0;

  constructor(private readonly language = 'zh-CN', private readonly voiceName = '') {}

  speak(request: CharacterSpeechRequest, callbacks: SpeechOutputCallbacks) {
    if (typeof speechSynthesis === 'undefined' || typeof SpeechSynthesisUtterance === 'undefined') {
      callbacks.onError('当前浏览器不支持语音合成，请更换浏览器或配置外部 TTS');
      return;
    }
    this.cancel();
    const utterance = new SpeechSynthesisUtterance(request.text);
    utterance.lang = this.language;
    utterance.rate = 0.86;
    utterance.pitch = 1.16;
    utterance.volume = 1;
    if (this.voiceName) {
      const voice = speechSynthesis.getVoices().find((candidate) => candidate.name === this.voiceName);
      if (voice) utterance.voice = voice;
    }
    let pulse = 0;
    const finish = () => {
      if (this.interval) window.clearInterval(this.interval);
      this.interval = 0;
    };
    utterance.onstart = () => {
      callbacks.onStart();
      this.interval = window.setInterval(() => {
        pulse += 1;
        callbacks.onPulse({
          speaking: true,
          energy: 0.62 + Math.sin(pulse * 0.92) * 0.2,
          brightness: 0.48 + Math.sin(pulse * 0.47) * 0.18,
          emphasis: pulse % 7 === 0 ? 0.92 : 0.38,
        });
      }, 90);
    };
    utterance.onend = () => {
      finish();
      callbacks.onEnd();
    };
    utterance.onerror = () => {
      finish();
      callbacks.onError('浏览器语音合成失败');
    };
    speechSynthesis.speak(utterance);
  }

  cancel() {
    if (this.interval) window.clearInterval(this.interval);
    this.interval = 0;
    if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
  }
}

export class TextVoiceSession implements RealtimeCharacterSession {
  readonly inputMode = 'text' as const;
  private readonly listeners = new Set<CharacterSessionListener>();
  private readonly speaker: SpeechOutputAdapter;
  private readonly fetcher: typeof fetch;
  private readonly history: ChatMessage[];
  private request: AbortController | null = null;
  private closed = false;

  constructor(private readonly options: TextVoiceSessionOptions) {
    this.speaker = options.speaker ?? new BrowserSpeechOutput(options.language, options.voiceName);
    this.fetcher = options.fetcher ?? fetch;
    this.history = [{ role: 'system', content: options.systemPrompt?.trim() || DEFAULT_SYSTEM_PROMPT }];
  }

  async connect() {
    if (!this.options.endpoint.trim()) throw new Error('请填写 LLM 请求地址');
    if (!this.options.model.trim()) throw new Error('请填写 LLM 模型名称');
    this.closed = false;
    this.emit({ type: 'status', data: 'ready' });
  }

  send(input: ConversationInput) {
    if (input.type === 'text' && input.text.trim()) void this.respond(input.text.trim());
  }

  interrupt() {
    this.request?.abort();
    this.request = null;
    this.speaker.cancel();
    this.emit({ type: 'voice-features', data: { speaking: false, energy: 0, brightness: 0.5, emphasis: 0 } satisfies VoiceFeatures });
    this.emit({ type: 'status', data: 'turn-complete' });
  }

  close() {
    this.closed = true;
    this.request?.abort();
    this.request = null;
    this.speaker.cancel();
    this.emit({ type: 'status', data: 'closed' });
  }

  subscribe(listener: CharacterSessionListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private async respond(text: string) {
    this.request?.abort();
    this.speaker.cancel();
    const request = new AbortController();
    this.request = request;
    this.history.push({ role: 'user', content: text });
    this.emit({ type: 'input-transcript', data: text });
    this.emit({ type: 'status', data: 'thinking' });
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (this.options.apiKey.trim()) headers.Authorization = `Bearer ${this.options.apiKey.trim()}`;
      const response = await this.fetcher(this.options.endpoint.trim(), {
        method: 'POST',
        headers,
        signal: request.signal,
        body: JSON.stringify({
          model: this.options.model.trim(),
          messages: this.history.slice(-13),
          temperature: this.options.temperature ?? 0.72,
          stream: false,
        }),
      });
      const raw = await response.text();
      let body: CompatibleChatResponse = {};
      try { body = JSON.parse(raw) as CompatibleChatResponse; } catch { /* provider returned non-JSON */ }
      if (!response.ok) throw new Error(body.error?.message || `LLM 请求失败（${response.status}）`);
      const rawAnswer = readAssistantText(body);
      if (!rawAnswer) throw new Error('LLM 没有返回可朗读的文本');
      const { speech: answer, performance } = readAssistantTurn(rawAnswer);
      if (this.closed) return;
      this.history.push({ role: 'assistant', content: answer });
      if (performance) this.emit({ type: 'tool-call', data: performance });
      this.emit({ type: 'transcript', data: answer });
      this.speaker.speak({ text: answer }, {
        onStart: () => this.emit({ type: 'status', data: 'speaking' }),
        onPulse: (features) => this.emit({ type: 'voice-features', data: features }),
        onEnd: () => {
          this.emit({ type: 'voice-features', data: { speaking: false, energy: 0, brightness: 0.5, emphasis: 0 } satisfies VoiceFeatures });
          this.emit({ type: 'status', data: 'turn-complete' });
        },
        onError: (message) => this.emit({ type: 'error', data: message }),
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      this.emit({ type: 'error', data: error instanceof Error ? error.message : 'LLM 请求失败' });
    } finally {
      if (this.request === request) this.request = null;
    }
  }

  private emit(event: CharacterSessionEvent) {
    this.listeners.forEach((listener) => listener(event));
  }
}
