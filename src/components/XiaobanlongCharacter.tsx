import { useId } from 'react';
import { motion, type TargetAndTransition } from 'motion/react';
import type { ParrotState } from './ParrotCharacter';

interface XiaobanlongCharacterProps {
  state: ParrotState;
  size?: number;
  looking?: boolean;
}

const loop = { repeat: Infinity, ease: 'easeInOut' as const };

const bodyMotion: Partial<Record<ParrotState, TargetAndTransition>> = {
  idle: { y: [0, -2.5, 0], rotate: [0, 0.8, 0, -0.8, 0], transition: { duration: 3.4, ...loop } },
  listening: { y: [1, 4, 1], rotate: -5, transition: { duration: 1.8, ...loop } },
  thinking: { y: [0, -2, 0], rotate: [4, -2, 4], transition: { duration: 2.6, ...loop } },
  speaking: { y: [0, -4, 0], scale: [1, 1.025, 1], transition: { duration: 0.95, ...loop } },
  sleeping: { y: [0, 2, 0], rotate: 7, scale: [1, 0.985, 1], transition: { duration: 2.5, ...loop } },
  greeting: { y: [0, -4, 0], rotate: [0, 2, 0], transition: { duration: 1.1, ...loop } },
  clap: { y: [0, -3, 0], transition: { duration: 0.75, ...loop } },
  wave: { y: [0, -3, 0], rotate: [0, -2, 0], transition: { duration: 1.05, ...loop } },
  dance: { y: [0, -7, 0, -4, 0], rotate: [0, -6, 6, 0], transition: { duration: 0.95, ...loop } },
  bounce: { y: [0, -14, 0], scaleY: [1, 0.97, 1.02, 1], transition: { duration: 0.72, ...loop } },
  nod: { rotate: [0, 5, 0, 5, 0], transition: { duration: 0.8, ...loop } },
  spin: { rotate: [0, 360], transition: { duration: 1.15, repeat: Infinity, ease: 'linear' } },
  hearts: { y: [0, -4, 0], scale: [1, 1.025, 1], transition: { duration: 1.25, ...loop } },
  excited: { y: [0, -8, 0], rotate: [0, -3, 3, 0], transition: { duration: 0.52, ...loop } },
  surprised: { y: -4, scale: 1.04, transition: { duration: 0.22 } },
  happy: { y: [0, -4, 0], rotate: [0, 1.5, 0, -1.5, 0], transition: { duration: 1.2, ...loop } },
  fly: { y: [-2, -12, -2], rotate: [0, -3, 3, 0], transition: { duration: 0.8, ...loop } },
  cheer: { y: [0, -14, 0], scale: [1, 1.045, 1], transition: { duration: 0.68, ...loop } },
  shake: { x: [0, -5, 5, -4, 4, 0], transition: { duration: 0.55, ...loop } },
  dizzy: { rotate: [0, 10, -10, 7, -7, 0], y: [0, -3, 0], transition: { duration: 1.35, ...loop } },
  shy: { x: -3, y: 3, rotate: -4, transition: { duration: 0.35 } },
  peek: { x: [0, -6, 0, 6, 0], transition: { duration: 1.3, ...loop } },
};

