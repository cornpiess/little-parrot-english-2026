import { describe, expect, it } from 'vitest';
import { faceToPerceptionEvent } from './localPerception';

describe('local perception', () => {
  it('normalises a face target around the centre of the camera frame', () => {
    const event = faceToPerceptionEvent({ x: 0.75, y: 0.2, confidence: 0.9, timestamp: 10 });
    expect(event).toMatchObject({ type: 'face', x: 0.5, y: 0.6, confidence: 0.9, timestamp: 10 });
  });
});
