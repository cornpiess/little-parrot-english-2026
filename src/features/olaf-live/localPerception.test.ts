import { describe, expect, it } from 'vitest';
import { eyeMidpointFromLandmarks, faceToPerceptionEvent } from './localPerception';

describe('local perception', () => {
  it('normalises a face target around the centre of the camera frame', () => {
    const event = faceToPerceptionEvent({ x: 0.75, y: 0.2, confidence: 0.9, timestamp: 10 });
    expect(event).toMatchObject({ type: 'face', x: 0.5, y: 0.6, confidence: 0.9, timestamp: 10 });
  });

  it('targets the midpoint of the child eye line and falls back to the nose', () => {
    const landmarks = Array.from({ length: 264 }, () => ({ x: 0, y: 0 }));
    landmarks[1] = { x: 0.4, y: 0.45 };
    landmarks[33] = { x: 0.3, y: 0.35 };
    landmarks[263] = { x: 0.7, y: 0.37 };

    expect(eyeMidpointFromLandmarks(landmarks)).toEqual({ x: 0.5, y: 0.36 });
    expect(eyeMidpointFromLandmarks(landmarks.slice(0, 2))).toEqual({ x: 0.4, y: 0.45 });
  });
});
