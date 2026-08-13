import Mascot, { getMascotId, type MascotId } from './Mascot';
import type { MascotState } from './ParrotCharacter';

type CharacterState = MascotState;

interface AICharacterProps {
  state: CharacterState;
  size?: number;
  onWakeUp?: () => void;
  character?: MascotId;
  held?: string;
  looking?: boolean;
}

/**
 * Wrapper that renders any mascot (parrot/fox/olaf/dino) based on the
 * `character` prop or localStorage('selected_character').
 *
 * 注意：不用 useMemo 缓存角色 id。AITeacherMode 会在渲染期间同步写入
 * localStorage（首帧就需要正确角色），若这里缓存，切换角色后不会刷新。
 */
export default function AICharacter({ state, size, onWakeUp, character, held, looking }: AICharacterProps) {
  const id: MascotId = character ?? getMascotId();
  return <Mascot state={state} size={size} onWakeUp={onWakeUp} character={id} held={held} looking={looking} />;
}

export function getCharacterName(): string {
  const names: Record<string, string> = {
    parrot: '小鹦鹉', fox: '小狐狸', olaf: '雪宝', dino: '小恐龙',
    einstein: '爱因斯坦', beethoven: '贝多芬', deer: '小鹿姐姐',
    allen: 'Allen', harry: 'Harry', xizi: 'Xizi',
    bull: 'Bull', bred: 'Bred', coco: 'Coco',
  };
  return names[getMascotId()] || '小鹦鹉';
}
