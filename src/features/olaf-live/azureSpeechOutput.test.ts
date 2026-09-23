import { afterEach, describe, expect, it, vi } from 'vitest';
import { AzureSpeechOutput } from './azureSpeechOutput';

describe('Azure speech output', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('unlocks browser audio synchronously while the user gesture is still active', () => {
    let contextsCreated = 0;
    let resumeCalls = 0;
    class FakeAudioContext {
      constructor() { contextsCreated += 1; }
      resume() { resumeCalls += 1; return Promise.resolve(); }
      close() { return Promise.resolve(); }
    }
    vi.stubGlobal('AudioContext', FakeAudioContext);
    const output = new AzureSpeechOutput({ provider: 'azure', subscriptionKey: 'test-key', region: 'eastasia', voiceName: 'zh-CN-YunxiNeural' });

    output.speak({ text: 'Hello' }, { onStart: vi.fn(), onPulse: vi.fn(), onEnd: vi.fn(), onError: vi.fn() });

    expect(contextsCreated).toBe(1);
    expect(resumeCalls).toBe(1);
    output.cancel();
  });
});
