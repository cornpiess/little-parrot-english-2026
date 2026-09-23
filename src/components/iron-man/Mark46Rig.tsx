import { motion, type TargetAndTransition } from 'motion/react';
import { useId, type ReactNode } from 'react';
import type {
  IronManAction,
  IronManActionSpec,
  IronManEffect,
  IronManRigPart,
} from './ironManActions';
import type { IronManVisualFrame } from './ironManPerformance';

interface Mark46RigProps {
  action: IronManAction;
  spec?: IronManActionSpec;
  visual?: IronManVisualFrame;
  /** Adventure stages can hide the abstract cue glyphs while galleries keep them. */
  readableCues?: boolean;
}

type Point = readonly [number, number];
const VIEW_CENTER: Point = [150, 310];

const ORIGIN: Record<IronManRigPart, Point> = {
  root: [150, 224],
  torso: [150, 224],
  head: [150, 100],
  armLeft: [88, 116],
  forearmLeft: [62, 204],
  fistLeft: [45, 282],
  armRight: [212, 116],
  forearmRight: [238, 204],
  fistRight: [255, 282],
  legLeft: [132, 240],
  calfLeft: [115, 350],
  bootLeft: [100, 520],
  legRight: [168, 240],
  calfRight: [185, 350],
  bootRight: [200, 520],
};

function AnimatedPart({
  part,
  animation,
  children,
}: {
  part: IronManRigPart;
  animation?: TargetAndTransition;
  children: ReactNode;
}) {
  const [x, y] = ORIGIN[part];
  return (
    <motion.g
      data-part={part}
      animate={animation}
      transformTemplate={(_, generatedTransform) => `translate(${x - VIEW_CENTER[0]}px, ${y - VIEW_CENTER[1]}px) ${generatedTransform} translate(${VIEW_CENTER[0] - x}px, ${VIEW_CENTER[1] - y}px)`}
      style={{ transformBox: 'view-box', transformOrigin: '0px 0px' }}
    >
      {children}
    </motion.g>
  );
}

function EffectGroup({
  id,
  children,
  animate,
  transition,
  origin = VIEW_CENTER,
}: {
  id: IronManEffect;
  children: ReactNode;
  animate?: TargetAndTransition;
  transition?: TargetAndTransition['transition'];
  origin?: Point;
}) {
  const [x, y] = origin;
  const [centerX, centerY] = VIEW_CENTER;
  return (
    <motion.g
      data-effect={id}
      animate={animate}
      transition={transition}
      transformTemplate={(_, generatedTransform) => `translate(${x - centerX}px, ${y - centerY}px) ${generatedTransform} translate(${centerX - x}px, ${centerY - y}px)`}
      style={{ transformBox: 'view-box' }}
    >
      {children}
    </motion.g>
  );
}

function BootThruster({ side, enabled, filterPrefix }: { side: 'left' | 'right'; enabled: boolean; filterPrefix: string }) {
  if (!enabled) return null;
  const x = side === 'left' ? 99 : 201;
  // Thrusters used by the current public actions are sustained loops. The
  // former boost-punch one-shot was removed because a front-only Mark 46 pose
  // could not make its impact read clearly.
  return (
    <EffectGroup
      id="boot-thrusters"
      animate={{ opacity: [0.5, 1, 0.55], scaleY: [0.75, 1.2, 0.75], y: [0, 7, 0] }}
      transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
      origin={[x, 558]}
    >
      <path
        d={`M${x - 12} 555 Q${x} 570 ${x + 12} 555 L${x + 7} 606 Q${x} 618 ${x - 7} 606Z`}
        fill="#38bdf8"
        opacity=".92"
        filter={`url(#${filterPrefix}-thruster-glow)`}
      />
      <path d={`M${x - 5} 559 Q${x} 571 ${x + 5} 559L${x + 3} 594Q${x} 602 ${x - 3} 594Z`} fill="#fff" opacity=".95" />
    </EffectGroup>
  );
}

