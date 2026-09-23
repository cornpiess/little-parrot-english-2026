/** Shared motion rules for the home character switcher.
 *
 * Keeping these values in one place makes the home gesture easy to tune without
 * changing the visual components themselves.
 */
export const HOME_SWIPE_ANIMATION = {
  cardWidth: 195,
  gap: 16,
  directionLockDistance: 8,
  switchDistanceRatio: 0.12,
  flingVelocity: 0.32,
  edgeOverscroll: 42,
  edgeResistance: 0.22,
  spring: { type: 'spring' as const, stiffness: 280, damping: 30, mass: 0.82 },
};

export function dampOverscroll(value: number, min: number, max: number) {
  if (value < min) return min - (min - value) * HOME_SWIPE_ANIMATION.edgeResistance;
  if (value > max) return max + (value - max) * HOME_SWIPE_ANIMATION.edgeResistance;
  return value;
}

/** Resolve one deliberate card step from the gesture, independent of frame rate. */
export function resolveSwipeIndex({
  startIndex,
  displacement,
  velocity,
  maxIndex,
  step,
}: {
  startIndex: number;
  displacement: number;
  velocity: number;
  maxIndex: number;
  step: number;
}) {
  const movedEnough = Math.abs(displacement) >= step * HOME_SWIPE_ANIMATION.switchDistanceRatio;
  const flung = Math.abs(velocity) >= HOME_SWIPE_ANIMATION.flingVelocity;
  if (!movedEnough && !flung) return Math.max(0, Math.min(maxIndex, Math.round(startIndex)));

  // Pointer velocity is px/ms: negative means left, which advances the row.
  const direction = displacement < 0 || (Math.abs(displacement) < 1 && velocity < 0) ? 1 : -1;
  return Math.max(0, Math.min(maxIndex, Math.round(startIndex) + direction));
}
