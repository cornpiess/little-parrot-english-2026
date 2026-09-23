import { describe, expect, it } from 'vitest';
import { PERFORMANCE_MOTIFS } from './performanceImproviser';
import {
  CHARACTER_LINES,
  buildAzureSsml,
  chooseFreshCharacterLine,
  deliveryForMotif,
  mapAzureViseme,
} from './characterSpeech';

describe('character speech performance', () => {
  it('gives every demonstration state five short lines with substantial English coverage', () => {
    expect(PERFORMANCE_MOTIFS).toHaveLength(30);
    expect(Object.keys(CHARACTER_LINES)).toHaveLength(30);
    for (const motif of PERFORMANCE_MOTIFS) {
      expect(CHARACTER_LINES[motif.id], motif.label).toHaveLength(5);
      expect(CHARACTER_LINES[motif.id].every((line) => line.length > 2 && line.length <= 36)).toBe(true);
      expect(CHARACTER_LINES[motif.id].filter((line) => /[A-Za-z]{3}/.test(line)).length).toBeGreaterThanOrEqual(2);
    }
  });

  it('avoids recently spoken lines before wrapping around', () => {
    const lines = CHARACTER_LINES['joyful-clap'];
    expect(chooseFreshCharacterLine(lines, 0, [lines[0], lines[1]])).toEqual({ text: lines[2], index: 2 });
    expect(chooseFreshCharacterLine(lines, 4, [lines[4]])).toEqual({ text: lines[0], index: 0 });
  });

  it('uses contrasting deliveries for celebration, crying and secrets', () => {
    const delivery = (id: string) => deliveryForMotif(PERFORMANCE_MOTIFS.find((motif) => motif.id === id)!);
    expect(delivery('joyful-clap').style).toBe('cheerful');
    expect(delivery('sad-cry').style).toBe('sad');
    expect(delivery('share-secret').rate).toBeLessThan(delivery('excited-tell').rate);
    expect(delivery('share-secret').volume).toBeLessThan(delivery('excited-tell').volume);
  });

  it('escapes text and includes the selected acting style in Azure SSML', () => {
    const ssml = buildAzureSsml({
      text: '你和我 <一起> & play!',
      delivery: { style: 'cheerful', styleDegree: 1.3, rate: 8, pitch: 5, volume: 90 },
    });
    expect(ssml).toContain('zh-CN-YunxiNeural');
    expect(ssml).toContain('role="Boy"');
    expect(ssml).toContain('style="cheerful"');
    expect(ssml).toContain('你和我 &lt;一起&gt; &amp; play!');
  });

  it('maps closed, open, wide and rounded visemes to distinct mouth shapes', () => {
    expect(mapAzureViseme(0).jawOpen).toBe(0);
    expect(mapAzureViseme(21).jawOpen).toBeLessThan(0.15);
    expect(mapAzureViseme(2).jawOpen).toBeGreaterThan(0.75);
    expect(mapAzureViseme(6).mouthWide).toBeGreaterThan(0.7);
    expect(mapAzureViseme(7).mouthPucker).toBeGreaterThan(0.75);
  });
});
