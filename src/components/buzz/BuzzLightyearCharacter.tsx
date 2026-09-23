import { motion } from 'motion/react';
import { useId } from 'react';
import { BUZZ_ACTION_SPECS, isBuzzAction, type BuzzAction, type BuzzPose } from './buzzActions';

export interface BuzzLightyearCharacterProps {
  action?: BuzzAction;
  size?: number;
  speaking?: boolean;
}

type Point = readonly [number, number];
type HandShape = 'fist' | 'open' | 'hip';
type ArmPose = { elbow: Point; wrist: Point; hand: HandShape; handAngle?: number; fingersDirection?: 'up' | 'inward' | 'outward' };
type PoseRig = { left: ArmPose; right: ArmPose };

const SHOULDER = { left: [74, 132] as Point, right: [226, 132] as Point };

/** Semantic poses only provide joints; geometry stays connected for every action. */
const POSE_RIG: Record<BuzzPose, PoseRig> = {
  standing: { left: { elbow: [52, 204], wrist: [40, 286], hand: 'fist' }, right: { elbow: [248, 204], wrist: [260, 286], hand: 'fist' } },
  akimbo: { left: { elbow: [30, 184], wrist: [96, 220], hand: 'hip' }, right: { elbow: [270, 184], wrist: [204, 220], hand: 'hip' } },
  listen: { left: { elbow: [52, 204], wrist: [40, 286], hand: 'fist' }, right: { elbow: [258, 150], wrist: [190, 70], hand: 'open', handAngle: 0, fingersDirection: 'up' } },
  talk: { left: { elbow: [42, 176], wrist: [82, 148], hand: 'open', handAngle: -55, fingersDirection: 'outward' }, right: { elbow: [258, 176], wrist: [218, 148], hand: 'open', handAngle: 55, fingersDirection: 'outward' } },
  wave: { left: { elbow: [52, 204], wrist: [40, 286], hand: 'fist' }, right: { elbow: [266, 142], wrist: [278, 66], hand: 'open', handAngle: 0, fingersDirection: 'up' } },
  clap: { left: { elbow: [88, 198], wrist: [143, 218], hand: 'open', handAngle: 90, fingersDirection: 'inward' }, right: { elbow: [212, 198], wrist: [157, 218], hand: 'open', handAngle: -90, fingersDirection: 'inward' } },
  surprised: { left: { elbow: [42, 148], wrist: [18, 92], hand: 'open', handAngle: -42, fingersDirection: 'outward' }, right: { elbow: [258, 148], wrist: [282, 92], hand: 'open', handAngle: 42, fingersDirection: 'outward' } },
  communicator: { left: { elbow: [32, 184], wrist: [96, 220], hand: 'hip' }, right: { elbow: [258, 150], wrist: [190, 70], hand: 'open', handAngle: 0, fingersDirection: 'up' } },
  scan: { left: { elbow: [52, 204], wrist: [40, 286], hand: 'fist' }, right: { elbow: [252, 194], wrist: [220, 238], hand: 'open', handAngle: -15, fingersDirection: 'up' } },
  laser: { left: { elbow: [52, 204], wrist: [40, 286], hand: 'fist' }, right: { elbow: [272, 138], wrist: [326, 138], hand: 'fist' } },
  fly: { left: { elbow: [40, 158], wrist: [12, 105], hand: 'fist' }, right: { elbow: [260, 158], wrist: [288, 105], hand: 'fist' } },
};

const segmentPath = ([ax, ay]: Point, [bx, by]: Point, width = 22) => {
  const length = Math.hypot(bx - ax, by - ay) || 1;
  const px = (-(by - ay) / length) * width / 2;
  const py = ((bx - ax) / length) * width / 2;
  return `M${ax + px} ${ay + py}L${bx + px} ${by + py}L${bx - px} ${by - py}L${ax - px} ${ay - py}Z`;
};

