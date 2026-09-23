// 几何占位渲染器：只消费 worldRig 的输出（世界状态 + 角色帧），不含任何角色美术。
// 刻意保持"哑"渲染：未来换 Canvas/WebGL/3D 引擎时，本文件即被替换对象，输入契约不变。
import type { CharacterRigFrame } from '../olaf-live/rig';
import { STAGE, objectAnchor, SCENES } from './worldRig';
import type { WorldState, CharacterId, Keyframe } from './worldRig';

interface StageProps {
  world: WorldState;
  frames: Record<CharacterId, CharacterRigFrame>;
}

const stage = STAGE;

function PlaceholderCharacter({ id, frame, position }: { id: CharacterId; frame: CharacterRigFrame; position: { x: number; y: number } }) {
  const lookX = frame.eyes.lookX * 7;
  const lookY = frame.eyes.lookY * 5;
  const lean = frame.torso.leanX * 8;
  const breathe = frame.dynamics.breath * 3;
  const jaw = 2 + frame.face.jawOpen * 10;
  const reachL = 14 + frame.leftArm.reach * 22;
  const reachR = 14 + frame.rightArm.reach * 22;
  const hue = id === 'char-a' ? 205 : 150;
  return (
    <g transform={`translate(${position.x} ${position.y})`} data-character={id} aria-label={`${id} 占位角色`}>
      {/* 身体：几何占位 */}
      <rect x={-26} y={-58 - breathe} width={52} height={58} rx={14} fill={`hsl(${hue} 55% 62%)`} transform={`rotate(${lean})`} />
      {/* 头：几何占位 */}
      <circle cx={0} cy={-72 - breathe} r={20} fill={`hsl(${hue} 60% 78%)`} />
      {/* 视线：眼睛偏移（看向目标） */}
      <circle cx={-7 + lookX} cy={-74 - breathe + lookY} r={2.6} fill="#1f2937" />
      <circle cx={7 + lookX} cy={-74 - breathe + lookY} r={2.6} fill="#1f2937" />
      {/* 嘴：jawOpen 驱动（说话占位） */}
      <rect x={-6 + lookX * 0.4} y={-66 - breathe} width={12} height={jaw} rx={3} fill="#374151" />
      {/* 手臂：reach 驱动 */}
      <line x1={-22} y1={-44} x2={-22 - reachL} y2={-18} stroke={`hsl(${hue} 45% 45%)`} strokeWidth={6} strokeLinecap="round" />
      <line x1={22} y1={-44} x2={22 + reachR} y2={-18} stroke={`hsl(${hue} 45% 45%)`} strokeWidth={6} strokeLinecap="round" />
      {/* 身份标签 */}
      <text x={0} y={16} textAnchor="middle" fontSize={11} fill="#475569" fontFamily="monospace">{id}</text>
      {/* 状态徽标 */}
      <text x={0} y={-98 - breathe} textAnchor="middle" fontSize={10} fill="#64748b" fontFamily="monospace">{frame.presence}</text>
    </g>
  );
}

export default function PlaceholderStage({ world, frames }: StageProps) {
  const scene = SCENES[world.scene];
  return (
    <svg viewBox={`0 0 ${stage.width} ${stage.height}`} width="100%" role="img" aria-label="角色与动态世界实验台（几何占位）" style={{ display: 'block', background: scene.backdrop }}>
      <rect x={0} y={stage.height - 160} width={stage.width} height={160} fill={scene.ground} />
      {/* 场景锚点：桌子 / 架子（几何占位） */}
      <rect x={scene.anchors.table.x - 90} y={scene.anchors.table.y - 14} width={180} height={14} rx={4} fill="#94a3b8" data-anchor="table" />
      <text x={scene.anchors.table.x} y={scene.anchors.table.y + 22} textAnchor="middle" fontSize={10} fill="#64748b" fontFamily="monospace">table</text>
      <rect x={scene.anchors.shelf.x - 60} y={scene.anchors.shelf.y - 14} width={120} height={14} rx={4} fill="#cbd5e1" data-anchor="shelf" />
      <text x={scene.anchors.shelf.x} y={scene.anchors.shelf.y + 22} textAnchor="middle" fontSize={10} fill="#64748b" fontFamily="monospace">shelf</text>
      {/* 物体：几何占位；hand 关系时贴持有者 */}
      {(Object.keys(world.objects) as Array<keyof typeof world.objects>).map(id => {
        const object = world.objects[id];
        const at = objectAnchor(world, id);
        return object.shape === 'circle' ? (
          <circle key={id} cx={at.x} cy={at.y} r={13} fill="#f59e0b" data-object={id} data-relation={object.relation.kind} />
        ) : (
          <rect key={id} x={at.x - 11} y={at.y - 11} width={22} height={22} rx={4} fill="#34d399" data-object={id} data-relation={object.relation.kind} />
        );
      })}
      <PlaceholderCharacter id="char-a" frame={frames['char-a']} position={world.characters['char-a'].position} />
      <PlaceholderCharacter id="char-b" frame={frames['char-b']} position={world.characters['char-b'].position} />
      <text x={12} y={20} fontSize={12} fill="#64748b" fontFamily="monospace">{world.scene} · 无故事几何占位</text>
    </svg>
  );
}

// 供回放条使用的关键帧刻度导出
export function keyframeMarks(keyframes: Keyframe[]) {
  return keyframes.map(k => ({ name: k.name, tMs: k.tMs, caption: k.caption }));
}
