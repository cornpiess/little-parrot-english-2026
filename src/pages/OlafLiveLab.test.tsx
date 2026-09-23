import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import OlafLiveLab from './OlafLiveLab';

const speechProbe = vi.hoisted(() => ({ requests: [] as string[], requestTimes: [] as number[], completed: 0, cancelled: 0 }));

vi.mock('@/features/olaf-live/azureSpeechOutput', () => ({
  defaultAzureCharacterVoice: {
    provider: 'azure', subscriptionKey: 'test-key', region: 'test-region', voiceName: 'test-voice',
  },
  AzureSpeechOutput: class {
    private timer?: number;
    speak(request: { text: string }, callbacks: { onStart(): void; onEnd(): void }) {
      this.cancel();
      speechProbe.requests.push(request.text);
      speechProbe.requestTimes.push(Date.now());
      callbacks.onStart();
      this.timer = window.setTimeout(() => {
        this.timer = undefined;
        speechProbe.completed += 1;
        callbacks.onEnd();
      }, 5_000);
    }
    cancel() {
      if (this.timer === undefined) return;
      window.clearTimeout(this.timer);
      this.timer = undefined;
      speechProbe.cancelled += 1;
    }
  },
}));

beforeEach(() => {
  speechProbe.requests = [];
  speechProbe.requestTimes = [];
  speechProbe.completed = 0;
  speechProbe.cancelled = 0;
});

afterEach(() => { vi.useRealTimers(); });

