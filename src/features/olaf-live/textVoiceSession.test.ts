import { describe, expect, it, vi } from 'vitest';
import { TextVoiceSession, type SpeechOutputAdapter } from './textVoiceSession';

describe('TextVoiceSession', () => {
  it('runs text through an OpenAI-compatible LLM and then through TTS', async () => {
    const events: Array<{ type: string; data?: unknown }> = [];
    const speak = vi.fn((_request: Parameters<SpeechOutputAdapter['speak']>[0], callbacks: Parameters<SpeechOutputAdapter['speak']>[1]) => {
      callbacks.onStart();
      callbacks.onPulse({ speaking: true, energy: 0.8, brightness: 0.6, emphasis: 0.7 });
      callbacks.onEnd();
    });
    const fetcher = vi.fn(async () => new Response(JSON.stringify({
      choices: [{ message: { content: '太棒啦，我们再试一次！' } }],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    const session = new TextVoiceSession({
      endpoint: 'https://example.test/v1/chat/completions',
      apiKey: 'secret',
      model: 'deepseek-chat',
      fetcher,
      speaker: { speak, cancel: vi.fn() },
    });
    session.subscribe((event) => events.push(event));

    await session.connect();
    session.send({ type: 'text', text: '我会说 apple 了' });
    await vi.waitFor(() => expect(speak).toHaveBeenCalled());

    expect(fetcher).toHaveBeenCalledWith('https://example.test/v1/chat/completions', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ Authorization: 'Bearer secret' }),
    }));
    const request = JSON.parse(String(fetcher.mock.calls[0][1]?.body));
    expect(request.model).toBe('deepseek-chat');
    expect(request.messages.at(-1)).toEqual({ role: 'user', content: '我会说 apple 了' });
    expect(speak).toHaveBeenCalledWith({ text: '太棒啦，我们再试一次！' }, expect.any(Object));
    expect(events).toEqual(expect.arrayContaining([
      { type: 'transcript', data: '太棒啦，我们再试一次！' },
      { type: 'voice-features', data: { speaking: true, energy: 0.8, brightness: 0.6, emphasis: 0.7 } },
      { type: 'status', data: 'turn-complete' },
    ]));
  });

  it('surfaces provider errors without invoking TTS', async () => {
    const events: Array<{ type: string; data?: unknown }> = [];
    const speaker = { speak: vi.fn(), cancel: vi.fn() };
    const session = new TextVoiceSession({
      endpoint: 'https://example.test/chat', apiKey: '', model: 'model', speaker,
      fetcher: async () => new Response('denied', { status: 401 }),
    });
    session.subscribe((event) => events.push(event));

    await session.connect();
    session.send({ type: 'text', text: 'hello' });
    await vi.waitFor(() => expect(events.some((event) => event.type === 'error')).toBe(true));

    expect(speaker.speak).not.toHaveBeenCalled();
  });

  it('emits a compact embodied performance turn while only speaking the child-facing line', async () => {
    const events: Array<{ type: string; data?: unknown }> = [];
    const speaker = { speak: vi.fn(), cancel: vi.fn() };
    const content = JSON.stringify({
      speech: 'Look! An apple. Apple!',
      performance: { dramatic_goal: 'invite', speech_act: 'teach', teaching_goal: 'repeat', concept: 'apple', expected_response: 'repeat', intensity: 2 },
    });
    const session = new TextVoiceSession({
      endpoint: 'https://example.test/chat', apiKey: '', model: 'model', speaker,
      fetcher: async () => new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status: 200 }),
    });
    session.subscribe((event) => events.push(event));

    await session.connect();
    session.send({ type: 'text', text: '教我 apple' });
    await vi.waitFor(() => expect(speaker.speak).toHaveBeenCalled());

    expect(speaker.speak).toHaveBeenCalledWith({ text: 'Look! An apple. Apple!' }, expect.any(Object));
    expect(events.find((event) => event.type === 'tool-call')?.data).toEqual({
      name: 'perform_turn',
      args: { dramatic_goal: 'invite', speech_act: 'teach', teaching_goal: 'repeat', concept: 'apple', expected_response: 'repeat', intensity: 2 },
    });
  });
});