function BuzzHand({ side, pose, white, purple }: { side: 'left' | 'right'; pose: ArmPose; white: string; purple: string }) {
  const [x, y] = pose.wrist;
  const direction = side === 'left' ? -1 : 1;
  const rotation = pose.handAngle ?? Math.atan2(y - pose.elbow[1], x - pose.elbow[0]) * 180 / Math.PI - 90;
  const gesture = pose.fingersDirection === 'inward' ? 'contact' : pose.fingersDirection === 'outward' ? 'expressive' : 'wave';
  const fingers = [
    { name: 'thumb', x: -13, y: 5, angle: -52, length: 13 },
    { name: 'index', x: -8, y: -1, angle: -7, length: 18 },
    { name: 'middle', x: -2, y: -3, angle: -2, length: 21 },
    { name: 'ring', x: 5, y: -2, angle: 4, length: 19 },
    { name: 'pinky', x: 11, y: 1, angle: 10, length: 15 },
  ] as const;
  const spread = gesture === 'expressive' ? 1.45 : gesture === 'contact' ? .28 : 1;
  return (
    <g
      data-buzz-hand={side}
      data-palm-facing={pose.hand === 'open' ? 'viewer' : undefined}
      data-fingers-direction={pose.fingersDirection}
      transform={`translate(${x} ${y}) rotate(${pose.hand === 'hip' ? direction * -18 : rotation})`}
    >
      {pose.hand === 'open' ? (
        <g data-buzz-hand-gesture={gesture} stroke="#0f172a" strokeWidth="1.45" strokeLinejoin="round">
          {fingers.map((finger, index) => {
            const fan = finger.angle * spread;
            const curl = gesture === 'contact' ? (index === 0 ? 28 : 9) : gesture === 'expressive' ? -4 : index * 1.5;
            const pulse = gesture === 'wave' ? [curl, curl + (index % 2 ? 5 : -3), curl] : curl;
            return <g
              key={finger.name}
              data-buzz-finger={finger.name}
              transform={`translate(${finger.x} ${finger.y}) rotate(${fan})`}
            >
              <motion.g animate={{ rotate: pulse }} transition={{ duration: .9 + index * .08, repeat: gesture === 'wave' ? Infinity : 0, ease: 'easeInOut' }} style={{ transformOrigin: '0px 0px' }}>
                <rect data-buzz-finger-segment="proximal" x="-3.15" y={-finger.length} width="6.3" height={finger.length + 2} rx="3.15" fill={white} />
                <motion.g animate={{ rotate: gesture === 'contact' ? (index === 0 ? 22 : 5) : gesture === 'wave' ? [0, 3, 0] : 0 }} transition={{ duration: 1.05 + index * .06, repeat: gesture === 'wave' ? Infinity : 0, ease: 'easeInOut' }} style={{ transformOrigin: `0px ${-finger.length + 2}px` }}>
                  <rect data-buzz-finger-segment="distal" x="-3" y={-finger.length - Math.max(8, finger.length * .58)} width="6" height={Math.max(10, finger.length * .68)} rx="3" fill={white} />
                  <circle cx="0" cy={-finger.length + 1} r="2.25" fill="#dbe5ec" stroke="none" />
                </motion.g>
              </motion.g>
            </g>;
          })}
          <path data-buzz-palm="articulated" d="M-15-1Q0-8 15-1L13 17Q0 24-13 17Z" fill={white} />
          <path d="M-12 11Q0 15 12 11" fill="none" stroke={purple} strokeWidth="5" strokeLinecap="round" />
          <path d="M-8 3Q0-1 8 3" fill="none" stroke="#cbd5e1" strokeWidth="1.2" opacity=".8" />
        </g>
      ) : pose.hand === 'hip' ? (
        <g fill={white} stroke="#0f172a" strokeWidth="1.7"><path d="M-13-7L13-7L16 11L-10 15Z" /><path d="M-7-3H12M-6 3H13M-4 9H12" stroke={purple} strokeWidth="3.5" /></g>
      ) : (
        <g><rect x="-13" y="-9" width="26" height="28" rx="7" fill={white} stroke="#0f172a" strokeWidth="1.8" /><path d="M-9 1H9M-8 8H8" stroke={purple} strokeWidth="4" strokeLinecap="round" /></g>
      )}
    </g>
  );
}

