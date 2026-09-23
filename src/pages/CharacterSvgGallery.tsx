import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import FoxCharacter from '../components/FoxCharacter';
import { IronManCharacter, IRON_MAN_PROFILE, isIronManAction, type IronManAction } from '../components/iron-man';
import { BuzzLightyearCharacter, BUZZ_PROFILE, isBuzzAction, type BuzzAction } from '../components/buzz';
import OlafCharacter from '../components/OlafCharacter';
import ParrotCharacter, { type ParrotState } from '../components/ParrotCharacter';
import { CHARACTER_KITS, type CharacterId as RegistryCharacterId } from '../features/character-performance/characterRegistry';

type GalleryAction = { id: string; label: string };
type CharacterId = RegistryCharacterId;

const kitFor = (id: CharacterId) => CHARACTER_KITS.find((kit) => kit.id === id)!;

const MASCOT_ACTIONS: readonly GalleryAction[] = [
  { id: 'idle', label: '待机' },
  { id: 'listening', label: '倾听' },
  { id: 'thinking', label: '思考' },
  { id: 'speaking', label: '说话' },
  { id: 'sleeping', label: '睡觉' },
  { id: 'greeting', label: '问候' },
  { id: 'clap', label: '拍手' },
  { id: 'wave', label: '招手' },
  { id: 'dance', label: '跳舞' },
  { id: 'bounce', label: '跳跃' },
  { id: 'nod', label: '点头' },
  { id: 'spin', label: '转圈' },
  { id: 'hearts', label: '飞吻' },
  { id: 'excited', label: '兴奋' },
  { id: 'surprised', label: '惊讶' },
  { id: 'happy', label: '开心' },
  { id: 'fly', label: '飞行' },
  { id: 'cheer', label: '欢呼' },
  { id: 'shake', label: '摇头' },
  { id: 'dizzy', label: '眩晕' },
  { id: 'shy', label: '害羞' },
  { id: 'peek', label: '躲猫猫' },
];

interface CharacterGalleryEntry {
  id: CharacterId;
  name: string;
  subtitle: string;
  actions: readonly GalleryAction[];
  defaultAction: string;
  previewScale: number;
  stageScale: number;
  render(props: { action: string; size: number }): ReactNode;
}

const renderMascot = (id: 'parrot' | 'fox' | 'olaf', action: string, size: number) => {
  const state = action as ParrotState;
  if (id === 'fox') return <FoxCharacter state={state} size={size} looking />;
  if (id === 'olaf') return <OlafCharacter state={state} size={size} />;
  return <ParrotCharacter state={state} size={size} looking />;
};

export const CHARACTER_REGISTRY: readonly CharacterGalleryEntry[] = [
  { id: 'parrot', name: kitFor('parrot').name, subtitle: kitFor('parrot').subtitle, actions: MASCOT_ACTIONS, defaultAction: kitFor('parrot').defaultAction, previewScale: 1, stageScale: 1.28, render: ({ action, size }) => renderMascot('parrot', action, size) },
  { id: 'fox', name: kitFor('fox').name, subtitle: kitFor('fox').subtitle, actions: MASCOT_ACTIONS, defaultAction: kitFor('fox').defaultAction, previewScale: 1, stageScale: 1.28, render: ({ action, size }) => renderMascot('fox', action, size) },
  { id: 'olaf', name: kitFor('olaf').name, subtitle: kitFor('olaf').subtitle, actions: MASCOT_ACTIONS, defaultAction: kitFor('olaf').defaultAction, previewScale: 1, stageScale: 1.28, render: ({ action, size }) => renderMascot('olaf', action, size) },
  { id: 'ironman', name: 'Iron Man', subtitle: 'Mark 46', actions: IRON_MAN_PROFILE.actions, defaultAction: kitFor('ironman').defaultAction, previewScale: .43, stageScale: .68, render: ({ action, size }) => <IronManCharacter action={isIronManAction(action) ? action as IronManAction : 'idle'} size={size} /> },
  { id: 'buzz', name: kitFor('buzz').name, subtitle: kitFor('buzz').subtitle, actions: BUZZ_PROFILE.actions, defaultAction: kitFor('buzz').defaultAction, previewScale: .56, stageScale: .82, render: ({ action, size }) => <BuzzLightyearCharacter action={isBuzzAction(action) ? action as BuzzAction : 'akimbo'} size={size} /> },
];

