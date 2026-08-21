import { describe, expect, it } from 'vitest';
import { base64ToArrayBuffer, buildLiveSetupMessage, GeminiLiveSession } from './geminiLive';

describe('Gemini Live protocol adapter', () => {
  it('builds a constrained audio session with character tools', () => {
    const message = buildLiveSetupMessage('models/gemini-test', 'You are Olaf.', 'Kore');

    expect(message.setup.model).toBe('models/gemini-test');
    expect(message.setup.generationConfig.responseModalities).toEqual(['AUDIO']);
    expect(message.setup.generationConfig.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName).toBe('Kore');
    expect(message.setup.tools[0].functionDeclarations.map((tool: { name: string }) => tool.name)).toContain('perform_gesture');
    expect(message.setup.generationConfig.enableAffectiveDialog).toBe(true);
  });

  it('decodes PCM payloads without changing their bytes', () => {
    const decoded = base64ToArrayBuffer('AAECAwQ=');
    expect(Array.from(new Uint8Array(decoded))).toEqual([0, 1, 2, 3, 4]);
  });

  it('sends microphone PCM using the Live API audio envelope', async () => {
    const sent: string[] = [];
    type FakeMessage = { data?: string };
    const listeners: Record<string, Array<(event: FakeMessage) => void>> = {};
    const socket = {
      readyState: 1,
      addEventListener: (type: string, listener: (event: FakeMessage) => void) => {
        (listeners[type] ??= []).push(listener);
        if (type === 'open') queueMicrotask(() => listener({}));
      },
      removeEventListener: () => {},
      send: (message: string) => {
        sent.push(message);
        if (JSON.parse(message).setup) listeners.message?.forEach((listener) => listener({ data: JSON.stringify({ setupComplete: {} }) }));
      },
      close: () => {},
    } as unknown as WebSocket;
    const session = new GeminiLiveSession({ apiKey: 'test-key', webSocketFactory: () => socket });

    await session.connect();
    session.sendAudio(new Uint8Array([0, 1, 2, 3]).buffer);

    const audioMessage = JSON.parse(sent[1]);
    expect(audioMessage.realtimeInput.audio.mimeType).toBe('audio/pcm;rate=16000');
    expect(audioMessage.realtimeInput.audio.data).toBe('AAECAw==');
  });
});
