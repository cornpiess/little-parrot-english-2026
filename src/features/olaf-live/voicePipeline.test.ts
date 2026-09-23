import { describe, expect, it } from 'vitest';
import { createVoiceSession, defaultAudioPipeline, defaultLlmPipeline } from './voicePipeline';

describe('voice pipeline factory', () => {
  it('creates a native streaming audio adapter', () => {
    expect(createVoiceSession(defaultAudioPipeline).inputMode).toBe('streaming-audio');
  });

  it('creates a text adapter that expects browser ASR input', () => {
    expect(createVoiceSession(defaultLlmPipeline).inputMode).toBe('text');
  });
});

