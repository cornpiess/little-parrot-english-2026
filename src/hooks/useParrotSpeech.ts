import { useState, useRef, useCallback } from 'react';

// ============================================================
// Audio helpers
// ============================================================
let audioCtx: AudioContext | null = null;
function getAudioCtx() {
  if (!audioCtx && typeof window !== 'undefined') audioCtx = new AudioContext();
  return audioCtx;
}
function playTone(freq: number, duration: number, type: OscillatorType = 'sine', vol = 0.12) {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch { /* ignore */ }
}
export const playPop = () => playTone(800, 0.08, 'sine', 0.1);
export const playCrack = () => { playTone(300, 0.06, 'square', 0.12); setTimeout(() => playTone(200, 0.08, 'square', 0.1), 60); };
export const playSuccess = () => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.2, 'sine', 0.1), i * 80)); };
export const playCelebration = () => { [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => playTone(f, 0.25, 'sine', 0.12), i * 100)); };

// ============================================================
// TTS - English only, with parrot state sync
// ============================================================
export function speakText(
  text: string,
  opts?: { rate?: number; pitch?: number; lang?: string; onStart?: () => void; onEnd?: () => void }
) {
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = opts?.lang ?? 'en-US';
    u.rate = opts?.rate ?? 0.85;
    u.pitch = opts?.pitch ?? 1.2;
    u.volume = 0.9;
    u.onstart = () => opts?.onStart?.();
    u.onend = () => opts?.onEnd?.();
    u.onerror = () => opts?.onEnd?.();
    window.speechSynthesis.speak(u);
  } catch {
    opts?.onEnd?.();
  }
}

export function stopSpeech() {
  window.speechSynthesis.cancel();
}

export type ParrotAnim =
  | 'idle' | 'listening' | 'thinking' | 'speaking' | 'sleeping' | 'greeting'
  | 'surprised' | 'happy' | 'clap' | 'wave' | 'dance' | 'bounce' | 'nod' | 'spin' | 'hearts' | 'excited'
  | 'fly' | 'cheer' | 'shake' | 'dizzy' | 'shy' | 'peek';

// ============================================================
// Speech hook - queue-based English TTS with parrot animation sync.
// Each page that needs the parrot to talk uses its own instance,
// keeping page state isolated.
// ============================================================
export function useParrotSpeech() {
  const queueRef = useRef<string[]>([]);
  const isSpeakingRef = useRef(false);
  const sessionRef = useRef(0);
  const parrotTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const [parrot, setParrot] = useState<ParrotAnim>('idle');

  const speak = useCallback((text: string, onDone?: () => void, lang = 'en-US', action?: ParrotAnim) => {
    stopSpeech();
    isSpeakingRef.current = true;
    setParrot(action ?? 'speaking');
    speakText(text, {
      lang,
      onStart: () => setParrot(action ?? 'speaking'),
      onEnd: () => onDone?.(),
    });
  }, [setParrot]);

  const processQueue = useCallback((session: number, onAllDone?: () => void, lang = 'en-US', action?: ParrotAnim) => {
    if (session !== sessionRef.current) return;
    if (queueRef.current.length === 0) {
      isSpeakingRef.current = false;
      onAllDone?.();
      return;
    }
    const text = queueRef.current.shift()!;
    speak(text, () => {
      setTimeout(() => processQueue(session, onAllDone, lang, action), 600);
    }, lang, action);
  }, [speak]);

  const sayLines = useCallback((lines: string[], onAllDone?: () => void, lang?: string, action?: ParrotAnim) => {
    const session = ++sessionRef.current;
    stopSpeech();
    queueRef.current = [...lines];
    processQueue(session, onAllDone, lang ?? 'en-US', action);
  }, [processQueue]);

  const showParrotAction = useCallback((action: ParrotAnim, duration = 2000) => {
    setParrot(action);
    if (parrotTimerRef.current) clearTimeout(parrotTimerRef.current);
    parrotTimerRef.current = setTimeout(() => {
      if (!isSpeakingRef.current) setParrot('idle');
    }, duration);
  }, [setParrot]);

  // 作废当前语音会话并清空队列（用于页面切换/重玩）
  const resetSpeech = useCallback(() => {
    stopSpeech();
    sessionRef.current++;
    queueRef.current = [];
    isSpeakingRef.current = false;
    setParrot('idle');
  }, [setParrot]);

  return { parrot, setParrot, speak, sayLines, showParrotAction, resetSpeech };
}
