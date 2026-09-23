// 角色与动态世界实验台（研究线①②）—— 纯逻辑引擎，无 React、无真实时钟、无随机数。
// 目标：同一份固定输入脚本（复用 Olaf 栈的 PerformanceInput 契约）驱动不同实现，
// 产出可回放的时间线（输入 / 角色动作意图 / 世界状态变化 / 实际输出），供跨技术比较。
//
// 复用的公开接口（均为只读依赖，不修改 olaf-live 任何文件）：
//  · createRealtimePerformanceModel（performanceModel.ts）：PerformanceInput → CharacterRigFrame，确定性
//  · perceptionToInputs（actionDirector.ts）：孩子的感知事件 → PerformanceInput
//  · deliveryForObjective（characterSpeech.ts）：戏剧目标 → 语音表达参数
// 实验台自己的边界（记录在案的小接口，来自真实变化点）：
//  · 持久世界位置属于本引擎的世界层——olaf 模型的 root 位移是"临时偏移"（过期衰减回原点），
//    不是持久位置；所以渲染位置以世界层为准，模型帧提供姿态/表情/步态/视线。
//  · 物体关系沿用内容仓库的词汇：surface / hand。
import type { CharacterRigFrame, PerformanceInput } from '../olaf-live/rig';
import { createRealtimePerformanceModel } from '../olaf-live/performanceModel';
import { perceptionToInputs } from '../olaf-live/actionDirector';
import { deliveryForObjective } from '../olaf-live/characterSpeech';
import type { PerceptionEvent } from '../olaf-live/types';

export const STAGE = { width: 960, height: 540 } as const;
export const TICK_MS = 100;
export const MOVE_SPEED_PX_PER_S = 230;

export type CharacterId = 'char-a' | 'char-b';
export type ObjectId = 'object-1' | 'object-2';
export type SceneId = 'scene-1-morning-mat' | 'scene-2-sky-deck';

export interface Vec2 { x: number; y: number }

export interface SceneDef {
  id: SceneId;
  backdrop: string;   // 几何占位：背景色块
  ground: string;
  anchors: { table: Vec2; shelf: Vec2; matA: Vec2; matB: Vec2 };
}

export const SCENES: Record<SceneId, SceneDef> = {
  'scene-1-morning-mat': {
    id: 'scene-1-morning-mat', backdrop: '#eef4ff', ground: '#d7e0f0',
    anchors: { table: { x: 480, y: 380 }, shelf: { x: 760, y: 240 }, matA: { x: 300, y: 300 }, matB: { x: 640, y: 310 } },
  },
  'scene-2-sky-deck': {
    id: 'scene-2-sky-deck', backdrop: '#14203a', ground: '#27365c',
    anchors: { table: { x: 430, y: 400 }, shelf: { x: 560, y: 280 }, matA: { x: 360, y: 320 }, matB: { x: 640, y: 360 } },
  },
};

export interface ObjectState {
  id: ObjectId;
  shape: 'circle' | 'square';
  relation: { kind: 'surface'; anchor: 'table' | 'shelf' } | { kind: 'hand'; holder: CharacterId };
  label: string;
}

export interface WorldState {
  scene: SceneId;
  characters: Record<CharacterId, { position: Vec2; locomotionTarget: Vec2 | null; pendingPlace: boolean }>;
  objects: Record<ObjectId, ObjectState>;
}

export type TimelineKind = 'input' | 'intent' | 'state' | 'output' | 'interrupt';

export interface TimelineEntry {
  seq: number;
  tMs: number;
  kind: TimelineKind;
  actor: CharacterId | 'child' | 'world';
  label: string;
  data?: unknown;
}

export interface Keyframe {
  name: string;
  tMs: number;
  caption: string;
  world: WorldState;
  frames: Record<CharacterId, CharacterRigFrame>;
  positionSample: Record<CharacterId, Vec2>;
}

export interface WorldRigResult {
  entries: TimelineEntry[];
  keyframes: Keyframe[];
  positionTrack: { tMs: number; scene: SceneId; charA: Vec2; charB: Vec2; holdObjectId: ObjectId | null }[];
  finalWorld: WorldState;
  summary: { ticks: number; durationMs: number; entries: number; inputs: number; interrupts: number; sceneChanges: number };
}

