import { PERFORMANCE_MOTIFS } from './performanceImproviser';
import type { DramaticObjective } from './rig';

export const THEATER_BEAT_COUNT = 7;

export type TheaterBeatRole = 'hook' | 'setup' | 'build' | 'turn' | 'punchline' | 'callback' | 'button';

interface TheaterBeatDefinition {
  role: TheaterBeatRole;
  line: string;
  motifId: string;
}

interface TheaterShowDefinition {
  id: string;
  title: string;
  desiredChildFeeling: string;
  beats: TheaterBeatDefinition[];
}

export interface TheaterMoment {
  showId: string;
  showTitle: string;
  sceneNumber: number;
  sceneProgress: number;
  desiredChildFeeling: string;
  beatId: string;
  beatIndex: number;
  beatRole: TheaterBeatRole;
  line: string;
  motifId: string;
  objective: DramaticObjective;
}

export interface OlafTheater {
  sample(elapsedMs: number): TheaterMoment;
  completeLine(beatId: string, completedAtMs: number): void;
}

const REACTION_PAUSE_MS: Record<TheaterBeatRole, number> = {
  hook: 1_250,
  setup: 1_150,
  build: 1_350,
  turn: 1_550,
  punchline: 1_900,
  callback: 1_450,
  button: 2_300,
};

const MINIMUM_BEAT_DURATION_MS: Record<TheaterBeatRole, number> = {
  hook: 5_800,
  setup: 5_800,
  build: 6_000,
  turn: 6_200,
  punchline: 6_800,
  callback: 6_000,
  button: 7_200,
};

