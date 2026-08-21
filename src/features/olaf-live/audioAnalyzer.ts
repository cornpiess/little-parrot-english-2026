import type { PerformanceSignal } from './types';

export interface AudioAnalysis {
  speaking: boolean;
  energy: number;
  spectralCentroid: number;
  emphasis: number;
}

export function analyzePcm16(buffer: ArrayBuffer, sampleRate: number): AudioAnalysis {
  const samples = new Int16Array(buffer);
  if (samples.length === 0) return { speaking: false, energy: 0, spectralCentroid: 0, emphasis: 0 };
  let sumSquares = 0;
  let zeroCrossings = 0;
  let previous = samples[0];
  let peak = 0;
  for (const raw of samples) {
    const sample = raw / 32768;
    sumSquares += sample * sample;
    peak = Math.max(peak, Math.abs(sample));
    if ((raw >= 0 && previous < 0) || (raw < 0 && previous >= 0)) zeroCrossings += 1;
    previous = raw;
  }
  const rms = Math.sqrt(sumSquares / samples.length);
  const energy = Math.min(1, rms * 2.6);
  const spectralCentroid = Math.min(1, (zeroCrossings / samples.length) * (sampleRate / 4200));
  return {
    speaking: energy > 0.055,
    energy,
    spectralCentroid,
    emphasis: Math.min(1, Math.max(0, peak - rms) * 1.8),
  };
}

export function analysisToSignal(analysis: AudioAnalysis): PerformanceSignal {
  return { type: 'speech', ...analysis };
}

type CaptureListener = (chunk: ArrayBuffer, analysis: AudioAnalysis) => void;

export class MicrophoneCapture {
  private context: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private listener: CaptureListener | null = null;

  async start(listener: CaptureListener) {
    if (this.stream) return;
    this.listener = listener;
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 } });
    this.context = new AudioContext();
    this.source = this.context.createMediaStreamSource(this.stream);
    this.processor = this.context.createScriptProcessor(2048, 1, 1);
    this.processor.onaudioprocess = (event) => {
      const input = event.inputBuffer.getChannelData(0);
      const targetRate = 16000;
      const ratio = this.context!.sampleRate / targetRate;
      const outputLength = Math.max(1, Math.floor(input.length / ratio));
      const pcm = new Int16Array(outputLength);
      for (let index = 0; index < outputLength; index += 1) {
        const sample = input[Math.min(input.length - 1, Math.floor(index * ratio))];
        pcm[index] = Math.max(-32768, Math.min(32767, Math.round(sample * 32767)));
      }
      const analysis = analyzePcm16(pcm.buffer, targetRate);
      this.listener?.(pcm.buffer, analysis);
    };
    const silentGain = this.context.createGain();
    silentGain.gain.value = 0;
    this.source.connect(this.processor);
    this.processor.connect(silentGain);
    silentGain.connect(this.context.destination);
    await this.context.resume();
  }

  stop() {
    this.processor?.disconnect();
    this.source?.disconnect();
    this.stream?.getTracks().forEach((track) => track.stop());
    void this.context?.close();
    this.processor = null;
    this.source = null;
    this.stream = null;
    this.context = null;
    this.listener = null;
  }
}

export class PcmAudioOutput {
  private context: AudioContext | null = null;
  private nextStartTime = 0;

  async play(buffer: ArrayBuffer, sampleRate = 24000) {
    this.context ??= new AudioContext();
    await this.context.resume();
    const samples = new Int16Array(buffer);
    const audio = this.context.createBuffer(1, samples.length, sampleRate);
    const channel = audio.getChannelData(0);
    for (let index = 0; index < samples.length; index += 1) channel[index] = samples[index] / 32768;
    const source = this.context.createBufferSource();
    source.buffer = audio;
    source.connect(this.context.destination);
    const now = this.context.currentTime;
    this.nextStartTime = Math.max(this.nextStartTime, now + 0.02);
    source.start(this.nextStartTime);
    this.nextStartTime += audio.duration;
  }

  stop() {
    this.nextStartTime = 0;
    void this.context?.suspend();
  }

  close() {
    void this.context?.close();
    this.context = null;
    this.nextStartTime = 0;
  }
}
