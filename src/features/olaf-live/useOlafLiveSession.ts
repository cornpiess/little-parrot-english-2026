import { useCallback, useEffect, useRef, useState } from 'react';
import { inputsFromToolCall, perceptionToInputs } from './actionDirector';
import { analysisToInput, analyzePcm16, MicrophoneCapture, PcmAudioOutput } from './audioAnalyzer';
import { BrowserAsrCapture } from './browserAsr';
import { GeminiLiveSession } from './geminiLive';
import { LocalPerception } from './localPerception';
import { createRealtimePerformanceModel } from './performanceModel';
import type { PerformanceInput, VoiceFeatures } from './rig';
import type { RealtimePerformanceModel } from './performanceModel';
import type { CharacterToolCall, PerceptionEvent, RealtimeCharacterSession } from './types';

export type LiveStatus = 'offline' | 'connecting' | 'ready' | 'listening' | 'thinking' | 'speaking' | 'error';

export interface UseOlafLiveSessionOptions {
  sessionFactory?: () => RealtimeCharacterSession;
  performanceModelFactory?: () => RealtimePerformanceModel;
}

export function useOlafLiveSession(options: UseOlafLiveSessionOptions = {}) {
  const sessionFactory = options.sessionFactory;
  const [performanceModel] = useState(() => options.performanceModelFactory?.() ?? createRealtimePerformanceModel());
  const [frame, setFrame] = useState(() => performanceModel.reset(performance.now()));
  const [status, setStatus] = useState<LiveStatus>('offline');
  const [transcript, setTranscript] = useState<string[]>([]);
  const [inputTranscript, setInputTranscript] = useState('');
  const [latestToolCall, setLatestToolCall] = useState<{ sequence: number; call: CharacterToolCall } | null>(null);
  const [error, setError] = useState('');
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const sessionRef = useRef<RealtimeCharacterSession | null>(null);
  const microphoneRef = useRef<MicrophoneCapture | null>(null);
  const asrRef = useRef<BrowserAsrCapture | null>(null);
  const outputRef = useRef<PcmAudioOutput | null>(null);
  const perceptionRef = useRef<LocalPerception | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastPerceptionSentRef = useRef(0);
  const rafRef = useRef(0);

  const ingest = useCallback((...inputs: PerformanceInput[]) => performanceModel.ingest(...inputs), [performanceModel]);

  const onPerception = useCallback((event: PerceptionEvent) => {
    const now = performance.now();
    ingest(...perceptionToInputs(event, now));
    const shouldShare = event.type !== 'face' || Boolean(event.gesture) || now - lastPerceptionSentRef.current > 650;
    if (shouldShare) {
      lastPerceptionSentRef.current = now;
      sessionRef.current?.send({ type: 'perception', event });
    }
  }, [ingest]);

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
        if (value === 'thinking') {
          ingest({ type: 'presence', atMs: performance.now(), presence: 'thinking' });
          setStatus('thinking');
        }
        if (value === 'speaking') setStatus('speaking');
        if (value === 'turn-complete') {
          ingest(
            { type: 'presence', atMs: performance.now(), presence: 'listening' },
            { type: 'voice', atMs: performance.now(), features: { speaking: false, energy: 0, brightness: 0.5, emphasis: 0 } },
          );
          setStatus('listening');
        }
      } else if (event.type === 'audio' && event.data instanceof ArrayBuffer) {
        const analysis = analyzePcm16(event.data, 24000);
        const atMs = performance.now();
        ingest(analysisToInput(analysis, atMs), { type: 'presence', atMs, presence: 'speaking' });
        setStatus('speaking');
        void outputRef.current?.play(event.data, 24000);
      } else if (event.type === 'voice-features' && event.data) {
        const features = event.data as VoiceFeatures;
        const atMs = performance.now();
        ingest(
          { type: 'voice', atMs, features },
          { type: 'presence', atMs, presence: features.speaking ? 'speaking' : 'listening' },
        );
      } else if (event.type === 'transcript') {
        setTranscript((current) => [...current.slice(-19), String(event.data ?? '')]);
      } else if (event.type === 'input-transcript') {
        setInputTranscript(String(event.data ?? ''));
      } else if (event.type === 'tool-call' && event.data) {
        const call = event.data as CharacterToolCall;
        ingest(...inputsFromToolCall(call, performance.now()));
        setLatestToolCall((current) => ({ sequence: (current?.sequence ?? 0) + 1, call }));
      } else if (event.type === 'error') {
        setStatus('error');
        setError(String(event.data ?? '连接失败'));
      }
    });
    try {
      await session.connect();
      setStatus('listening');
      ingest({ type: 'presence', atMs: performance.now(), presence: 'listening' });
    } catch (connectionError) {
      session.close();
      sessionRef.current = null;
      setStatus('error');
      setError(connectionError instanceof Error ? connectionError.message : '无法连接实时语音');
    }
  }, [ingest, sessionFactory]);

  const startMicrophone = useCallback(async () => {
    const session = sessionRef.current;
    if (!session || microphoneRef.current || asrRef.current) return;
    if (session.inputMode === 'text') {
      const asr = new BrowserAsrCapture();
      asrRef.current = asr;
      try {
        asr.start((result) => {
          setInputTranscript(result.text);
          if (result.final) session.send({ type: 'text', text: result.text });
        }, (message) => setError(message));
        setMicEnabled(true);
      } catch (asrError) {
        asrRef.current = null;
        setError(asrError instanceof Error ? asrError.message : '语音识别不可用');
      }
      return;
    }
    const microphone = new MicrophoneCapture();
    microphoneRef.current = microphone;
    try {
      await microphone.start((chunk, analysis) => {
        session.send({ type: 'audio', chunk });
        if (analysis.speaking) ingest({ type: 'presence', atMs: performance.now(), presence: 'listening' });
      });
      setMicEnabled(true);
    } catch (microphoneError) {
      microphoneRef.current = null;
      setError(microphoneError instanceof Error ? microphoneError.message : '麦克风不可用');
    }
  }, [ingest]);

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

  const direct = useCallback((input: PerformanceInput) => ingest(input), [ingest]);

  const disconnect = useCallback(() => {
    microphoneRef.current?.stop();
    asrRef.current?.stop();
    outputRef.current?.stop();
    outputRef.current?.close();
    perceptionRef.current?.stop();
    sessionRef.current?.close();
    microphoneRef.current = null;
    asrRef.current = null;
    outputRef.current = null;
    perceptionRef.current = null;
    sessionRef.current = null;
    setMicEnabled(false);
    setCameraEnabled(false);
    setStatus('offline');
    const resetFrame = performanceModel.reset(performance.now());
    setFrame(resetFrame);
  }, [performanceModel]);

  const interrupt = useCallback(() => {
    sessionRef.current?.interrupt();
    outputRef.current?.stop();
    const atMs = performance.now();
    ingest(
      { type: 'presence', atMs, presence: 'listening' },
      { type: 'voice', atMs, features: { speaking: false, energy: 0, brightness: 0.5, emphasis: 0 } },
    );
    setStatus('listening');
  }, [ingest]);

  useEffect(() => {
    const tick = (timestamp: number) => {
      setFrame(performanceModel.advance(timestamp));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [performanceModel]);

  useEffect(() => () => disconnect(), [disconnect]);

  return {
    frame,
    status,
    transcript,
    inputTranscript,
    latestToolCall,
    error,
    cameraEnabled,
    micEnabled,
    videoRef,
    connect,
    startMicrophone,
    toggleCamera,
    direct,
    interrupt,
    disconnect,
  };
}