describe('Olaf Live Lab', () => {
  it('renders a usable offline preview before credentials are configured', () => {
    render(<OlafLiveLab />);

    expect(screen.getByRole('heading', { name: /雪宝 · Live Lab/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: '开始实时对话' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '开启无限即兴' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '开启剧场随机' })).toBeTruthy();
    expect(screen.getByRole('slider', { name: '动作能量' })).toHaveValue('0.72');
    expect(screen.getByText('统一表演时钟')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Audio-to-Audio' })).toBeTruthy();
    expect(screen.getByText('离线预览')).toBeTruthy();
  });

  it('offers browser ASR with expressive Azure TTS and viseme timing', () => {
    render(<OlafLiveLab />);

    fireEvent.click(screen.getByRole('button', { name: 'LLM + ASR + TTS' }));

    expect(screen.getByLabelText('Chat Completions URL')).toBeTruthy();
    expect(screen.getByLabelText('API Key')).toBeTruthy();
    expect(screen.getByLabelText('ASR')).toHaveValue('browser');
    expect(screen.getByLabelText('TTS')).toHaveValue('azure');
    expect(screen.getByLabelText('Speech Key')).toBeTruthy();
  });

  it('stages a concrete teaching object as one coherent interaction', async () => {
    vi.useFakeTimers();
    const { container } = render(<OlafLiveLab />);

    fireEvent.click(screen.getByRole('button', { name: '演示 Apple 教学' }));
    await act(async () => { vi.advanceTimersByTime(1_700); });

    expect(screen.getByText('具身教学')).toBeTruthy();
    expect(screen.getAllByText('APPLE').length).toBeGreaterThanOrEqual(1);
    expect(container.querySelector('[data-stage-prop="apple"][data-prop-anchor="right-hand"]')).toBeTruthy();
    expect(speechProbe.requests[0].toLowerCase()).toContain('apple');
  });

  it('exposes reusable object-action demonstrations instead of object-specific code paths', async () => {
    vi.useFakeTimers();
    const { container } = render(<OlafLiveLab />);
    expect(screen.getByRole('group', { name: '物体动作演示' }).querySelectorAll('button')).toHaveLength(12);
    expect(screen.getByRole('button', { name: /拿苹果/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /闻花花/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /读绘本/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /玩足球/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /接气球/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /吹泡泡/ })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /拿香蕉/ }));
    await act(async () => { vi.advanceTimersByTime(1_700); });
    expect(container.querySelector('[data-stage-prop="banana"]')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /戴圣诞帽/ }));
    await act(async () => { vi.advanceTimersByTime(1_700); });
    expect(container.querySelector('[data-stage-prop="christmas-hat"]')).toBeTruthy();
    await act(async () => { vi.advanceTimersByTime(1_000); });
    expect(container.querySelector('[data-stage-prop="christmas-hat"][data-prop-anchor="head"]')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /拆礼物/ }));
    await act(async () => { vi.advanceTimersByTime(1_700); });
    expect(container.querySelector('[data-stage-prop="gift"][data-prop-anchor="both-hands"]')).toBeTruthy();
    expect(container.querySelectorAll('[data-arm-constrained="true"]')).toHaveLength(4);

    fireEvent.click(screen.getByRole('button', { name: /吃蛋糕/ }));
    await act(async () => { vi.advanceTimersByTime(1_700); });
    expect(container.querySelector('[data-stage-prop="cake"][data-prop-anchor="mouth"]')).toBeTruthy();
  });

  it('offers continuous mixing and open-ended improvisation instead of named clips', () => {
    render(<OlafLiveLab />);

    fireEvent.change(screen.getByRole('slider', { name: '动作能量' }), { target: { value: '0.91' } });
    expect(screen.getByRole('slider', { name: '动作能量' })).toHaveValue('0.91');

    fireEvent.click(screen.getByRole('button', { name: '开启无限即兴' }));
    expect(screen.getByRole('button', { name: '停止无限即兴' })).toBeTruthy();
    expect(screen.getByText('正在生成')).toBeTruthy();
    expect(screen.getByText('戏剧目标')).toBeTruthy();
    expect(screen.getByText('表演节拍')).toBeTruthy();
    expect(screen.getByText(/希望孩子感到/)).toBeTruthy();
    expect(screen.getByRole('button', { name: '委屈哭泣' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '开心拍手' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '摇头拒绝' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '点头认同' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '开心拍手' }));
    expect(screen.getByRole('group', { name: '当前状态的五句台词' }).querySelectorAll('button')).toHaveLength(5);
    const demoCatalog = screen.getByRole('region', { name: '导演状态演示' });
    expect(within(demoCatalog).getAllByRole('button').length).toBeGreaterThanOrEqual(30);
  });

  it('lets a spoken line finish before scheduling another performance line', async () => {
    vi.useFakeTimers();
    render(<OlafLiveLab />);
    fireEvent.click(screen.getByRole('button', { name: '开启无限即兴' }));

    await act(async () => { vi.advanceTimersByTime(10_500); });

    expect(speechProbe.completed).toBeGreaterThanOrEqual(1);
    expect(speechProbe.cancelled).toBe(0);
    expect(speechProbe.requests.length).toBeGreaterThanOrEqual(2);
    expect(speechProbe.requestTimes[1] - speechProbe.requestTimes[0]).toBeLessThan(7_000);
  });

  it('finishes every spoken theater beat before changing scenes', async () => {
    vi.useFakeTimers();
    render(<OlafLiveLab />);
    fireEvent.click(screen.getByRole('button', { name: '开启剧场随机' }));

    const readout = screen.getByLabelText('儿童单口剧场状态');
    const firstTitle = readout.querySelector('strong')?.textContent;
    expect(screen.getByRole('button', { name: '停止剧场随机' })).toBeTruthy();
    expect(screen.getByText('剧场演出')).toBeTruthy();
    expect(firstTitle).toMatch(/[A-H]组/);

    await act(async () => { vi.advanceTimersByTime(30_200); });

    expect(readout.querySelector('strong')?.textContent).toBe(firstTitle);
    expect(speechProbe.completed).toBeGreaterThanOrEqual(3);
    expect(speechProbe.cancelled).toBe(0);

    await act(async () => { vi.advanceTimersByTime(30_000); });

    expect(readout.querySelector('strong')?.textContent).not.toBe(firstTitle);
    expect(speechProbe.completed).toBeGreaterThanOrEqual(7);
    expect(speechProbe.cancelled).toBe(0);
  });
});
