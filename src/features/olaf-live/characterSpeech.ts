import type { PerformanceMotifDefinition } from './performanceImproviser';
import type { DramaticObjective, VoiceFeatures } from './rig';

export interface SpeechDelivery {
  style: 'assistant' | 'chat' | 'cheerful' | 'embarrassed' | 'fearful' | 'narration-relaxed' | 'sad' | 'serious';
  styleDegree: number;
  rate: number;
  pitch: number;
  volume: number;
}

export interface CharacterSpeechRequest {
  text: string;
  delivery?: SpeechDelivery;
}

export interface SpeechOutputCallbacks {
  onStart(): void;
  onPulse(features: VoiceFeatures): void;
  onEnd(): void;
  onError(message: string): void;
}

export interface SpeechOutputAdapter {
  speak(request: CharacterSpeechRequest, callbacks: SpeechOutputCallbacks): void;
  cancel(): void;
  /** Optional look-ahead hook used by low-latency adapters such as Azure. */
  preload?(requests: readonly CharacterSpeechRequest[]): void;
}

export const DEFAULT_OLAF_DELIVERY: SpeechDelivery = {
  style: 'chat', styleDegree: 1, rate: -4, pitch: 8, volume: 96,
};

export const CHARACTER_LINES: Record<string, string[]> = {
  'joyful-clap': ['太棒啦！给你拍拍手！', 'You did it！啪、啪、啪！', '哇！这次真的好厉害！', 'Great job, my friend!', 'Clap with me! One, two!'],
  'jump-cheer': ['耶！我要跳到云朵上啦！', 'Hooray！我们成功啦！', '看我为你跳一个大大的耶！', 'Let us jump for joy!', 'Up, up, and hooray!'],
  'proud-show': ['瞧，这就是我们的成果！', 'Ta-da！是不是很了不起？', '嘿嘿，我都忍不住挺起胸啦！', 'Look what we made!', 'I am so proud of you!'],
  'surprise-find': ['哇！我发现了一个秘密！', 'Oh！快看那边！', '咦？这个惊喜从哪里冒出来的？', 'Wow, what is that?', 'What a lovely surprise!'],
  'sad-cry': ['呜……我的小心心有点难过。', '我想哭一下，可以陪陪我吗？', '眼泪掉下来啦……抱抱好吗？', 'I feel a little sad.', 'Can I have a hug?'],
  'hold-tears': ['我、我才没有哭呢……', '先吸一口气，我可以忍住。', '眼泪在打转，但我会慢慢好起来。', 'I will take a slow breath.', 'It is okay to feel sad.'],
  'agree-nod': ['嗯嗯！我也这样想！', 'Yes！你说得对！', '没错没错，我认真地点头！', 'Yes, that is right!', 'I agree with you!'],
  'refuse-shake': ['不行不行，这样不安全。', 'No, thank you！我们换一个吧。', '我摇摇头，因为我要保护你。', 'No, let us stay safe.', 'Let us try another way.'],
  'deep-listen': ['嗯嗯，我在认真听。', '然后呢？你慢慢告诉我。', '我听见啦，你的话很重要。', 'I am listening to you.', 'Tell me more, please.'],
  'curious-tilt': ['咦？这是什么呀？', 'Hmm……让我歪着头想想。', '你也发现这个奇怪的小东西了吗？', 'Hmm, what could it be?', 'Let us look together!'],
  'wave-invite': ['嗨！快来和我一起玩！', 'Come on！我在这里呀！', '挥挥手，到你加入我们啦！', 'Hello! Come play with me!', 'Wave your hand like this!'],
  'open-welcome': ['欢迎你！给你一个大大的拥抱！', 'Welcome, my friend！', '我的手臂张得这么大，都是给你的！', 'Come in, you are welcome!', 'A big hug just for you!'],
  'puzzled-think': ['嗯……这个要怎么做呢？', 'Let me think……', '奇怪，答案藏到哪里去了？', 'How can we solve this?', 'Maybe we need a new idea.'],
  'idea-pop': ['啊哈！我想到办法啦！', 'I got it！答案在这里！', '叮！我的雪人脑袋亮起来啦！', 'Aha, I have an idea!', 'We found the answer!'],
  'search-around': ['左边没有，右边也没有……', 'Where are you？小秘密！', '让我转一圈找找看！', 'Let us look over here!', 'Is it hiding over there?'],
  'inspect-close': ['我靠近一点看看……', '哇，原来这里有小花纹！', '别动别动，让我的鼻子看清楚。', 'Let me take a closer look.', 'I can see it now!'],
  'look-back': ['等等，你刚刚叫我了吗？', '我回头确认一下，你还在呢！', 'There you are！我看到你啦！', 'Did you call my name?', 'I see you behind me!'],
  'shy-avoid': ['嘿嘿……你这样看我，我会害羞。', '我先看旁边一下下。', '好啦，我又悄悄看回来啦。', 'I feel a little shy.', 'Okay, I am looking back!'],
  'gentle-comfort': ['别担心，我靠近一点陪你。', '我们慢慢来，我就在这里。', '给你一点暖暖的雪人勇气。', 'I am right here with you.', 'We can do this together.'],
  'run-to-you': ['等等我，我马上跑过来！', 'Here I come！接住我！', '哒哒哒！雪宝来陪你啦！', 'Wait for me, I am coming!', 'Run, run, here I come!'],
  'pace-around': ['走过来，走过去，我在想办法。', '一步、两步……答案快出来！', '我的脚在走，脑袋也在转呀！', 'Step, step, think, think!', 'I am walking out an idea.'],
  'tiptoe-peek': ['嘘……我踮起脚偷偷看。', '再高一点点，我就看见啦！', 'Peek-a-boo！那里藏着什么？', 'Tiptoe, quiet as snow!', 'Can you see it up there?'],
  'small-hop': ['一小步，再跳一下！', 'Hop, hop！跟我一起！', '我的小脚今天特别开心！', 'Little hops, here we go!', 'Hop with me, my friend!'],
  'big-jump': ['准备——一、二、跳！', 'Big jump！飞起来啦！', '这一跳要送给最棒的你！', 'Ready, set, big jump!', 'Look at me fly so high!'],
  'soft-comfort': ['别担心，我在这里。', '我们一起慢慢来，好吗？', '小小的错误，也可以轻轻修好。', 'It is okay, take your time.', 'I will stay here with you.'],
  'excited-tell': ['快听快听！我有个超棒的发现！', '你知道吗？故事马上开始啦！', 'Oh wow！这件事太有趣啦！', 'Listen, this is amazing!', 'I have a story for you!'],
  'share-secret': ['嘘，我只告诉你一个人。', '靠近一点，这是我们的小秘密。', '小小声说：你真的很棒。', 'Come closer, it is a secret.', 'You are wonderfully brave.'],
  'silly-play': ['嘿嘿，看我的超级雪人步！', '糟糕，我的脚又不听话啦！', 'Silly me！我的鼻子差点飞走啦！', 'Look at my silly dance!', 'Oops, my feet ran away!'],
  'nervous-wait': ['你觉得会成功吗？我有一点紧张。', '我先等等……心里扑通扑通。', '抓住我的手，我们一起等答案。', 'I feel a little nervous.', 'Let us wait together.'],
  'calm-breathe': ['呼——我们先放松一下。', '慢慢吸气，再慢慢呼气。', 'In……out……身体变得软软的。', 'Breathe in, breathe out.', 'Slow and calm, just like snow.'],
};

