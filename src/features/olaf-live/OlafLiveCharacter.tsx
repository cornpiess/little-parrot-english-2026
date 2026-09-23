import type { ArmRig, CharacterRigFrame } from './rig';
import type { SceneObjectFrame } from './embodiedInteraction';

interface OlafLiveCharacterProps {
  frame: CharacterRigFrame;
  props?: SceneObjectFrame[];
  costume?: { id: string; visual: 'diving-suit' | 'explorer' | 'space-suit'; accent?: string };
  size?: number;
  className?: string;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

interface ArmConstraint { x: number; y: number; weight: number }

function findArmConstraint(objects: SceneObjectFrame[], side: 'left' | 'right'): ArmConstraint | undefined {
  const object = objects.find((candidate) => candidate.grip === 'both' || candidate.grip === side);
  if (!object) return undefined;
  if (object.anchor === 'both-hands') return { x: 400 + object.offsetX + (side === 'left' ? -54 : 54), y: 470 + object.offsetY, weight: object.manipulationProgress };
  if (object.anchor === 'mouth') return { x: 400 + object.offsetX + (side === 'left' ? -48 : 48), y: 340 + object.offsetY + 22, weight: object.manipulationProgress };
  if (object.action === 'wear' && side === 'right') return { x: 565, y: 305, weight: object.manipulationProgress };
  return undefined;
}

function constrainedArmTransform(side: 'left' | 'right', target: ArmConstraint) {
  const shoulderX = side === 'left' ? 310 : 490;
  const baseX = side === 'left' ? -160 : 160;
  const baseY = -85;
  const targetX = target.x - shoulderX;
  const targetY = target.y - 490;
  const baseLength = Math.hypot(baseX, baseY);
  const targetLength = Math.hypot(targetX, targetY);
  const scale = clamp(targetLength / baseLength, 0.55, 1.08);
  const angle = Math.atan2(targetY, targetX) - Math.atan2(baseY, baseX);
  const cos = Math.cos(angle) * scale;
  const sin = Math.sin(angle) * scale;
  const e = shoulderX - cos * shoulderX + sin * 490;
  const f = 490 - sin * shoulderX - cos * 490;
  return `matrix(${cos.toFixed(4)} ${sin.toFixed(4)} ${(-sin).toFixed(4)} ${cos.toFixed(4)} ${e.toFixed(2)} ${f.toFixed(2)})`;
}

function naturalArmTransform(side: 'left' | 'right', rig: ArmRig, drag: number) {
  const direction = side === 'left' ? -1 : 1;
  const shoulderX = side === 'left' ? 310 : 490;
  const shoulderRotation = direction * rig.shoulderOpen * 25 - direction * rig.shoulderLift * 58 - direction * rig.crossBody * 78 - drag * 12;
  const extension = 1 + rig.reach * 0.24;
  return `translate(${shoulderX} 490) rotate(${shoulderRotation}) scale(${extension}) translate(${-shoulderX} -490)`;
}

function armTransform(side: 'left' | 'right', rig: ArmRig, drag: number, constraint?: ArmConstraint) {
  return constraint && constraint.weight > 0.25 ? constrainedArmTransform(side, constraint) : naturalArmTransform(side, rig, drag);
}

function TwigArm({ side, rig, layer, drag = 0, constraint }: { side: 'left' | 'right'; rig: ArmRig; layer: 'back' | 'front'; drag?: number; constraint?: ArmConstraint }) {
  const direction = side === 'left' ? -1 : 1;
  const shoulderX = side === 'left' ? 310 : 490;
  const elbowX = side === 'left' ? 225 : 575;
  const handX = side === 'left' ? 150 : 650;
  const elbowRotation = direction * rig.elbowBend * 42;
  const fingerSpread = 14 + rig.handOpen * 38;
  const frontWeight = constraint ? 1 : clamp((rig.crossBody - 0.16) / 0.5, 0, 1);
  const opacity = layer === 'front' ? frontWeight : 1 - frontWeight;

  return (
    <g data-arm-layer={layer} data-arm-side={side} data-arm-constrained={Boolean(constraint)} opacity={opacity} transform={armTransform(side, rig, drag, constraint)}>
      <line x1={shoulderX} y1="490" x2={elbowX} y2="445" stroke="url(#olaf-live-twig)" strokeWidth="12" strokeLinecap="round" />
      <circle cx={elbowX} cy="445" r="9" fill="#75411d" />
      <g transform={`rotate(${elbowRotation} ${elbowX} 445)`}>
        <line x1={elbowX} y1="445" x2={handX} y2="405" stroke="url(#olaf-live-twig)" strokeWidth="11" strokeLinecap="round" />
        <line x1={handX} y1="405" x2={handX + direction * 38} y2={405 - fingerSpread} stroke="url(#olaf-live-twig)" strokeWidth="9" strokeLinecap="round" />
        <line x1={handX} y1="405" x2={handX + direction * 44} y2="405" stroke="url(#olaf-live-twig)" strokeWidth="9" strokeLinecap="round" />
        <line x1={handX} y1="405" x2={handX + direction * 34} y2={405 + fingerSpread} stroke="url(#olaf-live-twig)" strokeWidth="9" strokeLinecap="round" />
      </g>
    </g>
  );
}

function ObjectArtwork({ object }: { object: SceneObjectFrame }) {
  if (object.visual === 'christmas-hat') return <g data-object-artwork="christmas-hat">
    <path d="M-62 12Q-18-84 34-92Q67-74 78-40Q42-45 22-19Q4-1-10 12Z" fill="#e73348" stroke="#9f1730" strokeWidth="4" />
    <path d="M-66 6Q0-10 68 5Q75 18 65 31Q0 19-65 32Q-76 20-66 6Z" fill="#fff" stroke="#d6e9f4" strokeWidth="4" />
    <circle cx="78" cy="-39" r="22" fill="#fff" stroke="#d6e9f4" strokeWidth="4" />
  </g>;
  return <g>
    <text x="0" y="25" textAnchor="middle" fontSize={object.visualScale ?? 94} dominantBaseline="middle">{object.emoji}</text>
    {object.action === 'eat' && object.consumeProgress > 0 && <path d="M-52-28Q0-52 52-28L43 36Q0 53-43 36Z" fill="#07192a" opacity={object.consumeProgress * .9} />}
    {object.state === 'open' && <text x="0" y="-58" textAnchor="middle" fontSize="32">✨</text>}
  </g>;
}

function ObjectLabel({ object }: { object: SceneObjectFrame }) {
  const labelY = object.anchor === 'head' ? -72 : object.anchor === 'stage' ? 100 : 70;
  return <g transform={`translate(0 ${labelY})`}>
    <rect x="-58" y="-15" width="116" height="30" rx="15" fill="#112b42" opacity=".9" />
    <text textAnchor="middle" y="7" fill="#fff" fontSize="15" fontWeight="900" letterSpacing="1">{object.label}</text>
  </g>;
}

function AnchoredObject({ object }: { object: SceneObjectFrame }) {
  return <g data-stage-prop={object.kind} data-prop-anchor={object.anchor} data-object-state={object.state} opacity={object.opacity}
    transform={`translate(${object.offsetX} ${object.offsetY}) rotate(${object.rotation}) scale(${object.scale})`}>
    {object.emphasis > 0.5 && <circle r="70" fill="none" stroke="#fff4a8" strokeWidth="5" strokeDasharray="8 13" opacity={object.emphasis * 0.8} />}
    <ObjectArtwork object={object} />
    {object.anchor !== 'body' && object.state !== 'worn' && <ObjectLabel object={object} />}
    {object.anchor.includes('hand') && <path d="M-43 3Q-20-10-5 4" fill="none" stroke="#75411d" strokeWidth="7" strokeLinecap="round" />}
  </g>;
}

function HandObjects({ objects, side, rig, drag, constraint }: { objects: SceneObjectFrame[]; side: 'left' | 'right'; rig: ArmRig; drag: number; constraint?: ArmConstraint }) {
  const direction = side === 'left' ? -1 : 1;
  const shoulderX = side === 'left' ? 310 : 490;
  const elbowX = side === 'left' ? 225 : 575;
  const handX = side === 'left' ? 150 : 650;
  const elbowRotation = direction * rig.elbowBend * 42;
  return <g transform={armTransform(side, rig, drag, constraint)}>
    <g transform={`rotate(${elbowRotation} ${elbowX} 445)`}>
      {objects.map((object, index) => <g key={object.id} transform={`translate(${handX + object.offsetX + index * direction * 38} ${405 + object.offsetY})`}><AnchoredObject object={{ ...object, offsetX: 0, offsetY: 0 }} /></g>)}
    </g>
  </g>;
}

function AnchoredObjects({ props, leftArm, rightArm, armDrag }: { props: SceneObjectFrame[]; leftArm: ArmRig; rightArm: ArmRig; armDrag: number }) {
  const left = props.filter((object) => object.anchor === 'left-hand');
  const right = props.filter((object) => object.anchor === 'right-hand');
  const both = props.filter((object) => object.anchor === 'both-hands');
  const body = props.filter((object) => object.anchor === 'body');
  const stage = props.filter((object) => object.anchor === 'stage');
  const leftConstraint = findArmConstraint(props, 'left');
  const rightConstraint = findArmConstraint(props, 'right');
  return <>
    <g data-object-layer="stage">{stage.map((object) => <g key={object.id} transform="translate(400 600)"><AnchoredObject object={{ ...object, offsetX: object.offsetX, offsetY: object.offsetY }} /></g>)}</g>
    <g data-object-layer="body">{body.map((object) => <g key={object.id} transform="translate(400 400)"><AnchoredObject object={object} /></g>)}</g>
    <HandObjects objects={left} side="left" rig={leftArm} drag={armDrag} constraint={leftConstraint} />
    <HandObjects objects={right} side="right" rig={rightArm} drag={armDrag} constraint={rightConstraint} />
    <g data-object-layer="both-hands">{both.map((object) => <g key={object.id} transform={`translate(${400 + object.offsetX} ${470 + object.offsetY})`}><AnchoredObject object={{ ...object, offsetX: 0, offsetY: 0 }} /></g>)}</g>
  </>;
}

function HeadObjects({ objects }: { objects: SceneObjectFrame[] }) {
  return <>
    {objects.filter((object) => object.anchor === 'head').map((object) => <g key={object.id} transform="translate(400 126)"><AnchoredObject object={{ ...object, offsetX: 0, offsetY: 0 }} /></g>)}
    {objects.filter((object) => object.anchor === 'mouth').map((object) => <g key={object.id} transform="translate(400 340)"><AnchoredObject object={{ ...object, offsetX: 0, offsetY: 0 }} /></g>)}
  </>;
}
export default function OlafLiveCharacter({ frame, props = [], costume, size = 1, className }: OlafLiveCharacterProps) {
  const { face, eyes, head, torso, leftArm, rightArm, affect, dynamics, root, effects } = frame;
  const depthScale = 0.82 + (root.depth + 1) * 0.16;
  const screenX = root.x * 190;
  const screenY = root.depth * 64;
  const walkBob = Math.abs(root.stride) * root.travel * 16;
  const bodyX = torso.leanX * 52;
  const bodyY = torso.rise * 48 - dynamics.breath * 3 - root.elevation * 210 - walkBob;
  const bodyRotation = torso.twist * 14 + torso.leanX * 8 + root.stride * root.travel * 3.5;
  const bodyScaleX = 1 - torso.squash * 0.075;
  const bodyScaleY = 1 + torso.squash * 0.12;
  const headX = head.yaw * 46;
  const headY = head.pitch * 28;
  const headRotation = head.roll * 36;
  const pupilX = clamp(eyes.lookX * 9, -9, 9);
  const pupilY = clamp(eyes.lookY * 7, -7, 7);
  const leftEyeScaleY = Math.max(0.06, 1 + face.eyeWideLeft * 0.18 - face.eyeBlinkLeft * 0.96 - face.cheekRaiseLeft * 0.16);
  const rightEyeScaleY = Math.max(0.06, 1 + face.eyeWideRight * 0.18 - face.eyeBlinkRight * 0.96 - face.cheekRaiseRight * 0.16);
  const smileLeft = clamp(face.mouthSmileLeft, 0, 1);
  const smileRight = clamp(face.mouthSmileRight, 0, 1);
  const smile = (smileLeft + smileRight) * 0.5;
  const mouthScaleX = clamp(0.8 + face.mouthWide * 0.46 - face.mouthPucker * 0.32, 0.56, 1.28);
  const mouthScaleY = 0.18 + face.jawOpen * 1.08;
  const mouthTilt = (smileRight - smileLeft) * 10;
  const leftCheekOpacity = clamp(face.cheekRaiseLeft * 0.85, 0, 0.85);
  const rightCheekOpacity = clamp(face.cheekRaiseRight * 0.85, 0, 0.85);
  const leftBrowY = -face.browInnerUp * 7 - face.browOuterUpLeft * 5 + face.browDownLeft * 8;
  const rightBrowY = -face.browInnerUp * 7 - face.browOuterUpRight * 5 + face.browDownRight * 8;
  const snowOpacity = 0.92 + affect.valence * 0.04;
  const performanceGlow = clamp(dynamics.motionEnergy * 0.42, 0, 0.42);
  const secondaryWave = Math.sin(frame.timestampMs / 92) * dynamics.followThrough;
  const lowerDragX = -torso.leanX * dynamics.followThrough * 16;
  const lowerSquash = dynamics.actionAccent * 0.035 - dynamics.anticipation * 0.025;
  const middleX = torso.leanX * (-dynamics.anticipation * 18 + dynamics.followThrough * 13);
  const middleY = dynamics.anticipation * 10 - dynamics.actionAccent * 9 + dynamics.followThrough * 5;
  const middleRotation = -bodyRotation * dynamics.anticipation * 0.2 + bodyRotation * dynamics.followThrough * 0.3 + secondaryWave * 2.4;
  const headSecondaryX = torso.leanX * (dynamics.anticipation * 22 - dynamics.followThrough * 12);
  const headSecondaryY = dynamics.anticipation * 8 - dynamics.actionAccent * 12 + dynamics.followThrough * 7;
  const headSecondaryRotation = -bodyRotation * dynamics.anticipation * 0.32 + secondaryWave * 4.2;
  const armDrag = torso.leanX * (dynamics.anticipation - dynamics.followThrough) + secondaryWave * 0.22;
  const leftArmConstraint = findArmConstraint(props, 'left');
  const rightArmConstraint = findArmConstraint(props, 'right');
  const noseScaleX = 1 - Math.abs(head.yaw) * 0.2;
  const noseShiftX = head.yaw * 8;
  const headSquashX = 1 + dynamics.anticipation * 0.025 - dynamics.actionAccent * 0.035 + dynamics.followThrough * 0.018;
  const headSquashY = 1 - dynamics.anticipation * 0.018 + dynamics.actionAccent * 0.045 - dynamics.followThrough * 0.012;

  return (
    <div className={className} style={{ transform: `translate3d(${screenX}px, ${screenY}px, 0) scale(${size * depthScale}) rotateY(${root.heading * 24}deg)`, transformOrigin: 'center bottom' }}>
      <svg viewBox="0 0 800 900" width="320" height="360" role="img" aria-label="雪宝连续参数角色 Rig" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="olaf-live-snow" cx="38%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#fff" stopOpacity={snowOpacity} />
            <stop offset="66%" stopColor="#dff3ff" stopOpacity={snowOpacity} />
            <stop offset="100%" stopColor="#92bddb" />
          </radialGradient>
          <radialGradient id="olaf-live-coal" cx="30%" cy="25%" r="75%">
            <stop offset="0%" stopColor="#5d6672" />
            <stop offset="75%" stopColor="#172333" />
            <stop offset="100%" stopColor="#070d17" />
          </radialGradient>
          <linearGradient id="olaf-live-twig" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9a5a22" />
            <stop offset="100%" stopColor="#3c1e0d" />
          </linearGradient>
          <linearGradient id="olaf-live-carrot" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffc258" />
            <stop offset="70%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#b9380b" />
          </linearGradient>
          <radialGradient id="olaf-live-apple" cx="30%" cy="22%" r="78%"><stop offset="0%" stopColor="#ff7881" /><stop offset="68%" stopColor="#e83242" /><stop offset="100%" stopColor="#a91524" /></radialGradient>
          <filter id="olaf-live-shadow" x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur stdDeviation="13" /></filter>
          <filter id="olaf-live-glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="7" /></filter>
        </defs>

        <ellipse cx="400" cy="817" rx={180 - root.elevation * 54} ry={24 - root.elevation * 8} fill="#10223a" opacity={0.34 - root.elevation * 0.2} filter="url(#olaf-live-shadow)" />
        <circle cx="400" cy="410" r="190" fill="#67e8f9" opacity={performanceGlow} filter="url(#olaf-live-glow)" />

        <g transform={`translate(${bodyX} ${bodyY}) rotate(${bodyRotation} 400 700) translate(400 650) scale(${bodyScaleX} ${bodyScaleY}) translate(-400 -650)`}>
          <g data-body-segment="lower" transform={`translate(${lowerDragX} 0) translate(400 700) scale(${1 + lowerSquash} ${1 - lowerSquash}) translate(-400 -700)`}>
            <ellipse cx="290" cy="780" rx="35" ry="30" fill="url(#olaf-live-snow)" stroke="#8baec5" strokeWidth="2" transform={`translate(${root.stride * 24} ${Math.max(0, root.stride) * -34}) rotate(${root.stride * 13} 290 780)`} />
            <ellipse cx="510" cy="780" rx="35" ry="30" fill="url(#olaf-live-snow)" stroke="#8baec5" strokeWidth="2" transform={`translate(${-root.stride * 24} ${Math.max(0, -root.stride) * -34}) rotate(${root.stride * 13} 510 780)`} />
            <ellipse cx="400" cy="700" rx="160" ry="120" fill="url(#olaf-live-snow)" stroke="#8baec5" strokeWidth="2" />
            <ellipse cx="385" cy="660" rx="15" ry="12" fill="url(#olaf-live-coal)" />
          </g>

          <g data-body-segment="middle" transform={`translate(${middleX} ${middleY}) rotate(${middleRotation} 400 540)`}>
            <TwigArm side="left" rig={leftArm} layer="back" drag={armDrag} constraint={leftArmConstraint} />
            <TwigArm side="right" rig={rightArm} layer="back" drag={armDrag} constraint={rightArmConstraint} />

            <ellipse data-body-layer="torso" cx="400" cy="500" rx="110" ry="90" fill="url(#olaf-live-snow)" stroke="#8baec5" strokeWidth="2" />
            {costume?.visual === 'diving-suit' && <g data-character-costume={costume.id} pointerEvents="none">
              <path d="M310 486Q400 440 490 486L482 552Q400 586 318 552Z" fill="#0e5575" opacity=".9" stroke={costume.accent ?? '#ffd166'} strokeWidth="8" />
              <rect x="365" y="466" width="70" height="42" rx="14" fill="#15364c" stroke="#8de5ff" strokeWidth="4" />
              <circle cx="385" cy="487" r="7" fill="#63e6be" /><circle cx="415" cy="487" r="7" fill="#ffd166" />
            </g>}
            {costume?.visual === 'explorer' && <g data-character-costume={costume.id} pointerEvents="none"><path d="M315 475Q400 445 485 475L475 552Q400 578 325 552Z" fill="#b98245" stroke="#f4d58d" strokeWidth="7" /><path d="M400 457V564" stroke="#6b4423" strokeWidth="8" /><rect x="335" y="500" width="42" height="34" rx="7" fill="#e7b66b" /><rect x="423" y="500" width="42" height="34" rx="7" fill="#e7b66b" /></g>}
            {costume?.visual === 'space-suit' && <g data-character-costume={costume.id} pointerEvents="none"><path d="M310 482Q400 440 490 482L480 558Q400 590 320 558Z" fill="#e9f4ff" stroke="#62cce8" strokeWidth="8" /><rect x="350" y="474" width="100" height="48" rx="15" fill="#263d73" /><circle cx="374" cy="497" r="7" fill="#63e6be" /><circle cx="400" cy="497" r="7" fill="#ffd166" /><circle cx="426" cy="497" r="7" fill="#ff7b8f" /></g>}
            <ellipse cx="385" cy="455" rx="10" ry="10" fill="url(#olaf-live-coal)" />
            <ellipse cx="385" cy="525" rx="10" ry="8" fill="url(#olaf-live-coal)" />

            <TwigArm side="left" rig={leftArm} layer="front" drag={armDrag} constraint={leftArmConstraint} />
            <TwigArm side="right" rig={rightArm} layer="front" drag={armDrag} constraint={rightArmConstraint} />
            <AnchoredObjects props={props} leftArm={leftArm} rightArm={rightArm} armDrag={armDrag} />
          </g>

          <g data-body-segment="head" transform={`translate(${headX + headSecondaryX} ${headY + headSecondaryY}) rotate(${headRotation + headSecondaryRotation} 400 300) translate(400 285) scale(${headSquashX} ${headSquashY}) translate(-400 -285)`}>
            <path d="M315 260C270 200 310 110 400 110s130 90 85 150c-20 35-10 95-35 115-30 30-70 30-100 0-25-20-15-80-35-115Z" fill="url(#olaf-live-snow)" stroke="#8baec5" strokeWidth="2.5" />
            <g stroke="url(#olaf-live-twig)" strokeWidth="8" strokeLinecap="round" transform={`rotate(${secondaryWave * 5} 400 115)`}>
              <line x1="400" y1="115" x2="360" y2="40" /><line x1="400" y1="115" x2="405" y2="25" /><line x1="400" y1="115" x2="435" y2="45" />
            </g>
            <HeadObjects objects={props} />

            <g>
              <ellipse cx="360" cy="205" rx="22" ry="26" fill="#fff" stroke="#172333" strokeWidth="2" transform={`translate(0 205) scale(1 ${leftEyeScaleY}) translate(0 -205)`} />
              <ellipse cx={360 + pupilX} cy={205 + pupilY} rx="10" ry="12" fill="#050b14" transform={`translate(0 205) scale(1 ${leftEyeScaleY}) translate(0 -205)`} />
              <circle cx={357 + pupilX} cy={200 + pupilY} r="3.5" fill="#fff" opacity={leftEyeScaleY} />
            </g>
            <g fill="#78d9ff">
              <path d={`M355 230c-8 14-10 ${25 + effects.tearFlow * 28}-1 ${36 + effects.tearFlow * 34} 12-8 10-24 1-36Z`} opacity={effects.tearLeft} />
              <path d={`M435 230c-7 13-9 ${23 + effects.tearFlow * 25} 0 ${34 + effects.tearFlow * 31} 12-8 10-23 0-34Z`} opacity={effects.tearRight} />
            </g>
            <g>
              <ellipse cx="440" cy="205" rx="22" ry="26" fill="#fff" stroke="#172333" strokeWidth="2" transform={`translate(0 205) scale(1 ${rightEyeScaleY}) translate(0 -205)`} />
              <ellipse cx={440 + pupilX} cy={205 + pupilY} rx="10" ry="12" fill="#050b14" transform={`translate(0 205) scale(1 ${rightEyeScaleY}) translate(0 -205)`} />
              <circle cx={437 + pupilX} cy={200 + pupilY} r="3.5" fill="#fff" opacity={rightEyeScaleY} />
            </g>
            <path d="M335 175Q360 170 380 180" fill="none" stroke="#4a2610" strokeWidth="7" strokeLinecap="round" transform={`translate(0 ${leftBrowY}) rotate(${face.browOuterUpLeft * -8} 360 175)`} />
            <path d="M465 175Q440 170 420 180" fill="none" stroke="#4a2610" strokeWidth="7" strokeLinecap="round" transform={`translate(0 ${rightBrowY}) rotate(${face.browOuterUpRight * 8} 440 175)`} />

            <g transform={`translate(${noseShiftX} 0) translate(400 260) scale(${noseScaleX} 1) translate(-400 -260)`}>
              <path d="M395 240Q400 220 410 240l80 20q20 10 0 20l-85-10Z" fill="url(#olaf-live-carrot)" stroke="#ea580c" strokeWidth="1.5" />
              <g stroke="#9a3412" strokeWidth="2" strokeLinecap="round"><line x1="420" y1="248" x2="415" y2="264" /><line x1="440" y1="252" x2="435" y2="268" /><line x1="460" y1="257" x2="455" y2="273" /></g>
            </g>

            <ellipse cx="330" cy="265" rx="23" ry="11" fill="#fb7185" opacity={leftCheekOpacity} />
            <ellipse cx="470" cy="265" rx="23" ry="11" fill="#fb7185" opacity={rightCheekOpacity} />
            <g transform={`translate(400 338) rotate(${mouthTilt}) scale(${mouthScaleX} ${mouthScaleY}) translate(-400 -338)`}>
              <path d="M340 310C355 318 380 320 400 318c20 2 45 0 60-8 10 55-130 55-120 0Z" fill="#0d1726" stroke="#172333" strokeWidth="2" />
              <path d={`M370 ${344 - smile * 5}c0 0 30-20 60 0-20 20-40 20-60 0Z`} fill="#fda4af" />
              <path d="M385 311h30l-3 17c0 4-24 4-24 0Z" fill="#fff" />
            </g>
            {costume?.visual === 'diving-suit' && <g data-character-headgear={costume.id} pointerEvents="none">
              <circle cx="400" cy="250" r="151" fill="rgba(155,231,255,.08)" stroke="#8de5ff" strokeWidth="12" />
              <path d="M286 159Q400 72 514 159" fill="none" stroke={costume.accent ?? '#ffd166'} strokeWidth="12" strokeLinecap="round" />
              <rect x="318" y="183" width="164" height="58" rx="29" fill="rgba(15,63,84,.16)" stroke="#ffd166" strokeWidth="8" />
              <path d="M400 185V240" stroke="#ffd166" strokeWidth="6" />
            </g>}
            {costume?.visual === 'explorer' && <g data-character-headgear={costume.id} pointerEvents="none"><path d="M300 150Q400 70 500 150L475 178H325Z" fill="#d7a65e" stroke="#6b4423" strokeWidth="7" /><ellipse cx="400" cy="171" rx="135" ry="22" fill="#edc77f" stroke="#6b4423" strokeWidth="7" /></g>}
            {costume?.visual === 'space-suit' && <g data-character-headgear={costume.id} pointerEvents="none"><circle cx="400" cy="250" r="153" fill="rgba(190,230,255,.08)" stroke="#d9f4ff" strokeWidth="13" /><path d="M287 157Q400 70 513 157" fill="none" stroke="#62cce8" strokeWidth="10" /></g>}
          </g>
        </g>
      </svg>
    </div>
  );
}
