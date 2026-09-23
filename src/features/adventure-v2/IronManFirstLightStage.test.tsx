import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import IronManFirstLightStage from './IronManFirstLightStage';

describe('Iron Man First Light stage shell', () => {
  it('defaults to pure background review mode allowing auditing of all 10 scene sets', () => {
    const { container } = render(<IronManFirstLightStage initialReviewMode={true} />);

    expect(screen.getByRole('complementary', { name: '故事后台控制台' })).toBeInTheDocument();
    expect(container.querySelector('.scene-review-hud')).toBeInTheDocument();
    expect(container.querySelector('[data-scene-set="signal-lab"]')).toBeInTheDocument();

    // Verify navigating to next scene in review mode
    const nextBtn = screen.getByRole('button', { name: '下一张背景' });
    fireEvent.click(nextBtn);
    expect(container.querySelector('[data-scene-set="armor-platform"]')).toBeInTheDocument();

    // Verify switching through dropdown
    const select = screen.getByRole('combobox', { name: '选择背景' });
    fireEvent.change(select, { target: { value: '9' } });
    expect(container.querySelector('[data-scene-set="dawn-sky-peak"]')).toBeInTheDocument();

    // Verify no Iron Man actor is cluttering the background in review mode
    expect(container.querySelector('.iron-first-light-actor')).toBeNull();
  });

  it('keeps adult controls outside the child-facing stage and removes unexplained white hands', () => {
    const { container } = render(<IronManFirstLightStage initialReviewMode={false} />);

    expect(screen.getByRole('complementary', { name: '故事后台控制台' })).toBeInTheDocument();
    expect(container.querySelector('[data-child-stage]')).toBeInTheDocument();
    expect(container.querySelectorAll('.iron-child-glove')).toHaveLength(0);
    expect(screen.getByRole('button', { name: '开始' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '暂停' })).toBeInTheDocument();
    expect(container.querySelector('[data-adult-console] [data-child-stage]')).toBeNull();
    expect(container.querySelector('[data-child-stage] [data-adult-console]')).toBeNull();
    expect(container.querySelector('[data-child-stage] [data-iron-cue]')).toBeNull();
  });

  it('does not request the front camera until an adult explicitly enables it', async () => {
    const track = { stop: vi.fn() };
    const getUserMedia = vi.fn().mockResolvedValue({ getTracks: () => [track] });
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia },
    });
    render(<IronManFirstLightStage initialReviewMode={false} />);
    expect(getUserMedia).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: '开启副驾驶摄像头' }));
    await waitFor(() => expect(getUserMedia).toHaveBeenCalledWith({ video: { facingMode: 'user' }, audio: false }));
  });

  it('keeps the copilot HUD causal and closes a pending narration when muted', () => {
    const { container } = render(<IronManFirstLightStage initialReviewMode={false} />);
    expect(container.querySelector('[data-child-copilot]')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '开始钢铁侠冒险' }));
    expect(container.querySelector('[data-child-copilot]')).toBeNull();
    fireEvent.change(screen.getByLabelText('选择场景'), { target: { value: '2' } });
    expect(container.querySelector('[data-child-copilot]')).toBeInTheDocument();
    expect(container.textContent).not.toContain('HULKBUSTER COPILOT');
    expect(container.textContent).not.toContain('READY');
  });

  it('ends the active speech gate when the adult mutes an in-flight utterance', () => {
    const synthesis = { cancel: vi.fn(), speak: vi.fn() };
    const Utterance = class {
      lang = '';
      rate = 1;
      pitch = 1;
      volume = 1;
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor(public text: string) {}
    };
    const originalSynthesis = window.speechSynthesis;
    const originalUtterance = window.SpeechSynthesisUtterance;
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: synthesis });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: Utterance });
    try {
      const { container } = render(<IronManFirstLightStage initialReviewMode={false} />);
      fireEvent.click(screen.getByRole('button', { name: '开始钢铁侠冒险' }));
      expect(container.querySelector('[data-narration]')).toHaveAttribute('data-narration', 'pending');
      fireEvent.click(screen.getByRole('button', { name: '静音' }));
      expect(container.querySelector('[data-narration]')).toHaveAttribute('data-narration', 'ended');
      expect(synthesis.cancel).toHaveBeenCalled();
    } finally {
      Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: originalSynthesis });
      Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: originalUtterance });
    }
  });
});