const OBJECT_BASE: Record<ObjectId, ObjectState> = {
  'object-1': { id: 'object-1', shape: 'circle', relation: { kind: 'surface', anchor: 'table' }, label: '占位球' },
  'object-2': { id: 'object-2', shape: 'square', relation: { kind: 'surface', anchor: 'table' }, label: '占位块' },
};

// 物体在当前场景中的渲染位置（hand 关系时贴持有者）
export function objectAnchor(world: WorldState, id: ObjectId): Vec2 {
  const object = world.objects[id];
  if (object.relation.kind === 'hand') {
    const holder = world.characters[object.relation.holder].position;
    return { x: holder.x + 26, y: holder.y - 46 };
  }
  const base = SCENES[world.scene].anchors[object.relation.anchor];
  return id === 'object-1' ? { x: base.x - 26, y: base.y - 22 } : { x: base.x + 26, y: base.y - 22 };
}

// —— 固定实验脚本（无故事）：阶段时长全部显式，不依赖真实时钟 ——
const PHASES = {
  idle: 600,
  speakListen: 1600,
  look: 600,
  move: 2000,
  take: 800,
  interrupt: 1200,
  sceneChange: 1000,
  place: 1800,
} as const;
export const SCRIPT_TOTAL_MS = Object.values(PHASES).reduce((a, b) => a + b, 0);

const t2 = (a: number, b: number) => a + b;
const T_IDLE_END = PHASES.idle;
const T_SPEAK_END = t2(T_IDLE_END, PHASES.speakListen);
const T_LOOK_END = t2(T_SPEAK_END, PHASES.look);
const T_MOVE_END = t2(T_LOOK_END, PHASES.move);
const T_TAKE_END = t2(T_MOVE_END, PHASES.take);
const T_INTERRUPT_AT = t2(T_TAKE_END, 200);            // 打断发生在打断阶段开始后 200ms
const T_INTERRUPT_END = t2(T_TAKE_END, PHASES.interrupt);
const T_SCENE_END = t2(T_INTERRUPT_END, PHASES.sceneChange);
const T_END = t2(T_SCENE_END, PHASES.place);

const clampStep = (from: number, to: number, maxStep: number) => {
  const delta = to - from;
  return from + Math.sign(delta) * Math.min(Math.abs(delta), maxStep);
};

/**
 * 运行一次完整的固定实验。纯函数：同样的调用得到逐字节一致的结果（重放一致性由测试保证）。
 * 两个角色各持一个 RealtimePerformanceModel；世界层负责持久位置与物体关系。
 */