function BuzzArm({ side, pose, white, green, purple }: { side: 'left' | 'right'; pose: ArmPose; white: string; green: string; purple: string }) {
  const shoulder = SHOULDER[side];
  return (
    <g data-buzz-arms={side}>
      <motion.path data-buzz-segment="upper" initial={false} d={segmentPath(shoulder, pose.elbow, 24)} animate={{ d: segmentPath(shoulder, pose.elbow, 24) }} transition={{ duration: .42, ease: [0.22, 1, 0.36, 1] }} fill={white} stroke="#0f172a" strokeWidth="1.8" />
      <motion.path data-buzz-segment="forearm" initial={false} d={segmentPath(pose.elbow, pose.wrist, 23)} animate={{ d: segmentPath(pose.elbow, pose.wrist, 23) }} transition={{ duration: .42, ease: [0.22, 1, 0.36, 1] }} fill={white} stroke="#0f172a" strokeWidth="1.8" />
      <motion.path initial={false} d={segmentPath(shoulder, pose.elbow, 10)} animate={{ d: segmentPath(shoulder, pose.elbow, 10) }} transition={{ duration: .42, ease: [0.22, 1, 0.36, 1] }} fill="#64748b" opacity=".2" />
      <motion.path initial={false} d={segmentPath(pose.elbow, pose.wrist, 9)} animate={{ d: segmentPath(pose.elbow, pose.wrist, 9) }} transition={{ duration: .42, ease: [0.22, 1, 0.36, 1] }} fill="#64748b" opacity=".18" />
      <motion.circle data-buzz-joint="elbow" initial={false} cx={pose.elbow[0]} cy={pose.elbow[1]} animate={{ cx: pose.elbow[0], cy: pose.elbow[1] }} transition={{ duration: .42 }} r="9" fill="#1e293b" stroke="#020617" strokeWidth="1.5" />
      <motion.circle initial={false} cx={pose.wrist[0]} cy={pose.wrist[1]} animate={{ cx: pose.wrist[0], cy: pose.wrist[1] }} transition={{ duration: .42 }} r="11" fill={green} stroke="#365314" strokeWidth="1.4" />
      <BuzzHand side={side} pose={pose} white={white} purple={purple} />
      <circle data-buzz-joint="shoulder" cx={shoulder[0]} cy={shoulder[1]} r="16" fill={white} stroke="#0f172a" strokeWidth="2" /><circle cx={shoulder[0]} cy={shoulder[1]} r="7" fill={purple} />
    </g>
  );
}

