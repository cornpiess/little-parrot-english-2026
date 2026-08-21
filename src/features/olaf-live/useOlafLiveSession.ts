import { useCallback, useEffect, useRef, useState } from 'react';
import { signalsFromToolCall, perceptionToSignals } from './actionDirector';
import { analysisToSignal, analyzePcm16, MicrophoneCapture, PcmAudioOutput } from './audioAnalyzer';
import { GeminiLiveSession } from './geminiLive';
import { LocalPerception } from './localPerception';
import { createIdlePerformance, reducePerformanceFrame } from './performanceEngine';
import type { CharacterToolCall, PerformanceFrame, PerformanceSignal, PerceptionEvent, RealtimeCharacterSession } from './types';

export type LiveStatus = 'offline' | 'connecting' | 'ready' | 'listening' | 'speaking' | 'error';

export interface UseOlafLiveSessionOptions {
  sessionFactory?: () => RealtimeCharacterSession;
}

export function useOlafLiveSession(options: UseOlafLiveSessionOptions = {}) {
  const sessionFactory = options.sessionFactory;
  const [frame, setFrame] = useState<PerformanceFrame>(() => createIdlePerformance());
  const [status, setStatus] = useState<LiveStatus>('offline');
  const [transcript, setTranscript] = useState<string[]>([]);
  const [inputTranscript, setInputTranscript] = useState('');
  const [error, setError] = useState('');
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const sessionRef = useRef<RealtimeCharacterSession | null>(null);
  const microphoneRef = useRef<MicrophoneCapture | null>(null);
  const outputRef = useRef<PcmAudioOutput | null>(null);
  const perceptionRef = useRef<LocalPerception | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef(frame);
  const signalsRef = useRef<PerformanceSignal[]>([]);
  const lastPerceptionSentRef = useRef(0);
  const rafRef = useRef(0);
  const lastFrameAtRef = useRef(performance.now());

  const enqueue = useCallback((...signals: PerformanceSignal[]) => {
    signalsRef.current.push(...signals);
  }, []);

  const onPerception = useCallback((event: PerceptionEvent) => {
    enqueue(...perceptionToSignals(event));
    const now = performance.now();
    const shouldShare = event.type !== 'face' || Boolean(event.gesture) || now - lastPerceptionSentRef.current > 650;
    if (shouldShare) {
      lastPerceptionSentRef.current = now;
      sessionRef.current?.sendPerception(event);
    }
  }, [enqueue]);

  const connect = useCallback(async () => {
    if (sessionRef.current) return;
    setStatus('connecting');
    setError('');
    const session = sessionFactory?.() ?? new GeminiLiveSession();
    sessionRef.current = session;
    outputRef.current = new PcmAudioOutput();
    session.subscribe((event) => {
      if (event.type === 'status') {
        const value = String(event.data);
        if (value === 'connected' || value === 'ready') setStatus('ready');
        if (value === 'turn-complete') {
          enqueue({ type: 'mode', mode: 'listening' });
          setStatus('listening');
        }
      } else if (event.type === 'audio' && event.data instanceof ArrayBuffer) {
        const analysis = analyzePcm16(event.data, 24000);
        enqueue(analysisToSignal(analysis), { type: 'mode', mode: 'speaking' });
        setStatus('speaking');
        void outputRef.current?.play(event.data, 24000);
      } else if (event.type === 'transcript') {
        setTranscript((current) => [...current.slice(-19), String(event.data ?? '')]);
      } else if (event.type === 'input-transcript') {
        setInputTranscript(String(event.data ?? ''));
      } else if (event.type === 'tool-call' && event.data) {
        enqueue(...signalsFromToolCall(event.data as CharacterToolCall));
      } else if (event.type === 'error') {
        setStatus('error');
        setError(String(event.data ?? '连接失败'));
      }
    });
    try {
      await session.connect();
      setStatus('listening');
      enqueue({ type: 'mode', mode: 'listening' });
    } catch (connectionError) {
      session.close();
      sessionRef.current = null;
      setStatus('error');
      setError(connectionError instanceof Error ? connectionError.message : '无法连接实时语音');
    }
  }, [enqueue, sessionFactory]);

  const startMicrophone = useCallback(async () => {
    if (!sessionRef.current || microphoneRef.current) return;
    const microphone = new MicrophoneCapture();
    microphoneRef.current = microphone;
    try {
      await microphone.start((chunk, analysis) => {
        sessionRef.current?.sendAudio(chunk);
        if (analysis.speaking) enqueue({ type: 'mode', mode: 'listening' });
      });
      setMicEnabled(true);
    } catch (microphoneError) {
      microphoneRef.current = null;
      setError(microphoneError instanceof Error ? microphoneError.message : '麦克风不可用');
    }
  }, [enqueue]);

  const toggleCamera = useCallback(async () => {
    if (cameraEnabled) {
      perceptionRef.current?.stop();
      perceptionRef.current = null;
      setCameraEnabled(false);
      return;
    }
    if (!videoRef.current) return;
    const perception = new LocalPerception();
    perceptionRef.current = perception;
    try {
      await perception.start(videoRef.current, { onEvent: onPerception });
      setCameraEnabled(true);
    } catch (cameraError) {
      perception.stop();
      perceptionRef.current = null;
      setError(cameraError instanceof Error ? cameraError.message : '摄像头不可用');
    }
  }, [cameraEnabled, onPerception]);

  const setPointerGaze = useCallback((x: number, y: number) => {
    onPerception({ type: 'pointer', confidence: 1, x, y, timestamp: Date.now() });
  }, [onPerception]);

  const trigger = useCallback((signal: PerformanceSignal) => enqueue(signal), [enqueue]);

  const disconnect = useCallback(() => {
    microphoneRef.current?.stop();
    outputRef.current?.stop();
    outputRef.current?.close();
    perceptionRef.current?.stop();
    sessionRef.current?.close();
    microphoneRef.current = null;
    outputRef.current = null;
    perceptionRef.current = null;
    sessionRef.current = null;
    setMicEnabled(false);
    setCameraEnabled(false);
    setStatus('offline');
    enqueue({ type: 'mode', mode: 'idle' });
  }, [enqueue]);

  const interrupt = useCallback(() => {
    sessionRef.current?.interrupt();
    outputRef.current?.stop();
    enqueue({ type: 'mode', mode: 'listening' }, { type: 'speech', speaking: false, energy: 0, spectralCentroid: 0, emphasis: 0 });
    setStatus('listening');
  }, [enqueue]);

  useEffect(() => {
    const tick = (timestamp: number) => {
      const elapsed = Math.min(100, timestamp - lastFrameAtRef.current);
      lastFrameAtRef.current = timestamp;
      const next = reducePerformanceFrame(frameRef.current, signalsRef.current.splice(0), elapsed);
      frameRef.current = next;
      setFrame(next);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => () => disconnect(), [disconnect]);

  return {
    frame,
    status,
    transcript,
    inputTranscript,
    error,
    cameraEnabled,
    micEnabled,
    videoRef,
    connect,
    startMicrophone,
    toggleCamera,
    setPointerGaze,
    trigger,
    interrupt,
    disconnect,
  };
}
