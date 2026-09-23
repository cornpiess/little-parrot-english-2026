import type { SpeechOutputAdapter, SpeechOutputCallbacks, CharacterSpeechRequest } from './characterSpeech';
import { buildAzureSsml, mapAzureViseme } from './characterSpeech';

export interface AzureCharacterVoiceConfig {
  provider: 'azure';
  subscriptionKey: string;
  region: string;
  voiceName: string;
}

export const defaultAzureCharacterVoice: AzureCharacterVoiceConfig = {
  provider: 'azure',
  subscriptionKey: '',
  region: 'eastasia',
  voiceName: 'zh-CN-YunxiNeural',
};

interface TimedViseme { offsetMs: number; id: number }
interface PreparedSpeech { audioData: ArrayBuffer; visemes: TimedViseme[] }

export class AzureSpeechOutput implements SpeechOutputAdapter {
  private generation = 0;
  private source: AudioBufferSourceNode | null = null;
  private context: AudioContext | null = null;
  private timers: number[] = [];
  private prepared = new Map<string, Promise<PreparedSpeech>>();

  constructor(private readonly config: AzureCharacterVoiceConfig) {}

  speak(request: CharacterSpeechRequest, callbacks: SpeechOutputCallbacks) {
    try {
      this.ensureAudioContext();
    } catch (error) {
      callbacks.onError(error instanceof Error ? error.message : '浏览器无法初始化音频播放');
      return;
    }
    void this.perform(request, callbacks);
  }

  /** Start synthesis before a cue is needed. The returned promise is shared by speak(). */
  preload(requests: readonly CharacterSpeechRequest[]) {
    if (!this.config.subscriptionKey.trim() || !this.config.region.trim()) return;
    requests.slice(0, 3).forEach((request) => { void this.prepare(request).catch(() => undefined); });
  }

  private ensureAudioContext() {
    const BrowserAudioContext = window.AudioContext;
    if (!BrowserAudioContext) throw new Error('当前浏览器不支持 AudioContext，无法播放 Azure 语音');
    this.context ??= new BrowserAudioContext();
    void this.context.resume();
    return this.context;
  }

  cancel() {
    this.generation += 1;
    this.source?.stop();
    this.source?.disconnect();
    this.source = null;
    this.timers.forEach((timer) => window.clearTimeout(timer));
    this.timers = [];
  }

  private cacheKey(request: CharacterSpeechRequest) {
    const delivery = request.delivery;
    return [this.config.voiceName, request.text, delivery?.style ?? '', delivery?.styleDegree ?? '', delivery?.rate ?? '', delivery?.pitch ?? '', delivery?.volume ?? ''].join('|');
  }

  private prepare(request: CharacterSpeechRequest): Promise<PreparedSpeech> {
    const key = this.cacheKey(request);
    const cached = this.prepared.get(key);
    if (cached) return cached;
    const promise = this.synthesize(request).catch((error) => {
      this.prepared.delete(key);
      throw error;
    });
    this.prepared.set(key, promise);
    while (this.prepared.size > 8) this.prepared.delete(this.prepared.keys().next().value as string);
    return promise;
  }

