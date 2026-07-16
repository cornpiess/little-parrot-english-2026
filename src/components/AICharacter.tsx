import ParrotCharacter from './ParrotCharacter';
import FoxCharacter from './FoxCharacter';

type CharacterState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'sleeping';

interface AICharacterProps {
  state: CharacterState;
  size?: number;
  onWakeUp?: () => void;
  character?: 'parrot' | 'fox';
}

/**
 * Wrapper that renders either ParrotCharacter or FoxCharacter
 * based on the `character` prop or localStorage('selected_character').
 */
export default function AICharacter({ state, size, onWakeUp, character }: AICharacterProps) {
  const selected = character || (typeof window !== 'undefined' ? localStorage.getItem('selected_character') as 'parrot' | 'fox' : null) || 'parrot';

  if (selected === 'fox') {
    return <FoxCharacter state={state} size={size} onWakeUp={onWakeUp} />;
  }
  return <ParrotCharacter state={state} size={size} onWakeUp={onWakeUp} />;
}

export function getCharacterName(): string {
  const selected = typeof window !== 'undefined' ? localStorage.getItem('selected_character') : null;
  return selected === 'fox' ? '小狐狸' : '小鹦鹉';
}