const shows: TheaterShowDefinition[] = [
  {
    id: 'warm-comfort', title: 'A组 · 雪宝的暖暖安慰', desiredChildFeeling: '被理解，并愿意再试一次',
    beats: [
      { role: 'hook', motifId: 'curious-tilt', line: '咦，你的小眉毛怎么打结啦？' },
      { role: 'setup', motifId: 'deep-listen', line: '是不是有一点点难过？' },
      { role: 'build', motifId: 'soft-comfort', line: '难过不用赶走，我陪它坐一会儿。' },
      { role: 'turn', motifId: 'hold-tears', line: '其实我也会哭，雪人也有小心心。' },
      { role: 'punchline', motifId: 'silly-play', line: '可我一哭，鼻子差点变成小船！' },
      { role: 'callback', motifId: 'calm-breathe', line: '来，吸气——再把烦恼吹远一点。' },
      { role: 'button', motifId: 'gentle-comfort', line: '好啦，我陪你再试一次。' },
    ],
  },
  {
    id: 'little-adventure', title: 'B组 · 小队长冰雪冒险', desiredChildFeeling: '勇敢、好奇，想加入冒险',
    beats: [
      { role: 'hook', motifId: 'proud-show', line: '报告小队长，雪地出现神秘脚印！' },
      { role: 'setup', motifId: 'tiptoe-peek', line: '我先踮脚看看……你负责勇敢。' },
      { role: 'build', motifId: 'search-around', line: '左边没有，右边有一根胡萝卜！' },
      { role: 'turn', motifId: 'surprise-find', line: '等等，那好像就是我的鼻子！' },
      { role: 'punchline', motifId: 'run-to-you', line: '鼻子先冒险，我只好追过去啦！' },
      { role: 'callback', motifId: 'big-jump', line: '前面是冰河——一、二、跳！' },
      { role: 'button', motifId: 'joyful-clap', line: '任务完成，小队长最勇敢！' },
    ],
  },
  {
    id: 'bravo-child', title: 'C组 · 今天我要夸夸你', desiredChildFeeling: '为自己感到骄傲',
    beats: [
      { role: 'hook', motifId: 'surprise-find', line: '哇，我刚刚发现一件大事！' },
      { role: 'setup', motifId: 'deep-listen', line: '这里有个小朋友一直很认真。' },
      { role: 'build', motifId: 'proud-show', line: '他会想办法，还会再试一次。' },
      { role: 'turn', motifId: 'look-back', line: '是谁呢？我回头找找……' },
      { role: 'punchline', motifId: 'idea-pop', line: '啊哈，就是屏幕前面的你！' },
      { role: 'callback', motifId: 'joyful-clap', line: 'Clap, clap! 这是你的掌声！' },
      { role: 'button', motifId: 'open-welcome', line: '今天的你，值得一个大大拥抱。' },
    ],
  },
  {
    id: 'olaf-heart', title: 'D组 · 雪宝的小小心声', desiredChildFeeling: '更亲近雪宝，也敢表达感受',
    beats: [
      { role: 'hook', motifId: 'share-secret', line: '嘘，我有一句心里话。' },
      { role: 'setup', motifId: 'shy-avoid', line: '有时大家看我，我也会害羞。' },
      { role: 'build', motifId: 'puzzled-think', line: '我还会想：雪人也会做错吗？' },
      { role: 'turn', motifId: 'sad-cry', line: '答案是会，而且偶尔还会难过。' },
      { role: 'punchline', motifId: 'silly-play', line: '但我最常做错的，是装反自己的头！' },
      { role: 'callback', motifId: 'calm-breathe', line: '说出来以后，心里就松松的。' },
      { role: 'button', motifId: 'gentle-comfort', line: '你的心里话，我也愿意听。' },
    ],
  },
  {
    id: 'disney-friends', title: 'E组 · 我的迪士尼朋友们', desiredChildFeeling: '感到友情有趣又温暖',
    beats: [
      { role: 'hook', motifId: 'excited-tell', line: '今天讲讲我的朋友们！' },
      { role: 'setup', motifId: 'run-to-you', line: '安娜跑得很快，拥抱来得更快。' },
      { role: 'build', motifId: 'proud-show', line: '艾莎一挥手，雪花就会跳舞。' },
      { role: 'turn', motifId: 'search-around', line: '克斯托夫最懂雪，可他总在找斯文。' },
      { role: 'punchline', motifId: 'look-back', line: '斯文在哪？哦，他正在我背后！' },
      { role: 'callback', motifId: 'joyful-clap', line: '朋友会笑你，也会为你鼓掌。' },
      { role: 'button', motifId: 'open-welcome', line: '欢迎你，也成为我们的朋友。' },
    ],
  },
  {
    id: 'snowman-day', title: 'F组 · 雪人的搞笑一天', desiredChildFeeling: '放松并开怀一笑',
    beats: [
      { role: 'hook', motifId: 'excited-tell', line: '雪人的早晨，从找鼻子开始。' },
      { role: 'setup', motifId: 'search-around', line: '床底没有，帽子里也没有。' },
      { role: 'build', motifId: 'pace-around', line: '我找了一圈，肚子都饿啦。' },
      { role: 'turn', motifId: 'inspect-close', line: '早餐有胡萝卜……怎么这么眼熟？' },
      { role: 'punchline', motifId: 'surprise-find', line: '啊！原来早餐就是我的鼻子！' },
      { role: 'callback', motifId: 'silly-play', line: '算啦，今天还是吃空气吧。' },
      { role: 'button', motifId: 'small-hop', line: '空气吃饱了，出门跳一跳！' },
    ],
  },
  {
    id: 'english-magic', title: 'G组 · 雪宝的英语魔法', desiredChildFeeling: '愿意轻松开口说英语',
    beats: [
      { role: 'hook', motifId: 'share-secret', line: '我发现了一个英语魔法。' },
      { role: 'setup', motifId: 'wave-invite', line: '见到朋友，就说 Hello!' },
      { role: 'build', motifId: 'joyful-clap', line: '做得真棒，就说 Great job!' },
      { role: 'turn', motifId: 'puzzled-think', line: '看到胡萝卜，该说什么呢？' },
      { role: 'punchline', motifId: 'surprise-find', line: 'Oh no! My nose!' },
      { role: 'callback', motifId: 'agree-nod', line: 'Hello, nose. Nice to meet you!' },
      { role: 'button', motifId: 'open-welcome', line: 'Your turn! 大声说 Hello!' },
    ],
  },
  {
    id: 'sleepy-snow', title: 'H组 · 睡前的一朵小雪花', desiredChildFeeling: '安静、安心并准备休息',
    beats: [
      { role: 'hook', motifId: 'tiptoe-peek', line: '嘘，有一朵小雪花还不想睡。' },
      { role: 'setup', motifId: 'look-back', line: '它飞到左边，又飞到右边。' },
      { role: 'build', motifId: 'pace-around', line: '它说：我还要再玩一小圈。' },
      { role: 'turn', motifId: 'calm-breathe', line: '月亮轻轻说：先慢慢呼吸。' },
      { role: 'punchline', motifId: 'small-hop', line: '小雪花一躺下，变成了小被子。' },
      { role: 'callback', motifId: 'soft-comfort', line: '眼睛休息，梦就会来找你。' },
      { role: 'button', motifId: 'gentle-comfort', line: '晚安，我会安静地陪着你。' },
    ],
  },
];