  private async synthesize(request: CharacterSpeechRequest): Promise<PreparedSpeech> {
    const sdk = await import('microsoft-cognitiveservices-speech-sdk');
    const speechConfig = sdk.SpeechConfig.fromSubscription(this.config.subscriptionKey.trim(), this.config.region.trim());
    speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Riff24Khz16BitMonoPcm;
    speechConfig.speechSynthesisVoiceName = this.config.voiceName;
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null);
    let visemes: TimedViseme[] = [];
    synthesizer.visemeReceived = (_sender, event) => { visemes.push({ offsetMs: event.audioOffset / 10_000, id: event.visemeId }); };
    const synthesize = (expressive: boolean) => new Promise<InstanceType<typeof sdk.SpeechSynthesisResult>>((resolve, reject) => {
      const failed = (error: string) => reject(new Error(String(error)));
      if (expressive) synthesizer.speakSsmlAsync(buildAzureSsml(request, this.config.voiceName), resolve, failed);
      else synthesizer.speakTextAsync(request.text, resolve, failed);
    });
    try {
      let result = await synthesize(true);
      let cancellation = result.reason === sdk.ResultReason.SynthesizingAudioCompleted ? null : sdk.CancellationDetails.fromResult(result);
      if (cancellation?.ErrorCode === sdk.CancellationErrorCode.BadRequestParameters) {
        (result as { close?: () => void }).close?.();
        visemes = [];
        result = await synthesize(false);
        cancellation = result.reason === sdk.ResultReason.SynthesizingAudioCompleted ? null : sdk.CancellationDetails.fromResult(result);
      }
      if (result.reason !== sdk.ResultReason.SynthesizingAudioCompleted || !result.audioData.byteLength) {
        const code = cancellation?.ErrorCode;
        const detail = cancellation?.errorDetails?.trim();
        if (code === sdk.CancellationErrorCode.AuthenticationFailure) throw new Error('Azure Speech 认证失败：请确认填写的是 Speech 资源 Key，并且 Region 与资源区域完全一致');
        if (code === sdk.CancellationErrorCode.Forbidden) throw new Error('Azure Speech 拒绝访问：请检查免费额度、资源状态或订阅权限');
        if (code === sdk.CancellationErrorCode.TooManyRequests) throw new Error('Azure Speech 请求过多，请稍后再试');
        if (code === sdk.CancellationErrorCode.ConnectionFailure || code === sdk.CancellationErrorCode.ServiceTimeout) throw new Error('无法连接 Azure Speech，请检查网络与 Region');
        throw new Error(detail ? `Azure Speech 合成失败：${detail}` : 'Azure 没有返回语音音频');
      }
      return { audioData: result.audioData.slice(0), visemes };
    } finally {
      synthesizer.close();
    }
  }

  private async perform(request: CharacterSpeechRequest, callbacks: SpeechOutputCallbacks) {
    this.cancel();
    const generation = this.generation;
    if (!this.config.subscriptionKey.trim() || !this.config.region.trim()) {
      callbacks.onError('请先填写 Azure Speech Key 和区域，再让雪宝说台词');
      return;
    }

    try {
      const prepared = await this.prepare(request);
      if (generation !== this.generation) return;
      const context = this.ensureAudioContext();
      await context.resume();
      const audio = await context.decodeAudioData(prepared.audioData.slice(0));
      if (generation !== this.generation) return;
      const source = this.context.createBufferSource();
      source.buffer = audio;
      source.connect(this.context.destination);
      this.source = source;
      const delivery = request.delivery;
      const baseEnergy = Math.min(1, 0.42 + (delivery?.volume ?? 96) / 220 + Math.max(0, delivery?.rate ?? 0) / 180);
      const brightness = Math.min(1, 0.48 + (delivery?.pitch ?? 8) / 55);
      const emphasis = Math.min(1, 0.42 + (delivery?.styleDegree ?? 1) * 0.28);

      callbacks.onStart();
      for (const viseme of prepared.visemes) {
        const timer = window.setTimeout(() => {
          if (generation !== this.generation) return;
          callbacks.onPulse({
            speaking: true,
            energy: baseEnergy,
            brightness,
            emphasis,
            ...mapAzureViseme(viseme.id),
          });
        }, Math.max(0, viseme.offsetMs));
        this.timers.push(timer);
      }
      source.onended = () => {
        if (generation !== this.generation) return;
        this.source = null;
        this.timers = [];
        callbacks.onEnd();
      };
      source.start();
    } catch (error) {
      if (generation !== this.generation) return;
      callbacks.onError(error instanceof Error ? error.message : 'Azure 角色语音合成失败');
    }
  }
}
