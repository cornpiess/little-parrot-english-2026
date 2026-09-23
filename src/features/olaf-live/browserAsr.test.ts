import { describe, expect, it, vi } from 'vitest';
import { BrowserAsrCapture } from './browserAsr';

describe('BrowserAsrCapture', () => {
  it('reports when browser speech recognition is unavailable', () => {
    const capture = new BrowserAsrCapture({ constructor: null });
    expect(() => capture.start(() => {})).toThrow(/不支持语音识别/);
  });

  it('emits interim and final transcripts through one interface', () => {
    const start = vi.fn();
    const stop = vi.fn();
    const fake = { lang: '', continuous: false, interimResults: false, onresult: null, onerror: null, onend: null, start, stop, abort: vi.fn() };
    const Capture = function () { return fake; } as never;
    const capture = new BrowserAsrCapture({ constructor: Capture });
    const listener = vi.fn();
    capture.start(listener);

    (fake.onresult as unknown as (event: unknown) => void)({
      resultIndex: 0,
      results: [
        { 0: { transcript: 'hel' }, isFinal: false },
        { 0: { transcript: 'hello' }, isFinal: true },
      ],
    });

    expect(listener).toHaveBeenNthCalledWith(1, { text: 'hel', final: false });
    expect(listener).toHaveBeenNthCalledWith(2, { text: 'hello', final: true });
    expect(fake.lang).toBe('zh-CN');
    expect(start).toHaveBeenCalledOnce();
    capture.stop();
    expect(stop).toHaveBeenCalledOnce();
  });
});

