import { useMemo } from 'react';
import type { CharacterPerformanceFrame } from '../../features/character-performance/types';
import Mark46Rig from './Mark46Rig';
import {
  IRON_MAN_ACTION_SPECS,
  type IronManAction,
  isIronManAction,
} from './ironManActions';
import { adaptPerformanceToIronMan } from './ironManPerformance';

export interface IronManCharacterProps {
  action?: IronManAction;
  size?: number;
  /** Keep the gallery's readable action glyphs by default; adventures opt out. */
  readableCues?: boolean;
  /** Optional continuous frame used by the future live/adventure director. */
  frame?: CharacterPerformanceFrame;
}

export default function IronManCharacter({ action = 'idle', size = 1, readableCues = true, frame }: IronManCharacterProps) {
  const resolvedAction = action === 'flight' ? 'fly' : action;
  const spec = useMemo(
    () => (resolvedAction === 'idle' || !isIronManAction(resolvedAction) ? undefined : IRON_MAN_ACTION_SPECS[resolvedAction]),
    [resolvedAction],
  );
  const visual = useMemo(() => (frame ? adaptPerformanceToIronMan(frame) : undefined), [frame]);
  const stageTransform = frame
    ? `translate3d(${frame.root.x * 180}px, ${-frame.root.elevation * 110 + frame.root.depth * 42}px, 0) scale(${1 - frame.root.depth * 0.12}) rotateY(${frame.root.heading * 18}deg)`
    : undefined;

  return (
    <div
      className="iron-man-character"
      data-iron-man-character="mark-46"
      data-action={resolvedAction}
      data-performance-presence={frame?.presence}
      style={{
        width: 300 * size,
        height: 620 * size,
        transform: stageTransform,
        transformOrigin: 'center bottom',
        overflow: 'visible',
        willChange: frame ? 'transform' : undefined,
      }}
    >
      <div style={{ transform: `scale(${size})`, transformOrigin: 'top left', width: 300, height: 620, overflow: 'visible' }}>
        <Mark46Rig action={resolvedAction} spec={spec} visual={visual} readableCues={readableCues} />
      </div>
    </div>
  );
}
