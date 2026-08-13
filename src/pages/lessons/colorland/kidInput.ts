// ============================================================
// 幼儿全局输入分发：把协调器的摄像头手势识别、
// 语音识别结果 转给「当前正在互动」的那个 KidTurn。
// 同一时刻只有一个互动在等待，所以用模块级单例即可。
// ============================================================
import type { GestureType } from '../../../hooks/useGestureControl';
import { playPop } from '../../../hooks/useParrotSpeech';
import type { ParrotAnim } from '../../../hooks/useParrotSpeech';

type TurnHandler = (g: NonNullable<GestureType>) => void;
let current: TurnHandler | null = null;

/** KidTurn 挂载时注册自己为当前互动接收者；卸载/被替换时自动解除 */
export function registerKidGesture(h: TurnHandler): () => void {
  current = h;
  return () => { if (current === h) current = null; };
}

/** 协调器收到摄像头手势 → 派发给当前互动 */
export function dispatchKidGesture(g: NonNullable<GestureType>) {
  current?.(g);
}

// ============================================================
// 小鹦鹉动画总线：colorland 各 Part 把小鹦鹉的实时情绪（speaking/
// happy/wave…）发布到这里；协调器「摄像头右侧的小鹦鹉座」订阅它，
// 这样鹦鹉能离开课程内容区、坐在幼儿前置摄像头右侧，动画照常。
// ============================================================
type ParrotSub = (a: ParrotAnim) => void;
let parrotAnim: ParrotAnim = 'idle';
let parrotSub: ParrotSub | null = null;

/** 各 Part 发布当前小鹦鹉动画 */
export function publishKidParrot(a: ParrotAnim) {
  parrotAnim = a;
  parrotSub?.(a);
}

/** 鹦鹉座订阅动画（挂载即收到当前值；卸载自动解除） */
export function subscribeKidParrot(cb: ParrotSub): () => void {
  parrotSub = cb;
  cb(parrotAnim);
  return () => { if (parrotSub === cb) parrotSub = null; };
}

// ============================================================
// 语音识别（ASR，英文）——Chrome/Edge 支持 Web Speech API。
// 幼儿会说英语单词/短语；识别不到不会报错，只是没有结果。
// ============================================================
interface SpeechRecognitionEvent { results: { length: number; [idx: number]: { transcript: string } }[] }

export function startKidASR(onResult: (text: string) => void, onEnd?: () => void): () => void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!Ctor) { onEnd?.(); return () => {}; }
  const r = new Ctor();
  r.lang = 'en-US';
  r.interimResults = false;
  r.maxAlternatives = 5;
  r.continuous = false;
  r.onresult = (e: SpeechRecognitionEvent) => {
    for (let i = 0; i < e.results[0].length; i++) {
      onResult(e.results[0][i].transcript.trim().toLowerCase());
    }
  };
  r.onend = () => onEnd?.();
  r.onerror = () => onEnd?.();
  r.onstart = () => playPop();
  try { r.start(); } catch { onEnd?.(); }
  return () => { try { r.stop(); } catch { /* ignore */ } };
}

/** 匹配幼儿的语音：返回 yes / no / null（没听清） */
export function matchKidVoice(text: string): 'yes' | 'no' | null {
  const yesWords = ['yes', 'yep', 'yeah', 'yay', 'ya', "that's right", 'sure'];
  const noWords = ['no', 'nope', 'nah', 'not', 'stop'];
  for (const w of yesWords) if (text.includes(w)) return 'yes';
  for (const w of noWords) if (text.includes(w)) return 'no';
  return null;
}

/** 匹配说的话里是否包含某颜色词 */
export function matchColorVoice(text: string, colorWord: string): boolean {
  return text.includes(colorWord.toLowerCase()) || text.includes(colorWord.toLowerCase().slice(0, 3));
}

// ============================================================
// 吹气球：麦克风音量检测 —— 幼儿「呼～～」地吹气时音量瞬间变大，
// 用 AnalyserNode 侦测 RMS 峰值来当「吹了一口气」。不需要语音识别。
// 与摄像头 open_mouth（张嘴=吹气）配合使用，双保险。
// ============================================================
export function startBlowAudio(onBlow: () => void): () => void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;
  const ctx: AudioContext = new (win.AudioContext || win.webkitAudioContext)();
  let stream: MediaStream | null = null;
  let raf = 0;
  let lastBlowAt = 0;
  let cancelled = false;

  navigator.mediaDevices.getUserMedia({ audio: true }).then((s) => {
    if (cancelled) { s.getTracks().forEach((t) => t.stop()); return; }
    stream = s;
    const src = ctx.createMediaStreamSource(s);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    src.connect(analyser);
    const data = new Uint8Array(analyser.fftSize);
    const loop = () => {
      if (cancelled) return;
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / data.length);
      const now = performance.now();
      // 音量明显高于说话的平静值（吹气 ≈ 0.4~0.9），去抖 500ms 算一次
      if (rms > 0.35 && now - lastBlowAt > 500) {
        lastBlowAt = now;
        onBlow();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  }).catch(() => { /* 麦克风被拒：退化为只用摄像头 open_mouth */ });

  return () => {
    cancelled = true;
    cancelAnimationFrame(raf);
    stream?.getTracks().forEach((t) => t.stop());
    ctx.close().catch(() => {});
  };
}