function BuzzHead({ uid, talking, nod, shake }: { uid: string; talking: boolean; nod: boolean; shake: boolean }) {
  const headMotion = {
    y: nod ? [0, 8, 0, 6, 0] : 0,
    x: shake ? [0, -9, 9, -7, 7, 0] : 0,
    rotate: shake ? [0, -6, 6, -5, 5, 0] : 0,
  };
  const speechShapes = [
    'M136 83Q150 89 166 83Q150 87 136 83Z',
    'M136 83Q150 95 166 83Q150 91 136 83Z',
    'M136 83Q150 91 166 83Q150 88 136 83Z',
    'M136 83Q150 98 166 83Q150 94 136 83Z',
    'M136 83Q150 90 166 83Q150 87 136 83Z',
  ];

  return (
    <>
      <motion.g data-buzz-head="head" animate={headMotion} transition={{ duration: shake ? .9 : nod ? 1.05 : .3, repeat: shake || nod ? Infinity : 0, ease: 'easeInOut' }} style={{ transformOrigin: '150px 108px' }}>
        <path d="M114 56C114 26 186 26 186 56L188 104C188 116 172 120 150 120C128 120 112 116 112 104Z" fill={`url(#${uid}-purple)`} stroke="#2e1065" strokeWidth="2.2" />

        <ellipse data-buzz-ear="left" cx="111" cy="74" rx="5" ry="10" fill={`url(#${uid}-purple)`} stroke="#2e1065" strokeWidth="1.4" />
        <circle cx="111" cy="74" r="2.5" fill="#38bdf8" filter={`url(#${uid}-glow)`} />
        <ellipse data-buzz-ear="right" cx="189" cy="74" rx="5" ry="10" fill={`url(#${uid}-purple)`} stroke="#2e1065" strokeWidth="1.4" />
        <circle cx="189" cy="74" r="2.5" fill="#38bdf8" filter={`url(#${uid}-glow)`} />

        <path d="M120 48C130 40 170 40 180 48C188 58 186 82 182 94L172 112C166 116 134 116 128 112L118 94C114 82 112 58 120 48Z" fill={`url(#${uid}-skin)`} stroke="#0f172a" strokeWidth="2.2" strokeLinejoin="round" />

        <motion.path data-buzz-eyebrow="left" d="M124 54Q138 46 147 55Z" fill="#2d150b" stroke="#2d150b" strokeWidth="1.8" strokeLinejoin="round" animate={{ y: [0, -2.5, 0], rotate: [0, -3, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }} style={{ transformOrigin: '135px 58px' }} />
        <motion.path data-buzz-eyebrow="right" d="M176 54Q162 46 153 55Z" fill="#2d150b" stroke="#2d150b" strokeWidth="1.8" strokeLinejoin="round" animate={{ y: [0, 1.2, 0], rotate: [0, 2, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }} style={{ transformOrigin: '165px 58px' }} />
        <path d="M126 58L144 59M174 58L156 59" stroke="#ea580c" strokeWidth="1.3" strokeLinecap="round" opacity=".65" />

        <motion.g animate={{ scaleY: [1, 1, .06, 1, 1] }} transition={{ duration: 3.8, times: [0, .88, .91, .94, 1], repeat: Infinity, ease: 'easeInOut' }} style={{ transformOrigin: '137px 65px' }}>
          <ellipse cx="137" cy="65" rx="7" ry="7.5" fill="#fff" stroke="#0f172a" strokeWidth="1.3" /><circle cx="138" cy="65" r="4.2" fill="#0284c7" /><circle cx="138" cy="65" r="2.2" fill="#0f172a" /><circle cx="139.5" cy="63" r="1.3" fill="#fff" />
        </motion.g>
        <motion.g animate={{ scaleY: [1, 1, .06, 1, 1] }} transition={{ duration: 3.8, times: [0, .88, .91, .94, 1], repeat: Infinity, ease: 'easeInOut' }} style={{ transformOrigin: '163px 65px' }}>
          <ellipse cx="163" cy="65" rx="7" ry="7.5" fill="#fff" stroke="#0f172a" strokeWidth="1.3" /><circle cx="162" cy="65" r="4.2" fill="#0284c7" /><circle cx="162" cy="65" r="2.2" fill="#0f172a" /><circle cx="163.5" cy="63" r="1.3" fill="#fff" />
        </motion.g>

        <path d="M150 60L154 75L145 77L155 77" fill="none" stroke="#c2410c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        {talking ? (
          <g data-buzz-mouth="natural-speech">
            <motion.path initial={false} d={speechShapes[0]} animate={{ d: speechShapes }} transition={{ duration: .86, times: [0, .22, .44, .72, 1], repeat: Infinity, ease: [0.45, 0.05, 0.55, 0.95] }} fill="#7f1d1d" stroke="#450a0a" strokeWidth="1.8" />
            <motion.path data-buzz-mouth-part="teeth" d="M140 84Q150 87 162 84L160 87Q150 90 142 87Z" fill="#fff" animate={{ y: [0, .4, 0, .7, 0] }} transition={{ duration: .86, repeat: Infinity, ease: 'easeInOut' }} />
            <motion.path data-buzz-mouth-part="tongue" d="M145 91Q150 87 155 91Q150 95 145 91Z" fill="#f87171" animate={{ y: [0, 1, .2, 1.8, 0] }} transition={{ duration: .86, repeat: Infinity, ease: 'easeInOut' }} />
          </g>
        ) : (
          <g data-buzz-mouth="confident-smirk"><path d="M136 84Q148 91 166 82" fill="none" stroke="#7c2d12" strokeWidth="2.8" strokeLinecap="round" /><line x1="166" y1="82" x2="169" y2="78" stroke="#7c2d12" strokeWidth="2.2" strokeLinecap="round" /></g>
        )}

        <g data-buzz-chin-swirl transform="translate(150 104)"><path d="M-6-3Q0-1 6-3" fill="none" stroke="#ea580c" strokeWidth="1.2" opacity=".6" /><path d="M0-4A4 4 0 011 4A3.2 3.2 0 01-3.2 0A2.2 2.2 0 010-2.2A1.4 1.4 0 011.4 0" fill="none" stroke="#ea580c" strokeWidth="2.2" strokeLinecap="round" /></g>
      </motion.g>

      <g data-buzz-helmet="glass-dome">
        <circle cx="150" cy="76" r="54" fill={`url(#${uid}-glass)`} stroke="#38bdf8" strokeWidth="2.2" opacity=".82" />
        <ellipse cx="150" cy="126" rx="46" ry="7.5" fill="none" stroke="#e0f2fe" strokeWidth="2" opacity=".9" /><ellipse cx="150" cy="126" rx="43" ry="5.5" fill="none" stroke="#38bdf8" strokeWidth="1.2" opacity=".7" />
        <path data-buzz-helmet-glare="crown" d="M116 50A46 46 0 01184 50A46 36 0 00116 50Z" fill="#fff" opacity=".34" filter={`url(#${uid}-glow)`} />
        <ellipse data-buzz-helmet-glare="left" cx="122" cy="42" rx="14" ry="5" transform="rotate(-30 122 42)" fill="#fff" opacity=".85" />
        <ellipse data-buzz-helmet-glare="right" cx="178" cy="46" rx="7" ry="3.5" transform="rotate(25 178 46)" fill="#fff" opacity=".65" />
      </g>
    </>
  );
}

