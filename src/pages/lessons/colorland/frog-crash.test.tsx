import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act, cleanup } from '@testing-library/react';
import { PartPattern } from './PartPattern';
import * as speechHook from '../../../hooks/useParrotSpeech';

// jsdom 没有 speechSynthesis —— 立即触发 onend，驱动自动课堂
function installFakeSpeech() {
  const win = window as any;
  win.speechSynthesis = {
    cancel: () => {},
    getVoices: () => [],
    speak: (u: any) => {
      setTimeout(() => u.onend?.(), 0);
    },
    paused: false,
    pending: false,
    speaking: false,
  };
  class FakeUtterance {
    text: string;
    lang = 'en-US';
    rate = 1;
    pitch = 1;
    volume = 1;
    onend: (() => void) | null = null;
    onerror: (() => void) | null = null;
    onstart: (() => void) | null = null;
    constructor(text: string) { this.text = text; }
  }
  win.SpeechSynthesisUtterance = FakeUtterance;
}

beforeEach(() => {
  cleanup();
  installFakeSpeech();
  vi.spyOn(speechHook, 'playPop').mockImplementation(() => {});
  vi.spyOn(speechHook, 'playSuccess').mockImplementation(() => {});
  vi.spyOn(speechHook, 'playCelebration').mockImplementation(() => {});
});

describe('PartPattern frog scene crash', () => {
  it('drives to frog scene without crashing', async () => {
    const onDone = vi.fn();
    let err: Error | null = null;
    try {
      await act(async () => {
        const { getByText } = render(<PartPattern onDone={onDone} />);
        // 自动课堂用真实 setTimeout 推进，等待足够长覆盖 bird → frog → apple → done
        await new Promise((r) => setTimeout(r, 1500));
      });
      await act(async () => {
        await new Promise((r) => setTimeout(r, 1500));
      });
      await act(async () => {
        await new Promise((r) => setTimeout(r, 1500));
      });
    } catch (e) {
      err = e as Error;
    }
    console.log('ERROR DURING RENDER/ADVANCE:', err);
    expect(err).toBeNull();
  });
});