const motifById = new Map(PERFORMANCE_MOTIFS.map((motif) => [motif.id, motif]));

const unit = (seed: number) => {
  const value = Math.sin(seed * 12.9898) * 43_758.5453;
  return value - Math.floor(value);
};

function showIndexAt(seed: number, sceneNumber: number) {
  const start = Math.floor(unit(seed) * shows.length);
  const steps = [1, 3, 5, 7];
  const step = steps[Math.floor(unit(seed + 91.7) * steps.length)];
  return (start + sceneNumber * step) % shows.length;
}

/** A completion-driven children's monologue director. Wall-clock time never skips unfinished acting. */
export function createOlafTheater(seed = Math.random() * 10_000): OlafTheater {
  let sceneNumber = 0;
  let beatIndex = 0;
  let beatStartedAt = 0;
  let readyToAdvanceAt: number | null = null;

  const currentShow = () => shows[showIndexAt(seed, sceneNumber)];

  return {
    sample(elapsedMs) {
      const safeTime = Math.max(0, Number.isFinite(elapsedMs) ? elapsedMs : 0);
      if (readyToAdvanceAt !== null && safeTime >= readyToAdvanceAt) {
        readyToAdvanceAt = null;
        beatStartedAt = safeTime;
        if (beatIndex < THEATER_BEAT_COUNT - 1) {
          beatIndex += 1;
        } else {
          beatIndex = 0;
          sceneNumber += 1;
        }
      }

      const show = currentShow();
      const beat = show.beats[beatIndex];
      const motif = motifById.get(beat.motifId);
      if (!motif) throw new Error(`Unknown theater motif: ${beat.motifId}`);
      return {
        showId: show.id,
        showTitle: show.title,
        sceneNumber,
        sceneProgress: (beatIndex + (readyToAdvanceAt === null ? 0.18 : 0.82)) / THEATER_BEAT_COUNT,
        desiredChildFeeling: show.desiredChildFeeling,
        beatId: `${sceneNumber}-${show.id}-${beatIndex}`,
        beatIndex,
        beatRole: beat.role,
        line: beat.line,
        motifId: beat.motifId,
        objective: motif.objective,
      };
    },
    completeLine(beatId, completedAtMs) {
      const show = currentShow();
      const beat = show.beats[beatIndex];
      const expectedBeatId = `${sceneNumber}-${show.id}-${beatIndex}`;
      if (beatId !== expectedBeatId || readyToAdvanceAt !== null) return;
      const safeTime = Math.max(0, Number.isFinite(completedAtMs) ? completedAtMs : 0);
      readyToAdvanceAt = Math.max(
        safeTime + REACTION_PAUSE_MS[beat.role],
        beatStartedAt + MINIMUM_BEAT_DURATION_MS[beat.role],
      );
    },
  };
}
