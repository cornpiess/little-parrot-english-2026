import type { AdventureEntityFrame, AdventureStoryDefinition } from './adventureRuntime';

const footprints: AdventureEntityFrame[] = [{ id: 'tracks', concept: 'footprints', label: '脚印', emoji: '👣', visual: 'footprints', x: 70, y: 67, depth: .7, mood: 'curious', highlighted: true }];
const egg = (highlighted = false): AdventureEntityFrame => ({ id: 'rainbow-egg', concept: 'egg', label: 'EGG', emoji: '🥚', visual: 'egg', x: 72, y: 57, depth: .9, mood: 'gentle', highlighted });
const dino = (mood: AdventureEntityFrame['mood'] = 'gentle'): AdventureEntityFrame => ({ id: 'mama-dino', concept: 'dinosaur', label: 'DINOSAUR', emoji: '🦕', visual: 'dinosaur', x: 76, y: 38, depth: 1, mood, highlighted: true });

export const DINOSAUR_EGG_STORY: AdventureStoryDefinition = {
  worldKit: 'fern-valley',
  mechanicKit: 'balance-trail',
  id: 'dinosaur-lost-egg', theme: 'dinosaur', leadCharacter: 'olaf', narrativeFingerprint: { coreFantasy: '把脆弱生命安全送回家', childRole: '小小守护员', mechanic: 'balance-trail', ending: 'reunion' }, icon: '🦕', title: '雪宝与迷路的恐龙蛋', subtitle: '乘坐咔嗒时光机，认识 dinosaur 和 egg',
  premise: '一枚彩虹恐龙蛋滚出了巢。循着巨大脚印穿越蕨叶谷，把它安全送回妈妈身边。', startLabel: '穿越恐龙世界', completionTitle: '恐龙蛋回家了',
  targetWords: ['dinosaur', 'egg'], targetConcepts: [{ word: 'dinosaur', meaning: '恐龙', emoji: '🦕' }, { word: 'egg', meaning: '蛋', emoji: '🥚' }],
  worlds: [{ id: 'snow-base', label: '雪宝冒险基地', scene: 'base' }, { id: 'time-tunnel', label: '咔嗒时间隧道', scene: 'transit' }, { id: 'fern-valley', label: '远古蕨叶谷', scene: 'dinosaur' }, { id: 'home-route', label: '返程时间隧道', scene: 'return' }],
  beats: [
    { id: 'invitation', label: '远古求救信', worldId: 'snow-base', durationMs: 13_000, line: '咚！一枚比我的肚子还大的蛋寄来了求救信。我们去很久很久以前看看！', objective: 'invite', motif: 'surprise-find', intensity: .84, outfit: 'none' },
    { id: 'suit-up', label: '小小考古家', worldId: 'snow-base', durationMs: 11_000, line: '探险帽戴稳，放大镜收好。我的树枝手也能当指南针！', objective: 'play', motif: 'proud-show', intensity: .75, outfit: 'explorer' },
    { id: 'launch', label: '时光机启动', worldId: 'time-tunnel', durationMs: 18_000, line: '你管绿色按钮，我摇咔嗒摇杆。Five, four, three, two, one——回到恐龙时代！', objective: 'celebrate', motif: 'excited-tell', intensity: .94, outfit: 'explorer', vehicle: { id: 'tick-tock-time-machine', cockpit: true } },
    { id: 'landing', label: '降落蕨叶谷', worldId: 'fern-valley', durationMs: 16_000, line: '地面在咚、咚、咚。别怕，先弯下腰看看：这里有三只超级大的脚印！', objective: 'discover', motif: 'sneak-and-peek', intensity: .68, outfit: 'explorer', entities: footprints },
    { id: 'meet-dino', label: '温柔的大朋友', worldId: 'fern-valley', durationMs: 18_000, line: '长长的脖子从树后探出来了。它不是怪兽，它是 dinosaur，一只温柔的恐龙。', objective: 'discover', motif: 'look-up-amazed', intensity: .84, outfit: 'explorer', entities: [dino()] },
    { id: 'say-dinosaur', label: '认识 Dinosaur', worldId: 'fern-valley', durationMs: 24_000, line: 'Din-o-saur。恐龙听见自己的名字就会安心。你来叫它：dinosaur！', objective: 'reassure', motif: 'gentle-comfort', intensity: .7, outfit: 'explorer', entities: [dino()], learnWord: 'dinosaur', interaction: { kind: 'say', target: 'dinosaur', prompt: '大声叫一叫 Dinosaur', aliases: ['dinosaur', '恐龙'] } },
    { id: 'find-egg', label: '草丛里的彩虹蛋', worldId: 'fern-valley', durationMs: 17_000, line: '沙沙沙——草丛里是什么？圆圆的，会轻轻摇。原来是迷路的小蛋！', objective: 'discover', motif: 'sneak-and-peek', intensity: .78, outfit: 'explorer', entities: [egg(true), dino('curious')] },
    { id: 'say-egg', label: '认识 Egg', worldId: 'fern-valley', durationMs: 24_000, line: 'Egg means 蛋。我们轻声说 egg，告诉它：别担心，我们送你回家。', objective: 'comfort', motif: 'soft-comfort', intensity: .58, outfit: 'explorer', entities: [egg(true)], learnWord: 'egg', interaction: { kind: 'say', target: 'egg', prompt: '轻轻告诉它：Egg', aliases: ['egg', '蛋'] } },
    { id: 'choose-path', label: '选择护蛋路线', worldId: 'fern-valley', durationMs: 24_000, line: '前面有软软的泥巴路，也有高高的蕨叶桥。蛋不能摔跤，小队长选哪条？', objective: 'invite', motif: 'careful-balance', intensity: .72, outfit: 'explorer', entities: [egg()], interaction: { kind: 'choice', target: 'nest-path', prompt: '为恐龙蛋选择安全路线', options: [{ value: 'mud', label: '泥巴路', emoji: '🟤' }, { value: 'fern', label: '蕨叶桥', emoji: '🌿' }] } },
    { id: 'crossing', label: '护蛋大挑战', worldId: 'fern-valley', durationMs: 19_000, line: '慢慢走，摇一下，停一下。哎呀我差点坐到蛋上！还好你提醒了我。', objective: 'play', motif: 'careful-balance', intensity: .78, outfit: 'explorer', entities: [egg(true)] },
    { id: 'rumble', label: '火山打了个喷嚏', worldId: 'fern-valley', durationMs: 17_000, line: '轰隆！不是生气，是远处火山打了一个大喷嚏。我们抱住蛋，等地面安静。', objective: 'comfort', motif: 'protect-close', intensity: .8, outfit: 'explorer', entities: [egg()] },
    { id: 'nest', label: '回到温暖的巢', worldId: 'fern-valley', durationMs: 18_000, line: '到了！恐龙妈妈低下长脖子，轻轻碰碰它的 egg。它在说谢谢你。', objective: 'reassure', motif: 'warm-reunion', intensity: .8, outfit: 'explorer', entities: [egg(true), dino('excited')] },
    { id: 'hatch', label: '咔嚓小惊喜', worldId: 'fern-valley', durationMs: 18_000, line: '咔嚓！里面伸出一只小脚——今天不全出来，只先和你击个小小的掌！', objective: 'celebrate', motif: 'joyful-clap', intensity: .94, outfit: 'explorer', entities: [{ ...egg(true), emoji: '🐣' }, dino('playful')] },
    { id: 'goodbye', label: '恐龙跺脚舞', worldId: 'fern-valley', durationMs: 16_000, line: 'Dinosaur 和 egg 都安全啦。我们跳三下恐龙跺脚舞：咚、咚、咚！', objective: 'celebrate', motif: 'stomp-dance', intensity: .95, outfit: 'explorer', entities: [dino('playful')] },
    { id: 'return', label: '时光机返航', worldId: 'home-route', durationMs: 17_000, line: '把远古的风装进口袋。记住：dinosaur 是恐龙，egg 是蛋。现在回到今天！', objective: 'reassure', motif: 'calm-breathe', intensity: .58, outfit: 'explorer', vehicle: { id: 'tick-tock-time-machine', cockpit: true } },
    { id: 'home', label: '回到冒险基地', worldId: 'snow-base', durationMs: 12_000, line: '时光任务完成！你观察得仔细，走得又稳，是恐龙蛋最棒的护送员！', objective: 'celebrate', motif: 'proud-show', intensity: .86, outfit: 'none' },
  ],
};