/** Picks a line outside the recent window when possible, then advances deterministically. */
export function chooseFreshCharacterLine(lines: readonly string[], preferredIndex: number, recentLines: readonly string[]) {
  if (lines.length === 0) return { text: '', index: 0 };
  const recent = new Set(recentLines);
  for (let offset = 0; offset < lines.length; offset += 1) {
    const index = (preferredIndex + offset) % lines.length;
    if (!recent.has(lines[index])) return { text: lines[index], index };
  }
  const index = preferredIndex % lines.length;
  return { text: lines[index], index };
}

export function deliveryForMotif(motif: PerformanceMotifDefinition): SpeechDelivery {
  const base = deliveryForObjective(motif.objective);
  if (motif.id === 'sad-cry') return { ...base, style: 'sad', styleDegree: 1.35, rate: -22, pitch: -8, volume: 82 };
  if (motif.id === 'hold-tears') return { ...base, style: 'sad', styleDegree: 0.72, rate: -18, pitch: -5, volume: 78 };
  if (motif.id === 'share-secret') return { ...base, style: 'chat', styleDegree: 0.8, rate: -24, pitch: 2, volume: 55 };
  if (motif.id === 'nervous-wait') return { ...base, style: 'fearful', styleDegree: 0.76, rate: -10, pitch: 7, volume: 76 };
  if (motif.id === 'shy-avoid' || motif.id === 'puzzled-think') return { ...base, style: 'embarrassed', styleDegree: 0.72, rate: -14, pitch: 5, volume: 78 };
  if (motif.id === 'soft-comfort' || motif.id === 'gentle-comfort' || motif.id === 'calm-breathe') {
    return { ...base, style: 'narration-relaxed', styleDegree: 0.82, rate: -20, pitch: 1, volume: 74 };
  }
  if (motif.objective === 'celebrate' || motif.id === 'excited-tell' || motif.id === 'idea-pop') {
    return { ...base, style: 'cheerful', styleDegree: 1.4, rate: 12, pitch: 14, volume: 100 };
  }
  if (motif.objective === 'play' || motif.objective === 'invite') {
    return { ...base, style: 'cheerful', styleDegree: 1.12, rate: 5, pitch: 11, volume: 96 };
  }
  if (motif.id === 'refuse-shake') return { ...base, style: 'serious', styleDegree: 0.72, rate: -8, pitch: 2, volume: 88 };
  return base;
}