export function runWorldRigExperiment(): WorldRigResult {
  const entries: TimelineEntry[] = [];
  const positionTrack: WorldRigResult['positionTrack'] = [];
  const keyframes: Keyframe[] = [];
  let seq = 0;
  const log = (tMs: number, kind: TimelineKind, actor: TimelineEntry['actor'], label: string, data?: unknown) => {
    entries.push({ seq: seq++, tMs, kind, actor, label, data });
  };

  const world: WorldState = {
    scene: 'scene-1-morning-mat',
    characters: {
      'char-a': { position: { ...SCENES['scene-1-morning-mat'].anchors.matA }, locomotionTarget: null, pendingPlace: false },
      'char-b': { position: { ...SCENES['scene-1-morning-mat'].anchors.matB }, locomotionTarget: null, pendingPlace: false },
    },
    objects: structuredClone(OBJECT_BASE),
  };

  const modelA = createRealtimePerformanceModel();
  const modelB = createRealtimePerformanceModel();
  const issue = (who: CharacterId, tMs: number, input: PerformanceInput, label: string) => {
    (who === 'char-a' ? modelA : modelB).ingest(input);
    log(tMs, 'intent', who, label, input);
  };

  const childTap: PerceptionEvent = { type: 'hand', confidence: 0.9, x: 0.55, y: 0.3, gesture: 'wave', timestamp: T_INTERRUPT_AT };
  const interruptInputs = perceptionToInputs(childTap, T_INTERRUPT_AT); // 复用：孩子的感知事件 → 表演输入

  const keyframe = (name: string, tMs: number, caption: string): Keyframe => ({
    name, tMs, caption,
    world: structuredClone(world),
    frames: { 'char-a': structuredClone(frameA!), 'char-b': structuredClone(frameB!) },
    positionSample: { 'char-a': { ...world.characters['char-a'].position }, 'char-b': { ...world.characters['char-b'].position } },
  });

  let frameA: CharacterRigFrame | null = null;
  let frameB: CharacterRigFrame | null = null;
  let fired = { speak: false, look: false, move: false, take: false, interrupt: false, scene: false, placeMove: false, place: false, idleA: false, idleB: false };
  let speechDelivery: ReturnType<typeof deliveryForObjective> | null = null;

  log(0, 'input', 'world', 'experiment-start（固定脚本，无故事）', { totalMs: T_END, tickMs: TICK_MS });

  for (let tMs = 0; tMs <= T_END; tMs += TICK_MS) {
    // —— 阶段边界触发（每条都记录 input/intent/state）——
    if (tMs === T_IDLE_END - TICK_MS) keyframes.push(keyframe('k1-idle', tMs, '基线：双角色待机'));

    if (tMs === T_IDLE_END && !fired.speak) {
      fired.speak = true;
      log(tMs, 'input', 'world', 'phase: A 说话 / B 倾听（占位语音）');
      speechDelivery = deliveryForObjective('invite');
      issue('char-a', tMs, { type: 'presence', atMs: tMs, presence: 'speaking' }, 'A: presence=speaking');
      issue('char-a', tMs, { type: 'voice', atMs: tMs, features: { speaking: true, energy: 0.6, brightness: 0.66, emphasis: 0.5 } }, 'A: voice(占位 tone:invite)');
      issue('char-b', tMs, { type: 'presence', atMs: tMs, presence: 'listening' }, 'B: presence=listening');
      issue('char-b', tMs, { type: 'attention', atMs: tMs, target: { focus: 'user', x: 0, y: 0, depth: 0.72 } }, 'B: attention→user');
    }
    if (tMs === T_SPEAK_END - 500) keyframes.push(keyframe('k2-speak-listen', tMs, 'A 说话（占位台词 …）/ B 倾听'));

    if (tMs === T_SPEAK_END && !fired.look) {
      fired.look = true;
      log(tMs, 'input', 'world', 'phase: A 看向目标物体');
      const target = objectAnchor(world, 'object-1');
      issue('char-a', tMs, { type: 'attention', atMs: tMs, target: { focus: 'object', x: (target.x / STAGE.width) * 2 - 1, y: (target.y / STAGE.height) * 2 - 1, depth: 0.55 } }, 'A: attention→object-1');
    }
    if (tMs === T_LOOK_END - 200) keyframes.push(keyframe('k3-look', tMs, 'A 看向占位球'));

    if (tMs === T_LOOK_END && !fired.move) {
      fired.move = true;
      log(tMs, 'input', 'world', 'phase: A 移动到物体');
      const target = objectAnchor(world, 'object-1');
      world.characters['char-a'].locomotionTarget = { ...target };
      log(tMs, 'state', 'world', 'A: locomotionTarget→object-1', { target: { ...target } });
      issue('char-a', tMs, { type: 'locomotion', atMs: tMs, target: { x: 0.32, depth: 0.55, heading: 0 }, travel: 0.62, jump: 0.05, holdMs: PHASES.move }, 'A: locomotion(朝 object-1)');
    }
    if (tMs === T_MOVE_END - 500) keyframes.push(keyframe('k4-move', tMs, 'A 移动中（模型提供步态/姿态）'));

    if (tMs === T_MOVE_END && !fired.take) {
      fired.take = true;
      log(tMs, 'input', 'world', 'phase: A 接触并拿起物体');
      issue('char-a', tMs, { type: 'direction', atMs: tMs, objective: 'discover', intensity: 0.6, holdMs: PHASES.take }, 'A: direction=discover(伸手)');
    }
    if (tMs === T_TAKE_END && world.objects['object-1'].relation.kind === 'surface') {
      world.objects['object-1'].relation = { kind: 'hand', holder: 'char-a' };
      world.characters['char-a'].locomotionTarget = null;
      world.characters['char-a'].pendingPlace = true; // 拿起后本打算去放置，等待被打断
      log(T_TAKE_END, 'state', 'char-a', 'object-1: surface(table)→hand(char-a)；pendingPlace=true');
    }
    if (tMs === T_TAKE_END + TICK_MS && world.objects['object-1'].relation.kind === 'hand') {
      keyframes.push(keyframe('k5-take', tMs, 'A 拿起占位球（关系=hand）'));
    }

    if (tMs === T_INTERRUPT_AT && !fired.interrupt) {
      fired.interrupt = true;
      log(tMs, 'interrupt', 'child', '孩子点击 object-2（打断）', { childTap, deferred: 'A 的放置动作被推迟' });
      for (const input of interruptInputs) issue('char-a', tMs, input, 'A: perception(hand/wave)→身体回应（复用 actionDirector）');
      const target = objectAnchor(world, 'object-2');
      issue('char-a', tMs, { type: 'attention', atMs: tMs, target: { focus: 'object', x: (target.x / STAGE.width) * 2 - 1, y: (target.y / STAGE.height) * 2 - 1, depth: 0.5 } }, 'A: attention→object-2(孩子所指)');
      issue('char-b', tMs, { type: 'presence', atMs: tMs, presence: 'speaking' }, 'B: presence=speaking(回应孩子)');
      issue('char-b', tMs, { type: 'voice', atMs: tMs, features: { speaking: true, energy: 0.5, brightness: 0.6, emphasis: 0.42 } }, 'B: voice(占位 tone:ack)');
      log(tMs, 'state', 'world', '打断后状态：object-1 仍在 A 手中；A 无移动目标；pendingPlace 保持 true', {
        object1: structuredClone(world.objects['object-1'].relation),
        locomotionTarget: world.characters['char-a'].locomotionTarget,
        pendingPlace: world.characters['char-a'].pendingPlace,
      });
    }
    if (tMs === T_INTERRUPT_END - 200) keyframes.push(keyframe('k6-interrupt', tMs, '打断：A 转向孩子所指，B 回应'));

    if (tMs === T_INTERRUPT_END && !fired.scene) {
      fired.scene = true;
      log(tMs, 'input', 'world', 'phase: 场景变化 scene-1→scene-2');
      world.scene = 'scene-2-sky-deck';
      world.characters['char-a'].position = { ...SCENES['scene-2-sky-deck'].anchors.matA };
      world.characters['char-b'].position = { ...SCENES['scene-2-sky-deck'].anchors.matB };
      log(tMs, 'state', 'world', 'scene=scene-2-sky-deck；双角色重定位到新锚点；object-2→mat，object-1 随 A', {
        scene: world.scene,
        object1: structuredClone(world.objects['object-1'].relation),
      });
    }
    if (tMs === T_SCENE_END - 200) keyframes.push(keyframe('k7-scene2', tMs, '场景 2：天空甲板（几何占位）'));

    if (tMs === T_SCENE_END && !fired.placeMove && world.characters['char-a'].pendingPlace) {
      fired.placeMove = true;
      log(tMs, 'input', 'world', 'phase: A 移动到架子放置物体（恢复被打断的意图）');
      const shelf = SCENES[world.scene].anchors.shelf;
      world.characters['char-a'].locomotionTarget = { ...shelf };
      log(tMs, 'state', 'char-a', 'A: locomotionTarget→shelf(scene-2)', { target: { ...shelf } });
      issue('char-a', tMs, { type: 'locomotion', atMs: tMs, target: { x: 0.5, depth: 0.35, heading: 0 }, travel: 0.5, jump: 0.02, holdMs: 1200 }, 'A: locomotion(朝 shelf)');
    }
    if (T_SCENE_END < tMs && world.objects['object-1'].relation.kind === 'hand' && world.characters['char-a'].locomotionTarget === null && !fired.place) {
      fired.place = true;
      world.objects['object-1'].relation = { kind: 'surface', anchor: 'shelf' };
      world.characters['char-a'].pendingPlace = false;
      issue('char-a', tMs, { type: 'direction', atMs: tMs, objective: 'reassure', intensity: 0.45, holdMs: 900 }, 'A: direction=reassure(放下)');
      log(tMs, 'state', 'char-a', 'object-1: hand→surface(shelf)；pendingPlace=false', { scene: world.scene });
    }
    if (tMs === T_END - 200 && !fired.idleA) {
      fired.idleA = true;
      issue('char-a', tMs, { type: 'presence', atMs: tMs, presence: 'idle' }, 'A: presence=idle(回到待机)');
      issue('char-b', tMs, { type: 'presence', atMs: tMs, presence: 'idle' }, 'B: presence=idle(回到待机)');
      log(tMs, 'state', 'world', '双角色回到待机', { object1: structuredClone(world.objects['object-1'].relation) });
    }
    if (tMs === T_END) keyframes.push(keyframe('k8-idle-end', tMs, '结束：物体在架子上，双角色待机'));

    // —— 每步推进（世界层固定速度位移 + 模型帧）——
    for (const id of ['char-a', 'char-b'] as CharacterId[]) {
      const character = world.characters[id];
      if (character.locomotionTarget) {
        const step = (MOVE_SPEED_PX_PER_S * TICK_MS) / 1000;
        const next = { x: clampStep(character.position.x, character.locomotionTarget.x, step), y: clampStep(character.position.y, character.locomotionTarget.y, step) };
        const arrived = Math.abs(next.x - character.locomotionTarget.x) < 2 && Math.abs(next.y - character.locomotionTarget.y) < 2;
        character.position = arrived ? { ...character.locomotionTarget } : next;
        if (arrived) {
          log(tMs, 'state', id, `${id}: 到达移动目标`, { at: { ...character.position } });
          character.locomotionTarget = null;
        }
      }
    }
    frameA = modelA.advance(tMs);
    frameB = modelB.advance(tMs);
    positionTrack.push({
      tMs, scene: world.scene,
      charA: { ...world.characters['char-a'].position }, charB: { ...world.characters['char-b'].position },
      holdObjectId: world.objects['object-1'].relation.kind === 'hand' ? 'object-1' : null,
    });
  }

  log(T_END, 'input', 'world', 'experiment-end', {
    speechDeliveryUsed: speechDelivery,
    placeholderLine: '…（tone:invite，占位，非台词）',
  });

  return {
    entries,
    keyframes,
    positionTrack,
    finalWorld: structuredClone(world),
    summary: {
      ticks: positionTrack.length,
      durationMs: T_END,
      entries: entries.length,
      inputs: entries.filter(e => e.kind === 'input').length,
      interrupts: entries.filter(e => e.kind === 'interrupt').length,
      sceneChanges: entries.filter(e => e.label.includes('scene-1→scene-2')).length,
    },
  };
}

