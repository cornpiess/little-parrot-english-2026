import type { AdventureEntityFrame, AdventureStoryDefinition } from './adventureRuntime';

const star = (highlighted = false): AdventureEntityFrame => ({ id: 'little-star', concept: 'star', label: 'STAR', emoji: '⭐', visual: 'star', x: 73, y: 30, depth: .85, mood: 'glowing', highlighted });
const satellite: AdventureEntityFrame = { id: 'lighthouse-satellite', concept: 'satellite', label: '星光灯塔', emoji: '🛰️', visual: 'satellite', x: 76, y: 58, depth: .9, mood: 'curious', highlighted: true };

export const SPACE_STAR_STORY: AdventureStoryDefinition = {
  worldKit: 'starlight-orbit',
  mechanicKit: 'rhythm-navigation',
  id: 'space-star-lighthouse', theme: 'space', leadCharacter: 'olaf', narrativeFingerprint: { coreFantasy: '让失序的星光重新找到节拍', childRole: '双人导航员', mechanic: 'rhythm-navigation', ending: 'constellation' }, icon: '🚀', title: '雪宝的星光灯塔', subtitle: '驾驶棉花糖飞船，认识 star 和 orbit',
  premise: '太空灯塔失去了节拍。和雪宝成为双人飞行员，穿过流星雨，让小星星重新找到轨道。', startLabel: '飞向太空', completionTitle: '星光灯塔重新闪耀',
  targetWords: ['star', 'orbit'], targetConcepts: [{ word: 'star', meaning: '星星', emoji: '⭐' }, { word: 'orbit', meaning: '轨道 / 环绕', emoji: '🪐' }],
  worlds: [{ id: 'snow-base', label: '雪宝冒险基地', scene: 'base' }, { id: 'launch-lane', label: '彩虹发射航道', scene: 'transit' }, { id: 'starlight-orbit', label: '星光灯塔轨道', scene: 'space' }, { id: 'home-route', label: '返航星路', scene: 'return' }],
  beats: [
    { id: 'invitation', label: '星星的眨眼信号', worldId: 'snow-base', durationMs: 13_000, line: '滴、滴、滴！有颗小星星只会眨一只眼。它的太空灯塔忘记节拍啦！', objective: 'invite', motif: 'listen-signal', intensity: .8, outfit: 'none' },
    { id: 'suit-up', label: '穿好宇航服', worldId: 'snow-base', durationMs: 11_000, line: '头盔扣好，月亮靴穿好。等等，我的鼻子太长，头盔要留一个胡萝卜出口！', objective: 'play', motif: 'silly-play', intensity: .82, outfit: 'space-suit' },
    { id: 'launch', label: '双人飞船升空', worldId: 'launch-lane', durationMs: 18_000, line: '你是导航员，我是会融化的船长。Three, two, one—blast off!', objective: 'celebrate', motif: 'excited-tell', intensity: .96, outfit: 'space-suit', vehicle: { id: 'marshmallow-starship', cockpit: true } },
    { id: 'zero-gravity', label: '失重棉花糖舞', worldId: 'launch-lane', durationMs: 17_000, line: '我的脚飘起来了，肚子也飘起来了——只有胡萝卜鼻子还知道前面在哪里！', objective: 'play', motif: 'float-and-spin', intensity: .86, outfit: 'space-suit', vehicle: { id: 'marshmallow-starship', cockpit: true } },
    { id: 'see-star', label: '找到眨眼的小星星', worldId: 'starlight-orbit', durationMs: 17_000, line: '窗外那颗亮亮的小点在朝你眨眼。A little star，一颗小星星。', objective: 'discover', motif: 'look-up-amazed', intensity: .8, outfit: 'space-suit', entities: [star(true)] },
    { id: 'say-star', label: '认识 Star', worldId: 'starlight-orbit', durationMs: 24_000, line: 'Star means 星星。把手指向它，清清楚楚地说：star！', objective: 'invite', motif: 'point-and-name', intensity: .72, outfit: 'space-suit', entities: [star(true)], learnWord: 'star', interaction: { kind: 'say', target: 'star', prompt: '指着星星说 Star', aliases: ['star', '星星'] } },
    { id: 'broken-beat', label: '灯塔丢了节拍', worldId: 'starlight-orbit', durationMs: 18_000, line: '灯塔应该亮、暗、亮、暗，现在却乱成一团。我们不是搬东西，要用耳朵修好它。', objective: 'discover', motif: 'listen-signal', intensity: .7, outfit: 'space-suit', entities: [star(), satellite] },
    { id: 'choose-rhythm', label: '选择星光节拍', worldId: 'starlight-orbit', durationMs: 24_000, line: '你来当太空指挥家：慢慢拍，还是快快拍？选一个，让星光跟着我们。', objective: 'invite', motif: 'conduct-rhythm', intensity: .78, outfit: 'space-suit', entities: [star(), satellite], interaction: { kind: 'choice', target: 'light-rhythm', prompt: '选择灯塔的闪光节拍', options: [{ value: 'slow', label: '慢慢拍', emoji: '👏' }, { value: 'fast', label: '快快拍', emoji: '⚡' }] } },
    { id: 'enter-orbit', label: '进入圆圆的轨道', worldId: 'starlight-orbit', durationMs: 18_000, line: '飞船不能直冲过去，要绕着星球画一个大圆圈。这个环绕的路线叫 orbit。', objective: 'discover', motif: 'wide-orbit', intensity: .76, outfit: 'space-suit', entities: [star(), { ...satellite, x: 65 }] },
    { id: 'say-orbit', label: '认识 Orbit', worldId: 'starlight-orbit', durationMs: 24_000, line: 'Orbit，轨道。用手画一个大圆圈，再说 orbit，让飞船稳稳转弯！', objective: 'invite', motif: 'wide-orbit', intensity: .8, outfit: 'space-suit', entities: [star(true), satellite], learnWord: 'orbit', interaction: { kind: 'say', target: 'orbit', prompt: '画个圆圈，说 Orbit', aliases: ['orbit', '轨道', '环绕'] } },
    { id: 'meteor-shower', label: '穿过棉花糖流星雨', worldId: 'starlight-orbit', durationMs: 17_000, line: '流星雨来了！不是撞过去——低头、左转、再轻轻抬头。你导航得太准啦！', objective: 'play', motif: 'duck-and-steer', intensity: .94, outfit: 'space-suit', entities: [{ id: 'meteor', concept: 'meteor', label: '流星', emoji: '☄️', x: 72, y: 42, depth: 1, mood: 'excited' }] },
    { id: 'sync-light', label: '双人点亮灯塔', worldId: 'starlight-orbit', durationMs: 20_000, line: '跟着节拍：拍、停、拍、停。雪宝转方向盘，你来数拍子——灯塔听见了！', objective: 'celebrate', motif: 'conduct-rhythm', intensity: .9, outfit: 'space-suit', entities: [star(true), satellite] },
    { id: 'constellation', label: '星星连成感谢画', worldId: 'starlight-orbit', durationMs: 18_000, line: '一颗、两颗、好多颗 star 连起来，画成了你和雪宝的笑脸！', objective: 'celebrate', motif: 'look-up-amazed', intensity: .92, outfit: 'space-suit', entities: [star(true), { ...star(), id: 'star-two', x: 84, y: 45 }, { ...star(), id: 'star-three', x: 62, y: 53 }] },
    { id: 'goodbye', label: '绕灯塔一圈', worldId: 'starlight-orbit', durationMs: 16_000, line: '最后沿 orbit 绕一圈，向每一颗 star 挥手。灯塔会替我们守着回家的路。', objective: 'reassure', motif: 'wide-orbit', intensity: .66, outfit: 'space-suit', entities: [star(true), satellite] },
    { id: 'return', label: '沿星路返航', worldId: 'home-route', durationMs: 17_000, line: '导航员，返航！Star 是星星，orbit 是环绕的轨道。我们的节拍还在心里。', objective: 'reassure', motif: 'calm-breathe', intensity: .58, outfit: 'space-suit', vehicle: { id: 'marshmallow-starship', cockpit: true } },
    { id: 'home', label: '回到冒险基地', worldId: 'snow-base', durationMs: 12_000, line: '太空任务完成！你会观察、会导航，还会用节拍帮助整片星空。', objective: 'celebrate', motif: 'proud-show', intensity: .88, outfit: 'none' },
  ],
};
