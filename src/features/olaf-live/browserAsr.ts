export interface AsrResult {
  text: string;
  final: boolean;
}

interface BrowserRecognitionResult {
  isFinal: boolean;
  0?: { transcript?: string };
}

interface BrowserRecognitionEvent {
  resultIndex: number;
  results: ArrayLike<BrowserRecognitionResult>;
}

interface BrowserRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: BrowserRecognitionEvent) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type RecognitionConstructor = new () => BrowserRecognition;

declare global {
  interface Window {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  }
}

export interface BrowserAsrOptions {
  language?: string;
  constructor?: RecognitionConstructor | null;
}

export class BrowserAsrCapture {
  private recognition: BrowserRecognition | null = null;
  private running = false;
  private restartTimer = 0;

  constructor(private readonly options: BrowserAsrOptions = {}) {}

  start(onResult: (result: AsrResult) => void, onError?: (message: string) => void) {
    if (this.running) return;
    const Recognition = this.options.constructor === undefined
      ? window.SpeechRecognition ?? window.webkitSpeechRecognition
      : this.options.constructor ?? undefined;
    if (!Recognition) throw new Error('当前浏览器不支持语音识别，请使用 Chrome/Edge 或配置外部 ASR');
    this.running = true;
    const recognition = new Recognition();
    this.recognition = recognition;
    recognition.lang = this.options.language ?? 'zh-CN';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const text = result?.[0]?.transcript?.trim() ?? '';
        if (text) onResult({ text, final: Boolean(result.isFinal) });
      }
    };
    recognition.onerror = (event) => {
      if (event.error === 'aborted' || event.error === 'no-speech') return;
      onError?.(`语音识别失败：${event.error || 'unknown'}`);
    };
    recognition.onend = () => {
      if (!this.running) return;
      this.restartTimer = window.setTimeout(() => {
        if (!this.running) return;
        try { recognition.start(); } catch { /* browser is already restarting */ }
      }, 250);
    };
    recognition.start();
  }

  stop() {
    this.running = false;
    if (this.restartTimer) window.clearTimeout(this.restartTimer);
    this.restartTimer = 0;
    try { this.recognition?.stop(); } catch { /* already stopped */ }
    this.recognition = null;
  }

  abort() {
    this.running = false;
    if (this.restartTimer) window.clearTimeout(this.restartTimer);
    this.restartTimer = 0;
    try { this.recognition?.abort(); } catch { /* already stopped */ }
    this.recognition = null;
  }
}

