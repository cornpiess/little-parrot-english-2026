import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import OlafOceanAdventure from './OlafOceanAdventure';

const azureProbe = vi.hoisted(() => ({ configs: [] as Array<{ subscriptionKey: string; region: string }>, spoken: [] as string[] }));

vi.mock('@/features/olaf-live/azureSpeechOutput', () => ({
  defaultAzureCharacterVoice: { provider: 'azure', subscriptionKey: '', region: 'eastasia', voiceName: 'zh-CN-YunxiNeural' },
  AzureSpeechOutput: class {
    constructor(config: { subscriptionKey: string; region: string }) { azureProbe.configs.push(config); }
    cancel() {}
    speak(request: { text: string }, callbacks: { onStart(): void; onEnd(): void; onError(message: string): void }) {
      azureProbe.spoken.push(request.text);
      const config = azureProbe.configs.at(-1);
      if (config?.subscriptionKey === 'bad-key') callbacks.onError('Azure Speech 认证失败：请确认 Key 和 Region');
      else { callbacks.onStart(); callbacks.onEnd(); }
    }
  },
}));

describe('Olaf ocean adventure', () => {
  it('renders a playable story instead of a passive five-minute narration', () => {
    const { container } = render(<OlafOceanAdventure />);

    expect(screen.getByRole('heading', { name: '雪宝的发光水母任务' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '开始海洋冒险' }));
    expect(screen.getByText(/海底有一盏小灯/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: '进入下一幕' }));
    expect(container.querySelector('[data-character-costume="ocean-diving-suit"]')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '进入下一幕' }));
    expect(container.querySelector('[data-adventure-vehicle="bubble-submarine"]')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: '进入下一幕' }));
    fireEvent.click(screen.getByRole('button', { name: '进入下一幕' }));
    fireEvent.click(screen.getByRole('button', { name: '进入下一幕' }));
    expect(container.querySelector('[data-adventure-entity="jellyfish"]')).toBeTruthy();
    expect(screen.getByRole('button', { name: '🎙️ 打开麦克风回答' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: '演示：我说了 jellyfish' }));
    expect(screen.getByText('选择一种玩法')).toBeTruthy();
    expect(screen.getByText('jellyfish').closest('div')?.className).toContain('is-learned');
  });

  it('uses the entered Azure credentials and exposes the actionable service error', () => {
    render(<OlafOceanAdventure />);
    fireEvent.click(screen.getByText('可选：Azure 情绪语音'));
    fireEvent.change(screen.getByLabelText('Region'), { target: { value: 'westus2' } });
    fireEvent.change(screen.getByLabelText('Speech Key'), { target: { value: 'bad-key' } });
    fireEvent.click(screen.getByRole('button', { name: '开始海洋冒险' }));

    expect(azureProbe.configs.at(-1)).toMatchObject({ subscriptionKey: 'bad-key', region: 'westus2' });
    expect(azureProbe.spoken.length).toBeGreaterThan(0);
    expect(screen.getByText('Azure Speech 认证失败：请确认 Key 和 Region')).toBeTruthy();
  });

  it('reuses an ocean story with a native-armour lead without applying Olaf costumes', () => {
    const { container } = render(<OlafOceanAdventure />);
    fireEvent.click(screen.getByText('钢铁侠').closest('button')!);
    fireEvent.click(screen.getByRole('button', { name: '开始海洋冒险' }));
    expect(container.querySelector('[data-adventure-character="ironman"]')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '进入下一幕' }));
    expect(container.querySelector('[data-adventure-character="ironman"]')).toBeTruthy();
    expect(container.querySelector('[data-character-costume="ocean-diving-suit"]')).toBeFalsy();
  });

});