function PalmEffect({
  side,
  palmThrusters,
  palmCharge,
  repulsorBeam,
  muzzleFlash,
  filterPrefix,
}: {
  side: 'left' | 'right';
  palmThrusters: boolean;
  palmCharge: boolean;
  repulsorBeam: boolean;
  muzzleFlash: boolean;
  filterPrefix: string;
}) {
  const x = side === 'left' ? 45 : 255;
  if (!palmThrusters && !palmCharge && !(repulsorBeam && side === 'right') && !(muzzleFlash && side === 'right')) return null;

  return (
    <g data-effect-layer="behind-hand">
      {palmThrusters && (
        <EffectGroup
          id="palm-thrusters"
          animate={{ opacity: [0.45, 1, 0.45], scale: [0.8, 1.18, 0.8] }}
          transition={{ duration: 0.65, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
          origin={[x, 304]}
        >
          <circle cx={x} cy="304" r="7" fill="#dffcff" stroke="#38bdf8" strokeWidth="2" filter={`url(#${filterPrefix}-thruster-glow)`} />
          <path d={`M${x - 11} 309L${x} 328L${x + 11} 309`} fill="none" stroke="#38bdf8" strokeWidth="3" opacity=".75" />
        </EffectGroup>
      )}

      {palmCharge && side === 'right' && (
        <EffectGroup
          id="palm-charge"
          animate={{ opacity: [0, 0.45, 1, 0.82], scale: [0.45, 0.72, 1.2, 1] }}
          transition={{ duration: 0.82, times: [0, 0.3, 0.62, 1], ease: 'easeOut' }}
          origin={[x, 296]}
        >
          <circle cx={x} cy="296" r="16" fill="none" stroke="#7dd3fc" strokeWidth="2" strokeDasharray="3 3" />
          <circle cx={x} cy="296" r="9" fill="#fff" opacity=".9" filter={`url(#${filterPrefix}-thruster-glow)`} />
        </EffectGroup>
      )}

      {repulsorBeam && side === 'right' && (
        <EffectGroup
          id="repulsor-beam"
          animate={{ opacity: [0, 0, 1, 0.2, 0], scaleX: [0.2, 0.2, 1, 1.08, 0.4] }}
          transition={{ duration: 1.45, times: [0, 0.32, 0.5, 0.74, 1], ease: 'easeOut' }}
          origin={[255, 294]}
        >
          <path d="M255 294L300 248L282 302L300 333Z" fill="#7dd3fc" opacity=".28" filter={`url(#${filterPrefix}-thruster-glow)`} />
          <path d="M255 294L300 270" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".92" />
          <path d="M255 294L300 270" stroke="#38bdf8" strokeWidth="13" strokeLinecap="round" opacity=".33" />
        </EffectGroup>
      )}

      {muzzleFlash && side === 'right' && (
        <EffectGroup
          id="muzzle-flash"
          animate={{ opacity: [0, 1, 0], scale: [0.3, 1.35, 0.5] }}
          transition={{ duration: 0.28, delay: 0.68, ease: 'easeOut' }}
          origin={[298, 269]}
        >
          <circle cx="298" cy="269" r="12" fill="#fff" opacity=".95" filter={`url(#${filterPrefix}-thruster-glow)`} />
          <path d="M298 248V290M277 269H319" stroke="#bae6fd" strokeWidth="3" strokeLinecap="round" />
        </EffectGroup>
      )}
    </g>
  );
}

function ExpressiveEffects({
  has,
  filterPrefix,
}: {
  has: (effect: IronManEffect) => boolean;
  filterPrefix: string;
}) {
  return (
    <>
      {has('clap-spark') && (
        <EffectGroup
          id="clap-spark"
          animate={{ opacity: [0, 0, 1, 0], scale: [0.35, 0.55, 1, 1.3] }}
          transition={{ duration: 1.15, times: [0, 0.34, 0.48, 1], ease: 'easeOut', repeat: Infinity }}
          origin={[150, 294]}
        >
          <path d="M150 277V264M150 311V324M133 294H120M167 294H180M138 282L129 273M162 282L171 273M138 306L129 315M162 306L171 315" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" filter={`url(#${filterPrefix}-thruster-glow)`} />
        </EffectGroup>
      )}

      {has('clap-contact') && (
        <EffectGroup
          id="clap-contact"
          animate={{ opacity: [0, 0, 1, 0.35, 0], scale: [0.55, 0.7, 1.12, 1, 0.7] }}
          transition={{ duration: 1.15, times: [0, 0.34, 0.48, 0.68, 1], ease: 'easeOut', repeat: Infinity }}
          origin={[150, 294]}
        >
          <ellipse cx="142" cy="294" rx="19" ry="13" fill="#e2e8f0" stroke="#38bdf8" strokeWidth="2" />
          <ellipse cx="158" cy="294" rx="19" ry="13" fill="#e2e8f0" stroke="#38bdf8" strokeWidth="2" />
          <circle cx="150" cy="294" r="5" fill="#fff" filter={`url(#${filterPrefix}-thruster-glow)`} />
        </EffectGroup>
      )}

      {has('hologram-heart') && (
        <EffectGroup
          id="hologram-heart"
          animate={{ opacity: [0, 0.9, 0.72, 0], scale: [0.25, 0.95, 1.12, 1.28], y: [8, -8, -18, -30] }}
          transition={{ duration: 1.8, times: [0, 0.32, 0.68, 1], ease: 'easeOut' }}
          origin={[255, 294]}
        >
          <path d="M255 318C246 307 229 296 229 283c0-9 7-15 15-15 5 0 9 3 11 7 2-4 6-7 11-7 8 0 15 6 15 15 0 13-17 24-26 35Z" fill="#7dd3fc" fillOpacity=".2" stroke="#dffcff" strokeWidth="2.4" filter={`url(#${filterPrefix}-thruster-glow)`} />
          <path d="M255 310C249 303 239 296 239 287c0-4 3-7 7-7 4 0 7 3 9 6 2-3 5-6 9-6 4 0 7 3 7 7 0 9-10 16-16 23Z" fill="#bae6fd" fillOpacity=".55" />
        </EffectGroup>
      )}

      {has('gyro-warning') && (
        <EffectGroup
          id="gyro-warning"
          animate={{ opacity: [0.22, 0.9, 0.25], rotate: [0, 7, -7, 0] }}
          transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
          origin={[150, 284]}
        >
          <circle cx="150" cy="284" r="30" fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="5 5" />
          <path d="M150 263L162 286H138Z" fill="#fbbf24" fillOpacity=".18" stroke="#fde68a" strokeWidth="2" />
          <path d="M150 271V280M150 284V286" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </EffectGroup>
      )}
    </>
  );
}

/**
 * A sustained, non-verbal cue for preschool viewers. The pose carries the
 * acting; this layer makes the meaning readable before a child knows the label.
 */
function KidReadableCue({ action, filterPrefix }: { action: IronManAction; filterPrefix: string }) {
  const cue = action === 'flight' ? 'fly' : action;
  if (cue === 'idle') return null;

  const stroke = '#dffcff';
  const accent = '#fde68a';
  let art: ReactNode;
  switch (cue) {
    case 'listening': art = <><path d="M215 50Q240 68 215 86M224 42Q260 68 224 94"/><circle cx="207" cy="68" r="5" fill={accent}/></>; break;
    case 'thinking': art = <><circle cx="150" cy="39" r="4" fill={accent}/><circle cx="130" cy="48" r="3" fill={stroke}/><circle cx="170" cy="48" r="3" fill={stroke}/><path d="M132 34Q150 17 168 34"/></>; break;
    case 'speaking': art = <><path d="M103 75H76M197 75H224M96 88L75 98M204 88L225 98"/><circle cx="150" cy="92" r="8" fill="none"/></>; break;
    case 'sleeping': art = <><path d="M205 55H230L205 79H230M226 31H244L226 48H244"/><path d="M120 96Q150 105 180 96" opacity=".55"/></>; break;
    case 'greeting': art = <><path d="M235 82Q259 58 276 76M244 94Q270 77 284 97"/><circle cx="229" cy="100" r="7" fill={accent}/></>; break;
    case 'clap': art = <><path d="M150 250V227M128 258L111 242M172 258L189 242M124 280H101M176 280H199"/><circle cx="150" cy="276" r="14" fill="none"/></>; break;
    case 'wave': art = <><path d="M231 52Q260 25 283 51M239 67Q261 48 278 67"/><path d="M271 31L281 28L278 39"/></>; break;
    case 'dance': art = <><path d="M61 188V148L84 142V181M239 192V154L262 148V185"/><circle cx="55" cy="190" r="8" fill={accent}/><circle cx="233" cy="194" r="8" fill={accent}/></>; break;
    case 'bounce': art = <><path d="M98 573L88 588L78 573M202 573L212 588L222 573"/><path d="M150 530V575M140 540L150 530L160 540"/></>; break;
    case 'nod': art = <><path d="M104 49V96M94 85L104 96L114 85M196 96V49M186 60L196 49L206 60"/></>; break;
    case 'hearts': art = <path d="M150 236C127 210 91 227 101 254C108 274 132 286 150 300C168 286 192 274 199 254C209 227 173 210 150 236Z" fill="#7dd3fc" fillOpacity=".2"/>; break;
    case 'excited': art = <><path d="M66 86L72 68L78 86L96 92L78 98L72 116L66 98L48 92ZM234 86L228 68L222 86L204 92L222 98L228 116L234 98L252 92Z" fill={accent} fillOpacity=".42"/></>; break;
    case 'surprised': art = <><path d="M150 25L171 61H129Z" fill="#fbbf24" fillOpacity=".2"/><path d="M150 36V47M150 53V55"/></>; break;
    case 'happy': art = <><path d="M105 232Q150 274 195 232"/><path d="M112 223L103 232L114 239M188 223L197 232L186 239"/></>; break;
    case 'fly': art = <><path d="M42 285H9M50 320H4M258 285H291M250 320H296"/><path d="M99 579L99 610M201 579L201 610"/></>; break;
    case 'cheer': art = <><path d="M150 24L158 42L178 44L163 57L167 77L150 67L133 77L137 57L122 44L142 42Z" fill={accent} fillOpacity=".35"/></>; break;
    case 'shake': art = <><path d="M98 66H62M62 66L75 54M62 66L75 78M202 66H238M238 66L225 54M238 66L225 78"/></>; break;
    case 'dizzy': art = <><ellipse cx="150" cy="66" rx="62" ry="28"/><path d="M91 66L79 59M209 66L221 59"/><circle cx="115" cy="43" r="5" fill={accent}/><circle cx="185" cy="89" r="5" fill={accent}/></>; break;
    case 'shy': art = <><circle cx="124" cy="88" r="10" fill="#fb7185" fillOpacity=".45" stroke="none"/><circle cx="176" cy="88" r="10" fill="#fb7185" fillOpacity=".45" stroke="none"/><path d="M135 101Q150 108 165 101"/></>; break;
    case 'peek': art = <><path d="M68 38H96M68 38V66M232 38H204M232 38V66M68 104H96M68 104V76M232 104H204M232 104V76"/><circle cx="150" cy="71" r="21" fill="none"/></>; break;
    case 'repulsor-blast': art = <><circle cx="275" cy="270" r="18" fill="none"/><circle cx="275" cy="270" r="8" fill={stroke}/><path d="M247 270H222M275 242V222M275 298V318"/></>; break;
    case 'unibeam': art = <><circle cx="150" cy="132" r="30" fill="none"/><path d="M150 102V82M120 132H100M180 132H200"/></>; break;
    default: art = <circle cx="150" cy="70" r="16" fill="none"/>;
  }

  return (
    <motion.g
      data-iron-cue={cue}
      fill="none"
      stroke={stroke}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      filter={`url(#${filterPrefix}-thruster-glow)`}
      animate={{ opacity: [.48, 1, .58], scale: [.94, 1.04, .96] }}
      transition={{ duration: 1.15, repeat: Infinity, ease: 'easeInOut' }}
      style={{ transformBox: 'view-box', transformOrigin: '150px 150px' }}
    >{art}</motion.g>
  );
}

function Mark46Defs({ prefix }: { prefix: string }) {
  return (
    <defs>
      <linearGradient id={`${prefix}-red-bright`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ff4d4d" />
        <stop offset="30%" stopColor="#dc2626" />
        <stop offset="70%" stopColor="#991b1b" />
        <stop offset="100%" stopColor="#4a0808" />
      </linearGradient>
      <linearGradient id={`${prefix}-red-dark`} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#7f1d1d" />
        <stop offset="100%" stopColor="#2d0505" />
      </linearGradient>
      <linearGradient id={`${prefix}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="30%" stopColor="#fde047" />
        <stop offset="70%" stopColor="#d97706" />
        <stop offset="100%" stopColor="#78350f" />
      </linearGradient>
      <linearGradient id={`${prefix}-silver`} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="50%" stopColor="#e2e8f0" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>
      <radialGradient id={`${prefix}-arc-glow`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="30%" stopColor="#bae6fd" />
        <stop offset="70%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0284c7" />
      </radialGradient>
      <filter id={`${prefix}-glow-filter`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3.5" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <filter id={`${prefix}-shadow-filter`} x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#000000" floodOpacity="0.65" />
      </filter>
      <filter id={`${prefix}-thruster-glow`} x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
  );
}

export default function Mark46Rig({ action, spec, visual, readableCues = true }: Mark46RigProps) {
  const rawId = useId().replace(/:/g, '');
  const resolvedSpec = spec;
  const signal = (name: keyof IronManVisualFrame['signals']) => visual?.signals[name] ?? 0;
  const has = (effect: IronManEffect) => {
    if (resolvedSpec?.effects.includes(effect)) return true;
    if (effect === 'eye-pulse') return signal('eyePulse') > 0.22;
    if (effect === 'reactor-pulse') return signal('reactorPulse') > 0.22;
    if (effect === 'palm-thrusters') return signal('palmThrust') > 0.28;
    if (effect === 'boot-thrusters') return signal('bootThrust') > 0.28;
    if (effect === 'hud-scan') return signal('hudScan') > 0.28;
    if (effect === 'gyro-warning') return signal('stabilityWarning') > 0.55;
    return false;
  };
  const parts = visual?.parts ?? resolvedSpec?.parts ?? {};
  const uid = `mk46-${rawId}`;

  return (
    <svg
      viewBox="0 0 300 620"
      width="300"
      height="620"
      role="img"
      aria-label={`Iron Man Mark 46 ${action}`}
      data-iron-man-action={action}
      style={{ overflow: 'visible' }}
    >
      <Mark46Defs prefix={uid} />

      <motion.ellipse
        data-effect="ground-shadow"
        cx="150"
        cy="578"
        rx="80"
        ry="9"
        fill="rgba(0,0,0,0.7)"
        filter={`url(#${uid}-shadow-filter)`}
        animate={action === 'fly' || action === 'bounce' || action === 'excited' || action === 'cheer'
          ? { scaleX: [0.9, 0.48, 0.6, 0.9], opacity: [0.4, 0.18, 0.28, 0.4] }
          : { scaleX: 1, opacity: 0.42 }}
        transition={action === 'fly' || action === 'bounce' || action === 'excited' || action === 'cheer'
          ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0.35, ease: 'easeOut' }}
        style={{ transformBox: 'view-box', transformOrigin: '150px 578px' }}
      />

      {has('speed-lines') && (
        <EffectGroup
          id="speed-lines"
          animate={{ x: [-10, 12], opacity: [0.12, 0.55, 0.12] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path d="M25 175H72M214 194H278M18 246H64M224 270H286M34 382H80M214 402H276" stroke="#bae6fd" strokeWidth="3" strokeLinecap="round" />
        </EffectGroup>
      )}

      <ExpressiveEffects has={has} filterPrefix={uid} />

      <g id={`${uid}-ultimate`} transform="translate(0, 10)">
        <AnimatedPart part="root" animation={parts.root}>
          <AnimatedPart part="legLeft" animation={parts.legLeft}>
            <g id="leg-left" filter={`url(#${uid}-shadow-filter)`}>
              <g id="thigh-left">
                <path d="M 126 238 L 102 342 L 128 350 L 148 244 Z" fill={`url(#${uid}-red-bright)`} stroke="#4a0808" strokeWidth="1.5" />
                <path d="M 112 246 L 104 326 L 115 338 L 126 326 L 134 250 Z" fill={`url(#${uid}-gold)`} stroke="#78350f" strokeWidth="1.3" />
              </g>
              <AnimatedPart part="calfLeft" animation={parts.calfLeft}>
                <g id="calf-left">
                  <path d="M 104 342 L 100 358 L 126 362 L 128 348 Z" fill={`url(#${uid}-silver)`} stroke="#1e293b" />
                  <polygon points="104,342 115,338 126,342 115,362" fill={`url(#${uid}-red-bright)`} stroke="#4a0808" strokeWidth="1.3" />
                  <path d="M 100 358 L 88 495 L 122 500 L 126 362 Z" fill={`url(#${uid}-red-bright)`} stroke="#4a0808" strokeWidth="1.5" />
                  <AnimatedPart part="bootLeft" animation={parts.bootLeft}>
                    <g id="boot-left">
                      <path d="M 88 495 L 78 542 L 88 556 L 122 556 L 122 500 Z" fill={`url(#${uid}-red-bright)`} stroke="#4a0808" strokeWidth="1.5" />
                      <path d="M 78 542 L 72 558 L 122 558 L 122 556 Z" fill={`url(#${uid}-gold)`} stroke="#78350f" />
                      <line x1="74" y1="558" x2="120" y2="558" stroke="#38bdf8" strokeWidth="1.5" filter={`url(#${uid}-glow-filter)`} />
                      <BootThruster side="left" enabled={has('boot-thrusters')} filterPrefix={uid} />
                    </g>
                  </AnimatedPart>
                </g>
              </AnimatedPart>
            </g>
          </AnimatedPart>

          <AnimatedPart part="legRight" animation={parts.legRight}>
            <g id="leg-right" filter={`url(#${uid}-shadow-filter)`}>
              <g id="thigh-right">
                <path d="M 174 238 L 198 342 L 172 350 L 152 244 Z" fill={`url(#${uid}-red-bright)`} stroke="#4a0808" strokeWidth="1.5" />
                <path d="M 188 246 L 196 326 L 185 338 L 174 326 L 166 250 Z" fill={`url(#${uid}-gold)`} stroke="#78350f" strokeWidth="1.3" />
              </g>
              <AnimatedPart part="calfRight" animation={parts.calfRight}>
                <g id="calf-right">
                  <path d="M 196 342 L 200 358 L 174 362 L 172 348 Z" fill={`url(#${uid}-silver)`} stroke="#1e293b" />
                  <polygon points="196,342 185,338 174,342 185,362" fill={`url(#${uid}-red-bright)`} stroke="#4a0808" strokeWidth="1.3" />
                  <path d="M 200 358 L 212 495 L 178 500 L 174 362 Z" fill={`url(#${uid}-red-bright)`} stroke="#4a0808" strokeWidth="1.5" />
                  <AnimatedPart part="bootRight" animation={parts.bootRight}>
                    <g id="boot-right">
                      <path d="M 212 495 L 222 542 L 212 556 L 178 556 L 178 500 Z" fill={`url(#${uid}-red-bright)`} stroke="#4a0808" strokeWidth="1.5" />
                      <path d="M 222 542 L 228 558 L 178 558 L 178 556 Z" fill={`url(#${uid}-gold)`} stroke="#78350f" />
                      <line x1="226" y1="558" x2="180" y2="558" stroke="#38bdf8" strokeWidth="1.5" filter={`url(#${uid}-glow-filter)`} />
                      <BootThruster side="right" enabled={has('boot-thrusters')} filterPrefix={uid} />
                    </g>
                  </AnimatedPart>
                </g>
              </AnimatedPart>
            </g>
          </AnimatedPart>

          <g id="pelvis">
            <path d="M 120 224 L 180 224 L 168 248 L 150 256 L 132 248 Z" fill={`url(#${uid}-red-bright)`} stroke="#4a0808" strokeWidth="1.5" />
            <path d="M 132 224 L 168 224 L 160 240 L 150 244 L 140 240 Z" fill={`url(#${uid}-gold)`} stroke="#78350f" />
          </g>

          <AnimatedPart part="torso" animation={parts.torso}>
            <g id="torso" filter={`url(#${uid}-shadow-filter)`}>
              <path d="M 88 112 L 212 112 L 190 228 L 110 228 Z" fill={`url(#${uid}-red-bright)`} stroke="#4a0808" strokeWidth="2" />
              <path d="M 114 162 L 186 162 L 176 182 L 150 194 L 124 182 Z" fill={`url(#${uid}-red-bright)`} stroke="#7f1d1d" strokeWidth="1.4" />
              <path d="M 116 182 L 184 182 L 173 200 L 150 210 L 127 200 Z" fill={`url(#${uid}-red-bright)`} stroke="#7f1d1d" strokeWidth="1.4" />
              <path d="M 120 200 L 180 200 L 170 216 L 150 224 L 130 216 Z" fill={`url(#${uid}-red-bright)`} stroke="#7f1d1d" strokeWidth="1.4" />
              <path d="M 142 162 L 158 162 L 150 224 Z" fill={`url(#${uid}-gold)`} opacity="0.25" />
              <path d="M 90 112 L 150 156 L 210 112 L 190 148 L 150 168 L 110 148 Z" fill={`url(#${uid}-red-dark)`} stroke="#4a0808" strokeWidth="1.6" />
              <g stroke="#e2e8f0" strokeWidth="2.2" strokeLinecap="round">
                <line x1="112" y1="133" x2="124" y2="141" /><line x1="109" y1="141" x2="121" y2="149" />
                <line x1="188" y1="133" x2="176" y2="141" /><line x1="191" y1="141" x2="179" y2="149" />
              </g>

              <motion.g
                data-effect="reactor-charge"
                transform="translate(150, 132)"
                animate={visual
                  ? { opacity: signal('reactorGlow') }
                  : has('reactor-charge')
                    ? { opacity: [0.45, 0.95, 1, 0.72] }
                    : { opacity: 1 }}
                transition={visual
                  ? { duration: 0 }
                  : has('reactor-charge')
                    ? { duration: 1.8, times: [0, 0.3, 0.58, 1], ease: 'easeOut' }
                    : { duration: 0 }}
              >
                <circle cx="0" cy="0" r="16" fill="#0f172a" stroke={`url(#${uid}-gold)`} strokeWidth="1.8" />
                <circle cx="0" cy="0" r="12.5" fill="none" stroke="#0284c7" strokeWidth="1.2" strokeDasharray="3.5 2" />
                <line x1="-11" y1="0" x2="11" y2="0" stroke="#38bdf8" strokeWidth="0.7" opacity="0.8" />
                <line x1="0" y1="-11" x2="0" y2="11" stroke="#38bdf8" strokeWidth="0.7" opacity="0.8" />
                <circle cx="0" cy="0" r="8.5" fill={`url(#${uid}-arc-glow)`} filter={`url(#${uid}-glow-filter)`} />
                <polygon points="0,-4.5 4,2.5 -4,2.5" fill="#ffffff" opacity="0.95" />
                <circle cx="0" cy="0" r="2.2" fill="#ffffff" />
              </motion.g>

              {has('reactor-pulse') && (
                <EffectGroup
                  id="reactor-pulse"
                  animate={{ opacity: [0.34, 0.9, 0.34], scale: [0.82, 1.14, 0.82] }}
                  transition={{ duration: action === 'sleeping' ? 3.8 : 0.9, repeat: Infinity, ease: 'easeInOut' }}
                  origin={[150, 132]}
                >
                  <circle cx="150" cy="132" r="18" fill="none" stroke="#7dd3fc" strokeWidth="1.5" opacity=".65" filter={`url(#${uid}-thruster-glow)`} />
                </EffectGroup>
              )}

              {has('standby-pulse') && (
                <EffectGroup
                  id="standby-pulse"
                  animate={{ opacity: [0.12, 0.34, 0.12], scale: [0.9, 1.02, 0.9] }}
                  transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
                  origin={[150, 132]}
                >
                  <circle cx="150" cy="132" r="17" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="2 5" />
                </EffectGroup>
              )}

              {has('energy-rings') && (
                <EffectGroup
                  id="energy-rings"
                  animate={{ opacity: [0, 0.85, 0], scale: [0.5, 1.75, 2.4] }}
                  transition={{ duration: 1.25, delay: 0.45, ease: 'easeOut' }}
                  origin={[150, 132]}
                >
                  <circle cx="150" cy="132" r="21" fill="none" stroke="#7dd3fc" strokeWidth="2" />
                  <circle cx="150" cy="132" r="29" fill="none" stroke="#bae6fd" strokeWidth="1" opacity=".65" />
                </EffectGroup>
              )}

              {has('unibeam') && (
                <EffectGroup
                  id="unibeam"
                  animate={{ opacity: [0, 0.06, 1, 0.3, 0], scaleY: [0.2, 0.2, 1, 1.08, 0.4] }}
                  transition={{ duration: 1.8, times: [0, 0.28, 0.5, 0.72, 1], ease: 'easeOut' }}
                  origin={[150, 144]}
                >
                  <path d="M150 144L119 474L150 550L181 474Z" fill="#7dd3fc" opacity=".34" filter={`url(#${uid}-thruster-glow)`} />
                  <path d="M150 144L140 474L150 510L160 474Z" fill="#fff" opacity=".72" />
                </EffectGroup>
              )}
            </g>
          </AnimatedPart>

          <g id="neck" transform="translate(0 0)">
            <path d="M 136 100 L 164 100 L 160 114 L 140 114 Z" fill={`url(#${uid}-silver)`} stroke="#1e293b" />
          </g>

          <AnimatedPart part="armLeft" animation={parts.armLeft}>
            <g id="arm-left" filter={`url(#${uid}-shadow-filter)`}>
              <path d="M 104 106 L 82 108 L 72 116 L 94 118 Z" fill={`url(#${uid}-red-dark)`} stroke="#4a0808" strokeWidth="1.2" />
              <path d="M 96 110 C 60 106 50 134 74 150 C 90 150 96 132 96 110 Z" fill={`url(#${uid}-red-bright)`} stroke="#4a0808" strokeWidth="1.8" />
              <circle cx="72" cy="120" r="2.5" fill={`url(#${uid}-silver)`} stroke="#1e293b" strokeWidth="0.8" />
              <g id="upper-arm-left">
                <path d="M 76 136 C 48 160 46 185 52 204 L 74 208 C 84 185 88 155 88 140 Z" fill={`url(#${uid}-red-bright)`} stroke="#4a0808" strokeWidth="1.6" />
                <path d="M 74 138 C 56 160 54 184 58 202 L 74 206 L 84 142 Z" fill={`url(#${uid}-gold)`} stroke="#78350f" strokeWidth="1.5" />
                <line x1="66" y1="144" x2="52" y2="198" stroke="#78350f" strokeWidth="1.2" />
              </g>
              <AnimatedPart part="forearmLeft" animation={parts.forearmLeft}>
                <g id="forearm-left">
                  <circle cx="62" cy="204" r="7.5" fill={`url(#${uid}-silver)`} stroke="#1e293b" strokeWidth="1.2" />
                  <circle cx="62" cy="204" r="3.5" fill="#334155" />
                  <path d="M 56 204 C 36 235 34 265 38 280 L 66 284 C 74 255 76 225 74 208 Z" fill={`url(#${uid}-red-bright)`} stroke="#4a0808" strokeWidth="1.8" />
                  <path d="M 38 255 L 26 284 L 40 282 Z" fill={`url(#${uid}-red-bright)`} stroke="#4a0808" strokeWidth="1.4" />
                  <path d="M 50 216 L 44 265 L 56 268 L 62 218 Z" fill={`url(#${uid}-gold)`} opacity="0.85" />
                  <AnimatedPart part="fistLeft" animation={parts.fistLeft}>
                    <g id="fist-left">
                      <PalmEffect side="left" palmThrusters={has('palm-thrusters')} palmCharge={has('palm-charge')} repulsorBeam={has('repulsor-beam')} muzzleFlash={has('muzzle-flash')} filterPrefix={uid} />
                      <g data-iron-hand-surface="left"><rect x="32" y="282" width="26" height="28" rx="5" fill={`url(#${uid}-red-bright)`} stroke="#4a0808" strokeWidth="1.8" /><rect x="36" y="284" width="18" height="13" rx="2.5" fill={`url(#${uid}-gold)`} stroke="#78350f" /><line x1="34" y1="298" x2="54" y2="298" stroke="#4a0808" strokeWidth="1.5" /><line x1="34" y1="304" x2="54" y2="304" stroke="#4a0808" strokeWidth="1.5" /></g>
                      <g data-effect-layer="palm-emitter"><circle cx="45" cy="290" r="2.5" fill="#38bdf8" filter={`url(#${uid}-glow-filter)`} /><circle cx="45" cy="290" r="1.2" fill="#ffffff" /></g>
                    </g>
                  </AnimatedPart>
                </g>
              </AnimatedPart>
            </g>
          </AnimatedPart>

          <AnimatedPart part="armRight" animation={parts.armRight}>
            <g id="arm-right" filter={`url(#${uid}-shadow-filter)`}>
              <path d="M 196 106 L 218 108 L 228 116 L 206 118 Z" fill={`url(#${uid}-red-dark)`} stroke="#4a0808" strokeWidth="1.2" />
              <path d="M 204 110 C 240 106 250 134 226 150 C 210 150 204 132 204 110 Z" fill={`url(#${uid}-red-bright)`} stroke="#4a0808" strokeWidth="1.8" />
              <circle cx="228" cy="120" r="2.5" fill={`url(#${uid}-silver)`} stroke="#1e293b" strokeWidth="0.8" />
              <g id="upper-arm-right">
                <path d="M 224 136 C 252 160 254 185 248 204 L 226 208 C 216 185 212 155 212 140 Z" fill={`url(#${uid}-red-bright)`} stroke="#4a0808" strokeWidth="1.6" />
                <path d="M 226 138 C 244 160 246 184 242 202 L 226 206 L 216 142 Z" fill={`url(#${uid}-gold)`} stroke="#78350f" strokeWidth="1.5" />
                <line x1="234" y1="144" x2="248" y2="198" stroke="#78350f" strokeWidth="1.2" />
              </g>
              <AnimatedPart part="forearmRight" animation={parts.forearmRight}>
                <g id="forearm-right">
                  <circle cx="238" cy="204" r="7.5" fill={`url(#${uid}-silver)`} stroke="#1e293b" strokeWidth="1.2" />
                  <circle cx="238" cy="204" r="3.5" fill="#334155" />
                  <path d="M 244 204 C 264 235 266 265 262 280 L 234 284 C 226 255 224 225 226 208 Z" fill={`url(#${uid}-red-bright)`} stroke="#4a0808" strokeWidth="1.8" />
                  <path d="M 262 255 L 274 284 L 260 282 Z" fill={`url(#${uid}-red-bright)`} stroke="#4a0808" strokeWidth="1.4" />
                  <path d="M 250 216 L 256 265 L 244 268 L 238 218 Z" fill={`url(#${uid}-gold)`} opacity="0.85" />
                  <AnimatedPart part="fistRight" animation={parts.fistRight}>
                    <g id="fist-right">
                      <PalmEffect side="right" palmThrusters={has('palm-thrusters')} palmCharge={has('palm-charge')} repulsorBeam={has('repulsor-beam')} muzzleFlash={has('muzzle-flash')} filterPrefix={uid} />
                      <g data-iron-hand-surface="right"><rect x="242" y="282" width="26" height="28" rx="5" fill={`url(#${uid}-red-bright)`} stroke="#4a0808" strokeWidth="1.8" /><rect x="246" y="284" width="18" height="13" rx="2.5" fill={`url(#${uid}-gold)`} stroke="#78350f" /><line x1="246" y1="298" x2="266" y2="298" stroke="#4a0808" strokeWidth="1.5" /><line x1="246" y1="304" x2="266" y2="304" stroke="#4a0808" strokeWidth="1.5" /></g>
                      <g data-effect-layer="palm-emitter"><circle cx="255" cy="290" r={has('palm-charge') || has('repulsor-beam') ? 5 : 2.5} fill="#dffcff" stroke="#38bdf8" strokeWidth="1.4" filter={`url(#${uid}-glow-filter)`} /><circle cx="255" cy="290" r="1.4" fill="#ffffff" /></g>
                    </g>
                  </AnimatedPart>
                </g>
              </AnimatedPart>
            </g>
          </AnimatedPart>

          <AnimatedPart part="head" animation={parts.head}>
            <g id="head" filter={`url(#${uid}-shadow-filter)`}>
              <path d="M 120 56 C 120 28 180 28 180 56 L 182 92 L 168 106 L 132 106 L 118 92 Z" fill={`url(#${uid}-red-bright)`} stroke="#4a0808" strokeWidth="2" />
              <ellipse cx="120" cy="72" rx="4" ry="10" fill={`url(#${uid}-gold)`} stroke="#78350f" strokeWidth="1.2" /><circle cx="120" cy="72" r="2" fill="#4a0808" />
              <ellipse cx="180" cy="72" rx="4" ry="10" fill={`url(#${uid}-gold)`} stroke="#78350f" strokeWidth="1.2" /><circle cx="180" cy="72" r="2" fill="#4a0808" />
              <path d="M 128 48 C 136 44, 164 44, 172 48 C 178 54, 178 70, 174 78 L 164 97 L 150 102 L 136 97 L 126 78 C 122 70, 122 54, 128 48 Z" fill={`url(#${uid}-gold)`} stroke="#78350f" strokeWidth="1.8" />
              <path d="M 144 36 L 156 36 L 154 52 L 146 52 Z" fill={`url(#${uid}-red-bright)`} stroke="#4a0808" strokeWidth="1.1" />
              <path d="M 130 50 L 143 56 M 157 56 L 170 50" fill="none" stroke="#78350f" strokeWidth="1.4" strokeLinecap="round" /><line x1="150" y1="58" x2="150" y2="65" stroke="#78350f" strokeWidth="1.2" opacity="0.8" />
              <path d="M 138 98 L 162 98 L 158 105 Q 150 107 142 105 Z" fill={`url(#${uid}-red-bright)`} stroke="#4a0808" strokeWidth="1" />
              <motion.g
                id="hud-eyes-glow"
                data-effect={has('eye-flash') ? 'eye-flash' : has('eye-pulse') ? 'eye-pulse' : undefined}
                animate={visual
                  ? { opacity: Math.min(1, signal('eyeGlow') + signal('eyePulse') * 0.18) }
                  : has('eye-flash')
                  ? { opacity: [0.2, 1, 0.4, 1, 0.75] }
                  : has('eye-pulse')
                    ? { opacity: [0.58, 1, 0.72, 0.92] }
                    : has('standby-pulse')
                      ? { opacity: [0.12, 0.28, 0.12] }
                      : { opacity: 1 }}
                transition={visual
                  ? { duration: 0 }
                  : has('eye-flash')
                  ? { duration: action === 'dizzy' ? 1.7 : 0.9, repeat: action === 'dizzy' ? Infinity : 0, ease: 'easeInOut' }
                  : has('eye-pulse')
                    ? { duration: action === 'speaking' ? 0.55 : 1.6, repeat: Infinity, ease: 'easeInOut' }
                    : has('standby-pulse')
                      ? { duration: 3.8, repeat: Infinity, ease: 'easeInOut' }
                      : { duration: 0 }}
              >
                <polygon points="130,66 146,68 143,73 132,72" fill="#ffffff" stroke="#38bdf8" strokeWidth="1.4" filter={`url(#${uid}-glow-filter)`} /><polygon points="131,67 145,69 142,72 133,71" fill="#e0f2fe" /><polygon points="133,68 143,69 141,71 134,70" fill="#ffffff" />
                <polygon points="170,66 154,68 157,73 168,72" fill="#ffffff" stroke="#38bdf8" strokeWidth="1.4" filter={`url(#${uid}-glow-filter)`} /><polygon points="169,67 155,69 158,72 167,71" fill="#e0f2fe" /><polygon points="167,68 157,69 159,71 166,70" fill="#ffffff" />
              </motion.g>
              {has('hud-scan') && (
                <motion.g
                  data-effect="hud-scan"
                  animate={{ opacity: [0, 0.78, 0], x: [-15, 15, -15] }}
                  transition={{ duration: 1.35, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <path d="M126 62H174M126 78H174" stroke="#7dd3fc" strokeWidth="1" strokeDasharray="3 4" opacity=".72" />
                  <line x1="150" y1="62" x2="150" y2="80" stroke="#dffcff" strokeWidth="1.4" filter={`url(#${uid}-thruster-glow)`} />
                </motion.g>
              )}
              <line x1="140" y1="90" x2="160" y2="90" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />
            </g>
          </AnimatedPart>
        </AnimatedPart>
      </g>

      {readableCues && <KidReadableCue action={action} filterPrefix={uid} />}

    </svg>
  );
}