const characterById = (id: CharacterId) => CHARACTER_REGISTRY.find((item) => item.id === id) ?? CHARACTER_REGISTRY[0];

/** Render the production SVG then pause its Web Animations immediately.
 * This preserves the real character artwork for the static-SVG reference. */
function StaticCharacter({ children }: { children: ReactNode }) {
  const node = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const pause = () => node.current?.getAnimations({ subtree: true }).forEach((animation) => animation.pause());
    pause();
    const frame = requestAnimationFrame(pause);
    return () => cancelAnimationFrame(frame);
  }, []);

  return <div className="static-character" ref={node}>{children}</div>;
}

export default function CharacterSvgGallery() {
  const [character, setCharacter] = useState<CharacterId>('parrot');
  const [actionsByCharacter, setActionsByCharacter] = useState<Record<CharacterId, string>>(() => Object.fromEntries(CHARACTER_REGISTRY.map((item) => [item.id, item.defaultAction])) as Record<CharacterId, string>);
  const [renderKey, setRenderKey] = useState(0);
  const action = actionsByCharacter[character];
  const entry = characterById(character);
  const actionItems = entry.actions;
  const actionLabel = actionItems.find((item) => item.id === action)?.label ?? action;

  function selectAction(next: string) {
    setActionsByCharacter((current) => ({ ...current, [character]: next }));
    setRenderKey((value) => value + 1);
  }

  return (
    <main className="gallery-shell">
      <header className="hero">
        <p className="eyebrow">LITTLE PARROT · SVG LIBRARY</p>
        <h1>角色 SVG 与动作库</h1>
          <p>小鹦鹉、小狐狸、雪宝、Iron Man 与巴斯光年的连续表演和技能动作库。</p>
      </header>

      <section aria-labelledby="static-title">
        <div className="section-heading">
          <div>
            <p className="section-kicker">STATIC SVG</p>
            <h2 id="static-title">静态 SVG</h2>
          </div>
          <p>以下画面直接使用产品中的内联 SVG，并暂停动画以便检查造型。</p>
        </div>
        <div className="static-grid">
          {CHARACTER_REGISTRY.map((item) => (
            <article className="static-card" key={item.id}>
              <div className={`artboard artboard-${item.id}`}>
                <StaticCharacter>{characterById(item.id).render({ action: 'idle', size: item.previewScale })}</StaticCharacter>
              </div>
              <div className="character-caption">
                <h3>{item.name}</h3>
                <span>{item.subtitle} · SVG</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="motion-section" aria-labelledby="motion-title">
        <div className="section-heading">
          <div>
            <p className="section-kicker">ANIMATED SVG</p>
            <h2 id="motion-title">动态 SVG 动作</h2>
          </div>
          <p>选择角色与动作；再次点击任一动作可从头播放。</p>
        </div>

        <div className="motion-panel">
          <div className="character-tabs" role="tablist" aria-label="选择角色">
            {CHARACTER_REGISTRY.map((item) => (
              <button
                className={character === item.id ? 'is-selected' : ''}
                key={item.id}
                onClick={() => { setCharacter(item.id); setRenderKey((value) => value + 1); }}
                role="tab"
                aria-selected={character === item.id}
              >
                {item.name}
              </button>
            ))}
          </div>

          <div className={`motion-stage stage-${character}`}>
            <div className="action-chip">{actionLabel}</div>
            <div key={`${character}-${action}-${renderKey}`}>{entry.render({ action, size: entry.stageScale })}</div>
          </div>

          <div className="action-list" aria-label="选择动作">
            {actionItems.map((item) => (
              <button
                className={action === item.id ? 'is-active' : ''}
                key={item.id}
                onClick={() => selectAction(item.id)}
                aria-pressed={action === item.id}
              >
                <span>{item.label}</span>
                <code>{item.id}</code>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
