import { describe, expect, it } from 'vitest';
import { EMBODIED_DEMO_SCENES } from './embodiedSceneCatalog';

describe('embodied scene catalog', () => {
  it('keeps the lab scenes data-only and addressable by unique labels', () => {
    expect(EMBODIED_DEMO_SCENES).toHaveLength(12);
    expect(new Set(EMBODIED_DEMO_SCENES.map(({ label }) => label)).size).toBe(12);
    expect(EMBODIED_DEMO_SCENES.every(({ intent }) => intent.concept && intent.objectAction)).toBe(true);
  });
});
