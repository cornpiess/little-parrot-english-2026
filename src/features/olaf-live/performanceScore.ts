import type { PerformancePhrasing } from './rig';

export type PerformanceBeat = 'notice' | 'appraise' | 'prepare' | 'act' | 'react' | 'settle';

export interface PerformanceScore extends PerformancePhrasing {
  beat: PerformanceBeat;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smootherstep = (value: number) => {
  const progress = clamp01(value);
  return clamp01(progress ** 3 * (progress * (progress * 6 - 15) + 10));
};
const window = (progress: number, start: number, end: number, feather: number) => (
  clamp01(smootherstep((progress - start) / feather) * (1 - smootherstep((progress - (end - feather)) / feather)))
);

export function samplePerformanceScore(rawProgress: number): PerformanceScore {
  const progress = clamp01(rawProgress);
  const beat: PerformanceBeat = progress < 0.12 ? 'notice'
    : progress < 0.24 ? 'appraise'
      : progress < 0.38 ? 'prepare'
        : progress < 0.62 ? 'act'
          : progress < 0.78 ? 'react' : 'settle';
  return {
    beat,
    anticipation: window(progress, 0.16, 0.43, 0.13),
    action: window(progress, 0.3, 0.72, 0.18),
    reaction: window(progress, 0.57, 0.86, 0.13),
    settle: smootherstep((progress - 0.74) / 0.22),
    // A held pose still eases in and out; a narrow window reads as a hard edit.
    hold: window(progress, 0.43, 0.66, 0.12),
  };
}
