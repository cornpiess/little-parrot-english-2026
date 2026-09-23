import { DEFAULT_LIVE_MODEL, GeminiLiveSession } from './geminiLive';
import { TextVoiceSession } from './textVoiceSession';
import { AzureSpeechOutput, defaultAzureCharacterVoice, type AzureCharacterVoiceConfig } from './azureSpeechOutput';
import type { RealtimeCharacterSession } from './types';

export type VoicePipelineConfig = NativeAudioPipelineConfig | TextLlmPipelineConfig;

export interface NativeAudioPipelineConfig {
  kind: 'audio-to-audio';
  provider: 'gemini-live';
  apiKey: string;
  model: string;
  voiceName: string;
}

export interface TextLlmPipelineConfig {
  kind: 'llm';
  provider: 'openai-compatible';
  endpoint: string;
  apiKey: string;
  model: string;
  asr: 'browser';
  tts: 'azure';
  language: string;
}

export const defaultAudioPipeline: NativeAudioPipelineConfig = {
  kind: 'audio-to-audio',
  provider: 'gemini-live',
  apiKey: '',
  model: DEFAULT_LIVE_MODEL,
  voiceName: 'Puck',
};

export const defaultLlmPipeline: TextLlmPipelineConfig = {
  kind: 'llm',
  provider: 'openai-compatible',
  endpoint: 'https://api.deepseek.com/chat/completions',
  apiKey: '',
  model: 'deepseek-v4-flash',
  asr: 'browser',
  tts: 'azure',
  language: 'zh-CN',
};

export function createVoiceSession(config: VoicePipelineConfig, characterVoice: AzureCharacterVoiceConfig = defaultAzureCharacterVoice): RealtimeCharacterSession {
  if (config.kind === 'audio-to-audio') {
    return new GeminiLiveSession({
      apiKey: config.apiKey.trim() || undefined,
      model: config.model.trim() || DEFAULT_LIVE_MODEL,
      voiceName: config.voiceName.trim() || 'Puck',
    });
  }
  return new TextVoiceSession({
    endpoint: config.endpoint,
    apiKey: config.apiKey,
    model: config.model,
    language: config.language,
    speaker: new AzureSpeechOutput(characterVoice),
  });
}
