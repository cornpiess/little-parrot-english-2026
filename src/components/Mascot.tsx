import { useMemo } from 'react';
import ParrotCharacter from './ParrotCharacter';
import FoxCharacter from './FoxCharacter';
import OlafCharacter from './OlafCharacter';
import DinoCharacter from './DinoCharacter';
import type { MascotState } from './ParrotCharacter';

// ============================================================
// Mascot：任意角色（小鹦鹉 / 小狐狸 / 雪宝 / 小恐龙）的统一入口。
// 产品特色是「不同角色带领幼儿学习」——本组件根据
// localStorage('selected_character') 或显式 character 属性
// 渲染对应角色，四个角色共用同一套 ParrotState 动作。
// ============================================================

export type MascotId = 'parrot' | 'fox' | 'olaf' | 'dino';

const MASCOT_NAMES: Record<MascotId, string> = {
  parrot: '小鹦鹉',
  fox: '小狐狸',
  olaf: '雪宝',
  dino: '小恐龙',
};

export function getMascotId(): MascotId {
  const saved = typeof window !== 'undefined' ? localStorage.getItem('selected_character') : null;
  if (saved === 'fox' || saved === 'olaf' || saved === 'dino') return saved;
  return 'parrot';
}

export function getMascotName(id?: MascotId): string {
  return MASCOT_NAMES[id ?? getMascotId()];
}

interface MascotProps {
  state: MascotState;
  size?: number;
  character?: MascotId;
  onWakeUp?: () => void;
  held?: string;    // 手里拿的物体（鹦鹉翅膀/狐狸爪子/雪宝树枝手都支持）
  looking?: boolean; // 是否看幼儿（眼睛追踪）
}

export default function Mascot({ state, size = 1, character, onWakeUp, held, looking = true }: MascotProps) {
  const id = useMemo<MascotId>(() => character ?? getMascotId(), [character]);
  if (id === 'fox') return <FoxCharacter state={state} size={size} onWakeUp={onWakeUp} held={held} looking={looking} />;
  if (id === 'olaf') return <OlafCharacter state={state} size={size} held={held} looking={looking} />;
  if (id === 'dino') return <DinoCharacter state={state} size={size} onWakeUp={onWakeUp} held={held} looking={looking} />;
  return <ParrotCharacter state={state} size={size} onWakeUp={onWakeUp} held={held} looking={looking} />;
}
