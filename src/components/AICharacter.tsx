import { useMemo } from 'react';
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
 */
export default function AICharacter({ state, size, onWakeUp, character, held, looking }: AICharacterProps) {
  const id = useMemo<MascotId>(() => character ?? getMascotId(), [character]);
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