// —— 断言辅助：把时间线压成行为序列（标签已含角色前缀），用于顺序检查 ——
export function behaviorOutline(result: WorldRigResult): string[] {
  return result.entries
    .filter(e => e.kind === 'intent' || e.kind === 'interrupt' || e.kind === 'state')
    .map(e => (e.kind === 'interrupt' ? 'interrupt(child→object-2)' : e.label))
    .filter(label =>
      /presence=|attention→|locomotion|direction=|object-1:|到达|interrupt|打断后状态|scene=|双角色回到待机/.test(label),
    );
}

// 供渲染层/导出用的紧凑轨迹（去掉每帧大对象，保留关键帧与位置轨）
export function compactTrace(result: WorldRigResult) {
  return {
    version: 1,
    generatedBy: 'world-rig-baseline-1（复用 olaf performanceModel/actionDirector/characterSpeech）',
    summary: result.summary,
    entries: result.entries,
    positionTrackSampled: result.positionTrack.filter((_, i) => i % 3 === 0 || i === result.positionTrack.length - 1),
    keyframes: result.keyframes.map(k => ({
      name: k.name, tMs: k.tMs, caption: k.caption,
      positionSample: k.positionSample,
      world: k.world,
      presence: { 'char-a': k.frames['char-a'].presence, 'char-b': k.frames['char-b'].presence },
      gaze: { 'char-a': k.frames['char-a'].eyes, 'char-b': k.frames['char-b'].eyes },
      jaw: { 'char-a': k.frames['char-a'].face.jawOpen, 'char-b': k.frames['char-b'].face.jawOpen },
    })),
  };
}
