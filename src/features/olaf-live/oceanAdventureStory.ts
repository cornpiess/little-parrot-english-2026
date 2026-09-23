import type { AdventureEntityFrame, AdventureStoryDefinition } from './adventureRuntime';

const fish: AdventureEntityFrame[] = [
  { id: 'yellow-fish', concept: 'fish', label: '小黄鱼', emoji: '🐠', visual: 'fish', x: 18, y: 32, depth: 0.45, mood: 'playful' },
  { id: 'blue-fish', concept: 'fish', label: '蓝蓝鱼', emoji: '🐟', visual: 'fish', x: 78, y: 62, depth: 0.7, mood: 'curious' },
];
const jellyfish = (mood: AdventureEntityFrame['mood'], highlighted = false): AdventureEntityFrame => ({
  id: 'moon-jellyfish', concept: 'jellyfish', label: 'JELLYFISH', emoji: '🪼', x: mood === 'shy' ? 84 : 68, y: mood === 'shy' ? 24 : 38, depth: 0.82, mood, highlighted,
});

export const OCEAN_JELLYFISH_STORY: AdventureStoryDefinition = {
  id: 'ocean-jellyfish-glow',
  theme: 'ocean',
  leadCharacter: 'olaf',
  worldKit: 'moonlit-ocean',
  mechanicKit: 'relationship-light',
  narrativeFingerprint: { coreFantasy: '陪害羞朋友穿过黑暗', childRole: '温柔陪伴者', mechanic: 'relationship-light', ending: 'world-re-lit' },
  title: '雪宝的发光水母任务',
  subtitle: '驾驶泡泡潜水艇，认识 jellyfish 和 glow',
  icon: '🌊',
  premise: '月光珍珠不见了。和雪宝潜入珊瑚花园，帮助害羞的水母重新点亮海底。',
  startLabel: '开始海洋冒险',
  completionTitle: '月光海重新亮起来了',
  targetConcepts: [{ word: 'jellyfish', meaning: '水母', emoji: '🪼' }, { word: 'glow', meaning: '发光', emoji: '✨' }],
  targetWords: ['jellyfish', 'glow'],
  worlds: [
    { id: 'snow-base', label: '雪宝冒险基地', scene: 'base' },
    { id: 'ocean-transit', label: '泡泡航道', scene: 'transit' },
    { id: 'coral-garden', label: '月光珊瑚花园', scene: 'ocean' },
    { id: 'home-route', label: '返航水道', scene: 'return' },
  ],
  beats: [
    { id: 'invitation', label: '神秘信号', worldId: 'snow-base', durationMs: 12_000, line: '小探险家！海底有一盏小灯在叫我们。要一起去看看吗？', objective: 'invite', motif: 'wave-invite', intensity: 0.78, outfit: 'none' },
    { id: 'suit-up', label: '穿好潜水服', worldId: 'snow-base', durationMs: 10_000, line: '护目镜戴好，氧气泡泡装满。雪人下水，应该不会变成冰块吧？', objective: 'play', motif: 'silly-play', intensity: 0.8, outfit: 'diving-suit' },
    { id: 'launch', label: '潜水艇出发', worldId: 'ocean-transit', durationMs: 16_000, line: '你是我的副驾驶。抓稳啦！Three, two, one—dive!', objective: 'celebrate', motif: 'excited-tell', intensity: 0.92, outfit: 'diving-suit', vehicle: { id: 'bubble-submarine', cockpit: true } },
    { id: 'dive', label: '穿过泡泡航道', worldId: 'ocean-transit', durationMs: 18_000, line: '左边一群鱼，右边好多泡泡。请帮我看看，那道亮光在哪里？', objective: 'discover', motif: 'search-around', intensity: 0.72, outfit: 'diving-suit', vehicle: { id: 'bubble-submarine', cockpit: true }, entities: fish },
    { id: 'discover', label: '发现海底朋友', worldId: 'coral-garden', durationMs: 14_000, line: '看！它软软的，像一把会游泳的小伞。我的眼睛先看到它啦！', objective: 'discover', motif: 'surprise-find', intensity: 0.86, outfit: 'diving-suit', entities: [...fish, jellyfish('curious', true)] },
    { id: 'name-jellyfish', label: '认识 Jellyfish', worldId: 'coral-garden', durationMs: 24_000, line: 'This is a jellyfish. Jellyfish! 你也轻轻叫叫它：jellyfish。', objective: 'invite', motif: 'proud-show', intensity: 0.72, outfit: 'diving-suit', entities: [...fish, jellyfish('curious', true)], learnWord: 'jellyfish', interaction: { kind: 'say', target: 'jellyfish', prompt: '叫一叫这位海底朋友', aliases: ['jellyfish', 'jelly fish', '水母'] } },
    { id: 'play-together', label: '选择一起玩的方式', worldId: 'coral-garden', durationMs: 24_000, line: '它听见你啦！我们和 jellyfish 一起玩什么？挥挥手，还是跳一支泡泡舞？', objective: 'invite', motif: 'open-welcome', intensity: 0.82, outfit: 'diving-suit', entities: [...fish, jellyfish('playful', true)], interaction: { kind: 'choice', target: 'moon-jellyfish', prompt: '选择一种玩法', options: [{ value: 'wave', label: '挥挥手', emoji: '👋' }, { value: 'dance', label: '泡泡舞', emoji: '🫧' }] } },
    { id: 'shy-jellyfish', label: '水母害羞了', worldId: 'coral-garden', durationMs: 14_000, line: '咦？Jellyfish 躲到珊瑚后面了。可能它也有一点点害羞。', objective: 'reassure', motif: 'gentle-comfort', intensity: 0.52, outfit: 'diving-suit', entities: [...fish, jellyfish('shy')] },
    { id: 'call-jellyfish', label: '把朋友叫回来', worldId: 'coral-garden', durationMs: 22_000, line: '我们不追它，只在这里温柔地说：Jellyfish, come play!', objective: 'comfort', motif: 'soft-comfort', intensity: 0.6, outfit: 'diving-suit', entities: [...fish, jellyfish('shy')], interaction: { kind: 'say', target: 'jellyfish', prompt: '温柔地再叫一次 Jellyfish', aliases: ['jellyfish', 'jelly fish', '水母'] } },
    { id: 'dark-current', label: '海底突然暗了', worldId: 'coral-garden', durationMs: 16_000, line: '呼——一股黑黑的水流卷走了月光珍珠。小鱼找不到回家的路了！我们陪着它们。', objective: 'comfort', motif: 'protect-close', intensity: 0.72, outfit: 'diving-suit', entities: [...fish, jellyfish('shy')] },
    { id: 'choose-trail', label: '寻找月光珍珠', worldId: 'coral-garden', durationMs: 24_000, line: '一边是会唱歌的珊瑚洞，一边是闪闪的泡泡路。小队长，你选哪一边？', objective: 'invite', motif: 'search-around', intensity: 0.76, outfit: 'diving-suit', entities: [...fish, jellyfish('curious')], interaction: { kind: 'choice', target: 'pearl-trail', prompt: '带大家选择一条路', options: [{ value: 'coral-cave', label: '珊瑚洞', emoji: '🪸' }, { value: 'bubble-trail', label: '泡泡路', emoji: '🫧' }] } },
    { id: 'find-pearl', label: '发现月光珍珠', worldId: 'coral-garden', durationMs: 18_000, line: '找到了！可是它卡在海草里。雪宝拉，小鱼推，one, two, three——噗！出来啦！', objective: 'celebrate', motif: 'effort-and-release', intensity: 0.9, outfit: 'diving-suit', entities: [...fish, { ...jellyfish('playful'), highlighted: true }] },
    { id: 'guide-home', label: '护送小鱼回家', worldId: 'coral-garden', durationMs: 18_000, line: '珍珠还没亮。水母朋友，你愿意做一盏温柔的小夜灯，带小鱼回家吗？', objective: 'reassure', motif: 'gentle-lead', intensity: 0.62, outfit: 'diving-suit', entities: [...fish, jellyfish('curious', true)] },
    { id: 'glow-word', label: '点亮海底', worldId: 'coral-garden', durationMs: 24_000, line: '它回来啦，而且在发光！Glow means 发光。Say glow，让整个海底亮起来！', objective: 'celebrate', motif: 'idea-pop', intensity: 0.9, outfit: 'diving-suit', entities: [...fish, jellyfish('glowing', true)], learnWord: 'glow', interaction: { kind: 'say', target: 'glow', prompt: '说 Glow，点亮珊瑚花园', aliases: ['glow', '发光'] } },
    { id: 'celebration', label: '海底灯光舞会', worldId: 'coral-garden', durationMs: 18_000, line: 'Glow! Jellyfish! 你用两个英语魔法词，点亮了整个珊瑚花园！', objective: 'celebrate', motif: 'joyful-clap', intensity: 0.94, outfit: 'diving-suit', entities: [...fish, jellyfish('glowing', true)] },
    { id: 'return', label: '潜水艇返航', worldId: 'home-route', durationMs: 18_000, line: '副驾驶，我们返航。今天的新朋友是 jellyfish，它最厉害的魔法是 glow！', objective: 'reassure', motif: 'calm-breathe', intensity: 0.55, outfit: 'diving-suit', vehicle: { id: 'bubble-submarine', cockpit: true }, entities: fish },
    { id: 'home', label: '回到冒险基地', worldId: 'snow-base', durationMs: 12_000, line: '任务完成！Jellyfish，水母。Glow，发光。下一次我们再去新的世界！', objective: 'celebrate', motif: 'proud-show', intensity: 0.84, outfit: 'none' },
  ],
};