export default function XiaobanlongCharacter({ state, size = 1, looking = true }: XiaobanlongCharacterProps) {
  const rawId = useId().replace(/:/g, '');
  const ids = {
    skin: `dragon-skin-${rawId}`,
    face: `dragon-face-${rawId}`,
    mane: `dragon-mane-${rawId}`,
    eye: `dragon-eye-${rawId}`,
    gem: `dragon-gem-${rawId}`,
    blush: `dragon-blush-${rawId}`,
  };

  const sleeping = state === 'sleeping';
  const dizzy = state === 'dizzy';
  const delighted = ['happy', 'hearts', 'cheer', 'excited'].includes(state);
  const talking = ['speaking', 'greeting', 'wave', 'clap', 'dance', 'bounce', 'cheer', 'excited'].includes(state);
  const surprised = state === 'surprised';
  const pupils = looking ? { x: 0, y: 0 } : { x: [0, 2.5, -2, 0], y: [0, -1, 1, 0] };

  const leftArm: TargetAndTransition = state === 'clap'
    ? { rotate: [-2, -30, -2], x: [0, 12, 0], y: [0, -8, 0], transition: { duration: 0.75, ...loop } }
    : ['cheer', 'fly'].includes(state)
      ? { rotate: [0, -72, -58, -72], x: [0, -4, 0], y: [0, -9, -5, -9], transition: { duration: 0.7, ...loop } }
      : ['shy', 'peek'].includes(state)
        ? { rotate: -48, x: 14, y: -14, transition: { duration: 0.35 } }
        : { rotate: [0, -2, 0], transition: { duration: 2.5, ...loop } };

  const rightArm: TargetAndTransition = state === 'clap'
    ? { rotate: [2, 30, 2], x: [0, -12, 0], y: [0, -8, 0], transition: { duration: 0.75, ...loop } }
    : ['wave', 'greeting'].includes(state)
      ? { rotate: [4, 68, 46, 68, 4], x: [0, 4, 2, 4, 0], y: [0, -12, -9, -12, 0], transition: { duration: 1.05, ...loop } }
      : ['cheer', 'fly'].includes(state)
        ? { rotate: [0, 72, 58, 72], x: [0, 4, 0], y: [0, -9, -5, -9], transition: { duration: 0.7, ...loop } }
        : ['shy', 'peek'].includes(state)
          ? { rotate: 48, x: -14, y: -14, transition: { duration: 0.35 } }
          : { rotate: [0, 2, 0], transition: { duration: 2.5, ...loop } };

  const mouthPath = surprised
    ? 'M91 122 C91 112 109 112 109 122 C109 135 91 135 91 122Z'
    : delighted || talking
      ? 'M78 118 C86 123 114 123 122 118 C120 139 111 149 100 149 C89 149 80 139 78 118Z'
      : 'M84 121 C91 128 109 128 116 121 C111 136 89 136 84 121Z';

  return (
    <div className="relative flex items-center justify-center pointer-events-none overflow-visible" style={{ width: 200 * size, height: 230 * size }}>
      <div style={{ width: 200, height: 230, transform: `scale(${size})`, transformOrigin: 'center center' }}>
        <motion.svg viewBox="0 0 200 230" width="200" height="230" className="overflow-visible drop-shadow-xl" animate={bodyMotion[state] ?? bodyMotion.idle} initial={false} style={{ transformOrigin: '100px 211px' }}>
          <defs>
            <linearGradient id={ids.skin} x1="0" y1="0" x2="0.75" y2="1"><stop offset="0" stopColor="#FFD95A" /><stop offset="0.55" stopColor="#FFC13A" /><stop offset="1" stopColor="#F3A72E" /></linearGradient>
            <radialGradient id={ids.face} cx="40%" cy="28%" r="76%"><stop offset="0" stopColor="#FFE779" /><stop offset="0.58" stopColor="#FFD24D" /><stop offset="1" stopColor="#F3A52D" /></radialGradient>
            <linearGradient id={ids.mane} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FF7837" /><stop offset="1" stopColor="#E73E27" /></linearGradient>
            <radialGradient id={ids.eye} cx="35%" cy="28%" r="75%"><stop offset="0" stopColor="#8B4A25" /><stop offset="0.55" stopColor="#532414" /><stop offset="1" stopColor="#28120E" /></radialGradient>
            <radialGradient id={ids.gem} cx="35%" cy="25%" r="72%"><stop offset="0" stopColor="#D9FFFF" /><stop offset="0.32" stopColor="#54DFFC" /><stop offset="1" stopColor="#139ED8" /></radialGradient>
            <radialGradient id={ids.blush} cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#FF7769" stopOpacity="0.8" /><stop offset="1" stopColor="#FF7769" stopOpacity="0" /></radialGradient>
          </defs>

          <ellipse cx="100" cy="217" rx="43" ry="7" fill="#6E4F78" opacity="0.2" />

          <motion.g animate={{ rotate: ['excited', 'happy', 'cheer'].includes(state) ? [0, 10, -6, 0] : [0, 3, 0] }} transition={{ duration: state === 'excited' ? 0.55 : 2.2, ...loop }} style={{ transformOrigin: '130px 177px' }}>
            <path d="M127 174 C145 174 151 186 141 196" fill="none" stroke={`url(#${ids.skin})`} strokeWidth="9" strokeLinecap="round" />
            <path d="M138 193 C140 186 146 186 147 191 C152 187 157 191 154 196 C150 201 144 202 139 203Z" fill="#EF4A32" stroke="#D83B27" strokeWidth="1.6" />
          </motion.g>

          <path d="M57 57 C42 52 32 62 36 76 C22 78 22 94 34 101 C25 111 32 124 46 124 C42 137 57 143 70 131 L75 76Z" fill={`url(#${ids.mane})`} stroke="#D84428" strokeWidth="2.3" strokeLinejoin="round" />
          <path d="M143 57 C158 52 168 62 164 76 C178 78 178 94 166 101 C175 111 168 124 154 124 C158 137 143 143 130 131 L125 76Z" fill={`url(#${ids.mane})`} stroke="#D84428" strokeWidth="2.3" strokeLinejoin="round" />
          <path d="M40 77 C48 78 54 74 59 68 M37 101 C46 101 53 96 58 89 M46 124 C54 120 59 114 62 106" fill="none" stroke="#FF9861" strokeWidth="2.2" strokeLinecap="round" opacity="0.75" />
          <path d="M160 77 C152 78 146 74 141 68 M163 101 C154 101 147 96 142 89 M154 124 C146 120 141 114 138 106" fill="none" stroke="#FF9861" strokeWidth="2.2" strokeLinecap="round" opacity="0.75" />

          <path d="M73 139 C76 128 87 123 100 123 C113 123 124 128 127 139 L125 192 C120 204 80 204 75 192Z" fill={`url(#${ids.skin})`} stroke="#DD8A25" strokeWidth="2.4" />
          <path d="M89 143 C92 148 108 148 111 143 L114 188 C108 193 92 193 86 188Z" fill="#FFD75A" opacity="0.46" />

          <path d="M68 49 C60 42 56 34 57 26 C58 20 64 18 68 22 C71 25 69 30 66 33 C72 35 78 40 81 47Z" fill="#FFE271" stroke="#E7A436" strokeWidth="2" strokeLinejoin="round" />
          <ellipse cx="61.5" cy="24.5" rx="3.4" ry="2.3" fill="#FFF8C9" transform="rotate(-35 61.5 24.5)" />
          <path d="M132 49 C140 42 144 34 143 26 C142 20 136 18 132 22 C129 25 131 30 134 33 C128 35 122 40 119 47Z" fill="#FFE271" stroke="#E7A436" strokeWidth="2" strokeLinejoin="round" />
          <ellipse cx="138.5" cy="24.5" rx="3.4" ry="2.3" fill="#FFF8C9" transform="rotate(35 138.5 24.5)" />
          <path d="M91 43 C95 37 95 29 96 22 C101 25 104 29 104 34 C108 31 111 33 110 39 C109 44 104 48 98 49Z" fill="#F24B27" stroke="#D83A22" strokeWidth="1.8" />
          <path d="M98 39 C101 35 101 31 100 28" fill="none" stroke="#FF9C42" strokeWidth="2" strokeLinecap="round" />

          <path d="M100 39 C132 39 153 59 155 89 C158 119 137 143 100 148 C63 143 42 119 45 89 C47 59 68 39 100 39Z" fill={`url(#${ids.face})`} stroke="#DD8A25" strokeWidth="2.6" />
          <path d="M59 61 C69 48 83 44 99 44" fill="none" stroke="#FFF1A7" strokeWidth="4" strokeLinecap="round" opacity="0.5" />

          <motion.path d="M61 72 C68 65 77 65 83 70" fill="none" stroke="#81401E" strokeWidth="5" strokeLinecap="round" animate={{ rotate: state === 'thinking' ? -7 : surprised ? 7 : 0 }} style={{ transformOrigin: '72px 70px' }} />
          <motion.path d="M117 70 C123 65 132 65 139 72" fill="none" stroke="#81401E" strokeWidth="5" strokeLinecap="round" animate={{ rotate: state === 'thinking' ? 7 : surprised ? -7 : 0 }} style={{ transformOrigin: '128px 70px' }} />

          {[73, 127].map((cx) => (
            <g key={cx}>
              {sleeping ? (
                <path d={`M${cx - 14} 91 C${cx - 7} 98 ${cx + 7} 98 ${cx + 14} 91`} fill="none" stroke="#71331D" strokeWidth="4.2" strokeLinecap="round" />
              ) : dizzy ? (
                <g stroke="#54251A" strokeWidth="4" strokeLinecap="round"><path d={`M${cx - 8} 83 L${cx + 8} 99`} /><path d={`M${cx + 8} 83 L${cx - 8} 99`} /></g>
              ) : delighted ? (
                <path d={`M${cx - 14} 94 C${cx - 7} 81 ${cx + 7} 81 ${cx + 14} 94`} fill="none" stroke="#54251A" strokeWidth="5" strokeLinecap="round" />
              ) : (
                <>
                  <ellipse cx={cx} cy="91" rx={surprised ? 16 : 17} ry={surprised ? 20 : 22} fill="#FFFDF4" stroke="#D69036" strokeWidth="2" />
                  <motion.g animate={state === 'thinking' ? { x: [-2, 3, -2], y: [-2, 0, -2] } : pupils} transition={{ duration: state === 'thinking' ? 2.2 : 0.4, repeat: state === 'thinking' || !looking ? Infinity : 0 }}>
                    <ellipse cx={cx} cy="93" rx="12.5" ry="16.5" fill={`url(#${ids.eye})`} /><ellipse cx={cx - 4} cy="86" rx="5" ry="6.5" fill="white" /><ellipse cx={cx + 5.5} cy="101" rx="2.6" ry="3" fill="#F8C16D" opacity="0.8" /><circle cx={cx - 8} cy="98" r="1.5" fill="white" opacity="0.72" />
                  </motion.g>
                </>
              )}
            </g>
          ))}

          <path d="M93 109 C96 105 104 105 107 109 C104 108 102 110 100 112 C98 110 96 108 93 109Z" fill="#FFE887" stroke="#CE842D" strokeWidth="1.5" />
          <circle cx="96.5" cy="109" r="1.1" fill="#B56A2C" /><circle cx="103.5" cy="109" r="1.1" fill="#B56A2C" />
          <motion.path d={mouthPath} fill="#7D3028" stroke="#A84731" strokeWidth="2" strokeLinejoin="round" animate={{ scaleY: talking ? [0.88, 1.06, 0.92, 1] : 1 }} transition={{ duration: 0.48, ...loop }} style={{ transformOrigin: '100px 121px' }} />
          {!surprised && (delighted || talking) && <path d="M84 136 C91 130 109 130 116 136 C111 146 89 146 84 136Z" fill="#FF7592" />}
          {!surprised && !delighted && !talking && <path d="M89 130 C95 127 105 127 111 130 C106 136 94 136 89 130Z" fill="#FF7891" />}

          <motion.ellipse cx="54" cy="116" rx="13" ry="9" fill={`url(#${ids.blush})`} animate={{ opacity: state === 'shy' ? [0.65, 1, 0.65] : 0.72 }} transition={{ duration: 1.2, ...loop }} />
          <motion.ellipse cx="146" cy="116" rx="13" ry="9" fill={`url(#${ids.blush})`} animate={{ opacity: state === 'shy' ? [0.65, 1, 0.65] : 0.72 }} transition={{ duration: 1.2, ...loop }} />
          <g fill="#D8792B" opacity="0.75"><circle cx="53" cy="116" r="1.2" /><circle cx="58" cy="113" r="1" /><circle cx="147" cy="116" r="1.2" /><circle cx="142" cy="113" r="1" /></g>

          <path d="M86 143 C92 151 108 151 114 143" fill="none" stroke="#7E6535" strokeWidth="1.5" />
          <circle cx="100" cy="153" r="8" fill={`url(#${ids.gem})`} stroke="#168DBB" strokeWidth="1.5" /><path d="M96 149 C98 147 101 147 103 149" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.85" />

          <motion.g animate={leftArm} initial={false} style={{ transformOrigin: '78px 151px' }}>
            <path d="M79 148 C70 147 64 152 65 161 C66 170 72 175 78 170 C82 167 83 157 82 151Z" fill={`url(#${ids.skin})`} stroke="#DD8A25" strokeWidth="2" /><path d="M69 160 L66 157 M72 164 L68 163 M76 165 L73 167" fill="none" stroke="#BC6D28" strokeWidth="1.5" strokeLinecap="round" /><g fill="#E66F28"><circle cx="71" cy="153" r="1.4" /><circle cx="75" cy="156" r="1.2" /><circle cx="70" cy="168" r="1.1" /></g>
          </motion.g>
          <motion.g animate={rightArm} initial={false} style={{ transformOrigin: '122px 151px' }}>
            <path d="M121 148 C130 147 136 152 135 161 C134 170 128 175 122 170 C118 167 117 157 118 151Z" fill={`url(#${ids.skin})`} stroke="#DD8A25" strokeWidth="2" /><path d="M131 160 L134 157 M128 164 L132 163 M124 165 L127 167" fill="none" stroke="#BC6D28" strokeWidth="1.5" strokeLinecap="round" /><g fill="#E66F28"><circle cx="129" cy="153" r="1.4" /><circle cx="125" cy="156" r="1.2" /><circle cx="130" cy="168" r="1.1" /></g>
          </motion.g>

          <path d="M82 185 C80 193 80 201 82 207 L95 207 L96 185Z" fill={`url(#${ids.skin})`} stroke="#DD8A25" strokeWidth="2" /><path d="M104 185 L105 207 L118 207 C120 201 120 193 118 185Z" fill={`url(#${ids.skin})`} stroke="#DD8A25" strokeWidth="2" />
          <path d="M81 203 C71 203 67 209 69 214 C76 218 91 218 98 213 C98 207 93 203 81 203Z" fill="#FFD955" stroke="#D9902D" strokeWidth="2" /><path d="M119 203 C129 203 133 209 131 214 C124 218 109 218 102 213 C102 207 107 203 119 203Z" fill="#FFD955" stroke="#D9902D" strokeWidth="2" />
          <g fill="#E96F29"><circle cx="84" cy="188" r="1.6" /><circle cx="89" cy="195" r="1.3" /><circle cx="116" cy="188" r="1.6" /><circle cx="111" cy="195" r="1.3" /></g>

          {state === 'thinking' && <motion.g animate={{ y: [0, -4, 0], opacity: [0.45, 1, 0.45] }} transition={{ duration: 1.8, ...loop }} fill="#FFFFFF" stroke="#B7A8D4" strokeWidth="1.3"><circle cx="151" cy="54" r="4" /><circle cx="160" cy="45" r="6" /><circle cx="171" cy="34" r="9" /></motion.g>}
          {state === 'hearts' && <g fill="#F35B77"><motion.path d="M25 91 C20 84 10 89 16 98 L25 106 L34 98 C40 89 30 84 25 91Z" animate={{ y: [4, -18, 4], opacity: [0, 1, 0] }} transition={{ duration: 1.5, ...loop }} /><motion.path d="M171 73 C167 67 159 71 164 78 L171 84 L178 78 C183 71 175 67 171 73Z" animate={{ y: [5, -15, 5], opacity: [0, 1, 0] }} transition={{ duration: 1.5, delay: 0.35, ...loop }} /></g>}
          {['excited', 'surprised', 'cheer'].includes(state) && <g fill="#FFE46C"><path d="M22 84 L25 92 L33 95 L25 98 L22 106 L19 98 L11 95 L19 92Z" /><path d="M178 93 L181 100 L188 103 L181 106 L178 113 L175 106 L168 103 L175 100Z" /></g>}
          {sleeping && <motion.text x="153" y="53" fontSize="18" fontWeight="700" fill="#8176A7" animate={{ y: [0, -6, 0], opacity: [0.35, 1, 0.35] }} transition={{ duration: 1.8, ...loop }}>Zzz</motion.text>}
        </motion.svg>
      </div>
    </div>
  );
}