export default function BuzzLightyearCharacter({ action = 'akimbo', size = 1, speaking = false }: BuzzLightyearCharacterProps) {
  const resolved = isBuzzAction(action) ? action : 'akimbo';
  const spec = BUZZ_ACTION_SPECS[resolved] ?? BUZZ_ACTION_SPECS.akimbo!;
  const rig = POSE_RIG[spec.pose];
  const uid = `buzz-${useId().replace(/:/g, '')}`;
  const deployed = spec.wings === 'deployed';
  const talking = speaking || spec.effects.includes('speech-mouth');
  const nod = resolved === 'nod';
  const shake = resolved === 'shake';
  const celebratory = resolved === 'happy' || resolved === 'clap';
  const flying = resolved === 'fly';
  const rootMotion = flying ? { y: [8, -18, -10, 8], rotate: [0, -3, 2, 0] } : celebratory ? { y: [0, -14, 0, -8, 0] } : resolved === 'surprised' ? { y: [0, 12, -5, 0], scale: [1, .94, 1.04, 1] } : { y: [0, -2, 0] };

  return (
    <div className="buzz-lightyear-character" data-buzz-character="lightyear" data-buzz-action={resolved} style={{ width: 300 * size, height: 580 * size }}>
      <motion.svg viewBox="0 0 300 580" width="300" height="580" role="img" aria-label={`Buzz Lightyear ${resolved}`} style={{ transform: `scale(${size})`, transformOrigin: 'top left', overflow: 'visible' }}>
        <defs>
          <linearGradient id={`${uid}-white`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0" stopColor="#fff"/><stop offset=".45" stopColor="#eef2f7"/><stop offset="1" stopColor="#94a3b8"/></linearGradient>
          <linearGradient id={`${uid}-white-dark`} x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0" stopColor="#cbd5e1"/><stop offset="1" stopColor="#64748b"/></linearGradient>
          <linearGradient id={`${uid}-green`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0" stopColor="#bef264"/><stop offset=".5" stopColor="#84cc16"/><stop offset="1" stopColor="#3f6212"/></linearGradient>
          <linearGradient id={`${uid}-purple`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0" stopColor="#d8b4fe"/><stop offset=".45" stopColor="#9333ea"/><stop offset="1" stopColor="#3b0764"/></linearGradient>
          <linearGradient id={`${uid}-black`} x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0" stopColor="#0f172a"/><stop offset=".5" stopColor="#334155"/><stop offset="1" stopColor="#020617"/></linearGradient>
          <linearGradient id={`${uid}-skin`} x1="0%" y1="0%" x2="0%" y2="100%"><stop stopColor="#fff1e6"/><stop offset=".4" stopColor="#fed7aa"/><stop offset="1" stopColor="#fdba74"/></linearGradient>
          <linearGradient id={`${uid}-glass`} x1="0%" y1="0%" x2="100%" y2="100%"><stop stopColor="#fff" stopOpacity=".6"/><stop offset=".25" stopColor="#e0f2fe" stopOpacity=".18"/><stop offset=".75" stopColor="#38bdf8" stopOpacity=".08"/><stop offset="1" stopColor="#0284c7" stopOpacity=".3"/></linearGradient>
          <linearGradient id={`${uid}-btn-blue`} x1="0%" y1="0%" x2="0%" y2="100%"><stop stopColor="#7dd3fc"/><stop offset="1" stopColor="#0284c7"/></linearGradient>
          <linearGradient id={`${uid}-btn-green`} x1="0%" y1="0%" x2="0%" y2="100%"><stop stopColor="#86efac"/><stop offset="1" stopColor="#16a34a"/></linearGradient>
          <linearGradient id={`${uid}-btn-red`} x1="0%" y1="0%" x2="0%" y2="100%"><stop stopColor="#fca5a5"/><stop offset=".4" stopColor="#ef4444"/><stop offset="1" stopColor="#991b1b"/></linearGradient>
          <filter id={`${uid}-glow`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id={`${uid}-shadow`} x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#000" floodOpacity=".65"/></filter>
        </defs>
        <ellipse cx="150" cy="553" rx="88" ry="10" fill="#000" opacity=".42" />
        <motion.g data-buzz-root="rig" animate={rootMotion} transition={{ duration: flying ? 1.8 : celebratory ? 1.15 : 2.4, repeat: Infinity, ease: 'easeInOut' }}>
          <g data-buzz-wings="back" filter={`url(#${uid}-shadow)`}>
            <motion.g animate={{ opacity: deployed ? 1 : 0, scaleX: deployed ? 1 : .18 }} transition={{ duration: .6, ease: 'backOut' }} style={{ transformOrigin: '150px 175px' }}>
              <path d="M86 160L10 118L6 152L82 200Z" fill={`url(#${uid}-purple)`} stroke="#2e1065" strokeWidth="1.8"/><path d="M214 160L290 118L294 152L218 200Z" fill={`url(#${uid}-purple)`} stroke="#2e1065" strokeWidth="1.8"/>
              <path d="M10 118L86 160L82 172L8 134ZM290 118L214 160L218 172L292 134Z" fill={`url(#${uid}-green)`} stroke="#3f6212" strokeWidth="1.2"/>
              <path d="M20 124L34 132L28 150L14 142ZM56 144L70 152L64 170L50 162ZM280 124L266 132L272 150L286 142ZM244 144L230 152L236 170L250 162Z" fill="#ef4444"/><path d="M38 134L52 142L46 160L32 152ZM262 134L248 142L254 160L268 152Z" fill="#fff"/>
              <circle cx="8" cy="128" r="4.5" fill="#ef4444" filter={`url(#${uid}-glow)`}/><circle cx="292" cy="128" r="4.5" fill="#22c55e" filter={`url(#${uid}-glow)`}/>
            </motion.g>
            <motion.g animate={{ opacity: deployed ? 0 : 1 }} transition={{ duration: .35 }}><rect x="80" y="142" width="16" height="70" rx="3" fill={`url(#${uid}-purple)`} stroke="#2e1065" strokeWidth="1.4"/><rect x="204" y="142" width="16" height="70" rx="3" fill={`url(#${uid}-purple)`} stroke="#2e1065" strokeWidth="1.4"/><path d="M88 144V208M212 144V208" stroke="#84cc16" strokeWidth="2.2"/></motion.g>
            <path d="M90 138H210L202 248H98Z" fill={`url(#${uid}-white)`} stroke="#0f172a" strokeWidth="2"/><path d="M98 140H202L196 166H104Z" fill={`url(#${uid}-green)`} stroke="#3f6212" strokeWidth="1.4"/><rect x="98" y="240" width="24" height="11" rx="3" fill={`url(#${uid}-black)`}/><rect x="178" y="240" width="24" height="11" rx="3" fill={`url(#${uid}-black)`}/>
          </g>
          <g data-buzz-legs="ground">
            <path d="M124 256L96 360L126 368L148 262Z" fill={`url(#${uid}-white)`} stroke="#0f172a" strokeWidth="1.8"/><path d="M110 264L100 345L114 356L124 345L132 268Z" fill={`url(#${uid}-white-dark)`} opacity=".4"/>
            <path d="M176 256L204 360L174 368L152 262Z" fill={`url(#${uid}-white)`} stroke="#0f172a" strokeWidth="1.8"/><path d="M190 264L200 345L186 356L176 345L168 268Z" fill={`url(#${uid}-white-dark)`} opacity=".4"/>
            <circle cx="110" cy="368" r="12" fill={`url(#${uid}-green)`} stroke="#0f172a" strokeWidth="1.8"/><circle cx="110" cy="368" r="5.5" fill={`url(#${uid}-black)`}/><circle cx="190" cy="368" r="12" fill={`url(#${uid}-green)`} stroke="#0f172a" strokeWidth="1.8"/><circle cx="190" cy="368" r="5.5" fill={`url(#${uid}-black)`}/>
            <path d="M94 376L78 475L120 480L126 380ZM206 376L222 475L180 480L174 380Z" fill={`url(#${uid}-white)`} stroke="#0f172a" strokeWidth="1.8"/><path d="M80 460L121 465L120 478L78 473ZM220 460L179 465L180 478L222 473Z" fill={`url(#${uid}-green)`} stroke="#3f6212" strokeWidth="1.4"/>
            <path d="M78 475L64 515L78 532H122L120 480ZM222 475L236 515L222 532H178L180 480Z" fill={`url(#${uid}-white)`} stroke="#0f172a" strokeWidth="1.8"/><path d="M64 515L56 534H94L90 514ZM236 515L244 534H206L210 514Z" fill={`url(#${uid}-green)`} stroke="#3f6212" strokeWidth="1.4"/>
            <path d="M56 534L54 540H124V532ZM244 534L246 540H176V532Z" fill={`url(#${uid}-purple)`} stroke="#2e1065" strokeWidth="1.4"/><path d="M58 537H120M242 537H180" stroke="#38bdf8" strokeWidth="1.6" filter={`url(#${uid}-glow)`}/>
          </g>
          <g data-buzz-body="body">
            <path d="M114 240L186 240L172 268L150 278L128 268Z" fill={`url(#${uid}-white)`} stroke="#0f172a" strokeWidth="2"/><path d="M138 242H162L166 260L150 268L134 260Z" fill={`url(#${uid}-green)`} stroke="#365314" strokeWidth="1.4"/><path d="M112 188H188L180 242H120Z" fill="#172033" stroke="#020617" strokeWidth="2"/><path d="M120 202H180M119 216H181M120 230H180" stroke="#475569" strokeWidth="2"/>
            <path d="M76 128H224L198 196H102Z" fill={`url(#${uid}-white)`} stroke="#0f172a" strokeWidth="2.2"/><path d="M84 132L114 194H100L78 138ZM216 132L186 194H200L222 138Z" fill={`url(#${uid}-purple)`} stroke="#2e1065" strokeWidth="1.4"/>
            <path d="M72 125C72 110 228 110 228 125L220 166L180 174L150 178L120 174L80 166Z" fill={`url(#${uid}-green)`} stroke="#0f172a" strokeWidth="2.2"/><path d="M80 128C106 118 194 118 220 128L214 154C180 162 120 162 86 154Z" fill="#bef264" opacity=".35"/>
            <g transform="translate(150 148)"><path d="M0-12L15 10H-15Z" fill="#0284c7" stroke="#0f172a" strokeWidth="1.4"/><path d="M0-10L3.5 0H13L5 6L7 12L0 7L-7 12L-5 6L-13 0H-3.5Z" fill="#fde047"/><path d="M0-8L2.5-2L0 2.5L-2.5-2Z" fill="#ef4444"/><rect x="-24" y="11" width="48" height="7.5" rx="1.5" fill="#fde047" stroke="#0f172a" strokeWidth=".9"/><text x="0" y="16.5" fontSize="5" fontWeight="900" fill="#0f172a" textAnchor="middle">LIGHTYEAR</text></g>
            <g transform="translate(192 146)"><ellipse cy="-10" rx="4.5" ry="7" transform="rotate(-15)" fill={`url(#${uid}-btn-blue)`} stroke="#0f172a" strokeWidth="1.3"/><ellipse cy="3" rx="4.5" ry="7" transform="rotate(-15)" fill={`url(#${uid}-btn-green)`} stroke="#0f172a" strokeWidth="1.3"/><ellipse cy="16" rx="4.5" ry="7" transform="rotate(-15)" fill={`url(#${uid}-btn-red)`} stroke="#0f172a" strokeWidth="1.3"/><path d="M-1-14V18" stroke="#fff" strokeWidth="2" opacity=".55" strokeDasharray="3 10"/></g>
            <g transform="translate(106 152)"><circle r="10" fill={`url(#${uid}-btn-red)`} stroke="#0f172a" strokeWidth="1.6"/><circle cx="-3" cy="-3" r="3" fill="#fff" opacity=".8"/><circle r="8" fill="none" stroke="#fca5a5" strokeWidth=".9" strokeDasharray="2 1"/></g>
          </g>
          <BuzzArm side="left" pose={rig.left} white={`url(#${uid}-white)`} green={`url(#${uid}-green)`} purple={`url(#${uid}-purple)`} /><BuzzArm side="right" pose={rig.right} white={`url(#${uid}-white)`} green={`url(#${uid}-green)`} purple={`url(#${uid}-purple)`} />
          <path d="M124 104H176L170 126H130Z" fill={`url(#${uid}-purple)`} stroke="#2e1065" strokeWidth="2" />
          <BuzzHead uid={uid} talking={talking} nod={nod} shake={shake} />
          {(spec.effects.includes('scanner') || resolved === 'thinking') && <motion.g data-buzz-effect="scanner" animate={{ opacity: [.2, 1, .2], x: [-4, 4, -4] }} transition={{ duration: 1.2, repeat: Infinity }}><path d="M205 235H270M205 250H270" stroke="#d9f99d" strokeWidth="3" strokeDasharray="5 4" filter={`url(#${uid}-glow)`}/></motion.g>}
          {spec.effects.includes('radio-pulse') && <motion.g data-buzz-effect="radio-pulse" animate={{ opacity: [0, .9, 0], scale: [.45, 1.3, 1.8] }} transition={{ duration: 1.4, repeat: Infinity }} style={{ transformOrigin: '190px 70px' }}><circle cx="190" cy="70" r="22" fill="none" stroke="#38bdf8" strokeWidth="2"/><circle cx="190" cy="70" r="31" fill="none" stroke="#a7f3d0"/></motion.g>}
          {spec.effects.includes('badge-glow') && <motion.circle data-buzz-effect="badge-glow" cx="150" cy="148" r="27" fill="none" stroke="#d9f99d" strokeWidth="2" animate={{ opacity: [.2, .95, .2], scale: [.8, 1.25, .8] }} transition={{ duration: 1.15, repeat: Infinity }} style={{ transformOrigin: '150px 148px' }} />}
          {spec.effects.includes('laser-beam') && <motion.g data-buzz-effect="laser-beam" animate={{ opacity: [.15, 1, .6, .15], scaleX: [.1, 1, 1.06, .2] }} transition={{ duration: 1.3, repeat: Infinity }} style={{ transformOrigin: '292px 138px' }}><path d="M292 138H390" stroke="#ef4444" strokeWidth="11" opacity=".35" filter={`url(#${uid}-glow)`}/><path d="M292 138H390" stroke="#fff" strokeWidth="3"/></motion.g>}
        </motion.g>
      </motion.svg>
    </div>
  );
}