export function deliveryForObjective(objective: DramaticObjective): SpeechDelivery {
  if (objective === 'celebrate') return { ...DEFAULT_OLAF_DELIVERY, style: 'cheerful', styleDegree: 1.32, rate: 10, pitch: 13, volume: 100 };
  if (objective === 'comfort') return { ...DEFAULT_OLAF_DELIVERY, style: 'narration-relaxed', styleDegree: 0.82, rate: -18, pitch: 1, volume: 76 };
  if (objective === 'invite' || objective === 'play') return { ...DEFAULT_OLAF_DELIVERY, style: 'cheerful', styleDegree: 1.12, rate: 5, pitch: 11, volume: 96 };
  if (objective === 'reassure') return { ...DEFAULT_OLAF_DELIVERY, style: 'assistant', styleDegree: 0.92, rate: -8, pitch: 5, volume: 88 };
  return { ...DEFAULT_OLAF_DELIVERY };
}

const escapeXml = (text: string) => text
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

const percentage = (value: number) => `${value >= 0 ? '+' : ''}${Math.round(value)}%`;

export function buildAzureSsml(request: CharacterSpeechRequest, voiceName = 'zh-CN-YunxiNeural') {
  const delivery = request.delivery ?? DEFAULT_OLAF_DELIVERY;
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="zh-CN"><voice name="${escapeXml(voiceName)}"><mstts:express-as role="Boy" style="${delivery.style}" styledegree="${delivery.styleDegree}"><prosody rate="${percentage(delivery.rate)}" pitch="${percentage(delivery.pitch)}" volume="${delivery.volume}">${escapeXml(request.text)}</prosody></mstts:express-as></voice></speak>`;
}

const mouth = (jawOpen: number, mouthWide: number, mouthPucker: number) => ({ jawOpen, mouthWide, mouthPucker });

export function mapAzureViseme(visemeId: number) {
  const shapes: Record<number, ReturnType<typeof mouth>> = {
    0: mouth(0, 0.2, 0), 1: mouth(0.62, 0.48, 0.08), 2: mouth(0.92, 0.36, 0.04),
    3: mouth(0.72, 0.18, 0.52), 4: mouth(0.48, 0.58, 0.08), 5: mouth(0.46, 0.28, 0.38),
    6: mouth(0.3, 0.82, 0), 7: mouth(0.34, 0.08, 0.9), 8: mouth(0.5, 0.12, 0.72),
    9: mouth(0.7, 0.18, 0.5), 10: mouth(0.58, 0.42, 0.36), 11: mouth(0.66, 0.62, 0.08),
    12: mouth(0.38, 0.34, 0.04), 13: mouth(0.38, 0.28, 0.18), 14: mouth(0.3, 0.46, 0.04),
    15: mouth(0.2, 0.58, 0), 16: mouth(0.28, 0.42, 0.26), 17: mouth(0.18, 0.46, 0.02),
    18: mouth(0.12, 0.46, 0.02), 19: mouth(0.16, 0.4, 0.02), 20: mouth(0.2, 0.3, 0.06),
    21: mouth(0.04, 0.18, 0.06),
  };
  return shapes[visemeId] ?? shapes[0];
}
