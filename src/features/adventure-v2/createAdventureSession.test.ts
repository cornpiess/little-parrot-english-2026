import { describe, expect, it, vi } from 'vitest';
import { createAdventureSession } from './createAdventureSession';
import IRON_MAN_FIRST_LIGHT from './ironManFirstLightEpisode';

describe('adventure-v2 session', () => {
  it('keeps the public interface small and starts with an authored scene', () => {
    const speak = vi.fn();
    const session = createAdventureSession(IRON_MAN_FIRST_LIGHT, { now: () => 0, speak });
    expect(session.frame().started).toBe(false);
    expect(session.frame().scene.id).toBe('signal-lab');

    session.begin();
    const frame = session.frame(1);
    expect(frame.started).toBe(true);
    expect(frame.scene.title).toBe('斯塔克夜间实验室');
    expect(frame.actor.action).toBe('greeting');
    expect(speak).toHaveBeenCalledWith(expect.stringContaining('黑云星'), expect.objectContaining({ sceneId: 'signal-lab' }));
  });

  it('progresses through the 10 canonical drama scenes', () => {
    const session = createAdventureSession(IRON_MAN_FIRST_LIGHT, { now: () => 0 });
    session.begin();
    expect(session.frame(0).scene.id).toBe('signal-lab');
    expect(session.frame(0).scene.total).toBe(10);

    // After Scene 1 settles, advances to Scene 2 (armor-platform)
    session.frame(18_000);
    expect(session.frame(18_000).scene.id).toBe('armor-platform');

    // After Scene 2 settles, advances to Scene 3 (launch-tunnel)
    session.frame(36_000);
    expect(session.frame(36_000).scene.id).toBe('launch-tunnel');

    // After Scene 3 settles, advances to Scene 4 (deep-space-flight)
    session.frame(54_000);
    expect(session.frame(54_000).scene.id).toBe('deep-space-flight');
  });

  it('recognizes educational learning words (STAR & LIGHT)', () => {
    const session = createAdventureSession(IRON_MAN_FIRST_LIGHT, { now: () => 0 });
    session.control({ type: 'goto-scene', index: 3 }); // deep-space-flight
    const flight = session.frame(0);
    expect(flight.learningCue).toBe('STAR');

    // Saying STAR boosts progress
    session.send({ kind: 'voice', text: 'star', final: true, atMs: 10 });
    expect(session.frame(10).scene.progress).toBeGreaterThan(0);

    // Jump to Scene 9 (lighthouse-veins)
    session.control({ type: 'goto-scene', index: 8 });
    const veins = session.frame(20);
    expect(veins.learningCue).toBe('LIGHT');
  });

  it('does not let premature elapsed time skip a narrated performance scene', () => {
    const speak = vi.fn();
    const session = createAdventureSession(IRON_MAN_FIRST_LIGHT, { now: () => 0, speak });
    session.begin();

    // The line is still pending until narration-ended
    expect(session.frame(20_000).scene.id).toBe('signal-lab');
    session.control({ type: 'narration-started' });
    session.control({ type: 'narration-ended' });
    expect(session.frame(20_500).scene.id).toBe('signal-lab');
    expect(session.frame(21_000).scene.id).toBe('armor-platform');
  });

  it('embodies expressive multi-beat acting instead of a static action', () => {
    const session = createAdventureSession(IRON_MAN_FIRST_LIGHT, { now: () => 0 });
    session.begin();

    // Scene 1: starts with greeting, moves to speaking, settles to thinking
    session.control({ type: 'narration-started' });
    expect(session.frame(100).actor.action).toBe('greeting');
    expect(session.frame(4_500).actor.action).toBe('speaking');

    // Scene 4 (flight): banks with fly action
    session.control({ type: 'goto-scene', index: 3 });
    expect(session.frame(50).actor.action).toBe('fly');

    // Scene 5 (storm): speaking then blast action
    session.control({ type: 'goto-scene', index: 4 });
    expect(session.frame(50).actor.action).toBe('speaking');
    expect(session.frame(5_000).actor.action).toBe('repulsor-blast');

    // Scene 10 (finale): cheer celebration
    session.control({ type: 'goto-scene', index: 9 });
    expect(session.frame(50).actor.action).toBe('cheer');
  });
});
