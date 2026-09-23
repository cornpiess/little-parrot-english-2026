import type { PerceptionEvent } from './types';

export interface FaceTarget {
  x: number;
  y: number;
  confidence: number;
  timestamp: number;
}

interface FaceResult {
  faceLandmarks?: Array<Array<{ x: number; y: number }>>;
  faceBlendshapes?: Array<{ categories?: Array<{ categoryName?: string; score?: number }> }>;
}

interface HandResult { landmarks?: Array<Array<{ x: number; y: number }>> }
interface FaceLandmarkerLike { detectForVideo(video: HTMLVideoElement, timestamp: number): FaceResult; close?: () => void }
interface HandLandmarkerLike { detectForVideo(video: HTMLVideoElement, timestamp: number): HandResult; close?: () => void }

const clamp = (value: number) => Math.min(1, Math.max(-1, value));

export function faceToPerceptionEvent(target: FaceTarget): PerceptionEvent {
  return { type: 'face', x: clamp((target.x - 0.5) * 2), y: clamp((0.5 - target.y) * 2), confidence: target.confidence, timestamp: target.timestamp };
}

export function eyeMidpointFromLandmarks(landmarks: Array<{ x: number; y: number }> | undefined) {
  const leftEye = landmarks?.[33];
  const rightEye = landmarks?.[263];
  if (leftEye && rightEye) return { x: (leftEye.x + rightEye.x) / 2, y: (leftEye.y + rightEye.y) / 2 };
  return landmarks?.[1] ?? null;
}

export interface LocalPerceptionOptions {
  modelAssetPath?: string;
  handModelAssetPath?: string;
  onEvent: (event: PerceptionEvent) => void;
}

export class LocalPerception {
  private stream: MediaStream | null = null;
  private landmarker: FaceLandmarkerLike | null = null;
  private handLandmarker: HandLandmarkerLike | null = null;
  private animationFrame = 0;
  private video: HTMLVideoElement | null = null;
  private options: LocalPerceptionOptions | null = null;
  private lastFaceAt = 0;
  private lastHandX: number | null = null;
  private lastHandAt = 0;

  async start(video: HTMLVideoElement, options: LocalPerceptionOptions) {
    this.video = video;
    this.options = options;
    this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
    video.srcObject = this.stream;
    await video.play();
    try {
      const vision = await import('@mediapipe/tasks-vision');
      this.landmarker = await vision.FaceLandmarker.createFromOptions(
        await vision.FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm'),
        {
          baseOptions: { modelAssetPath: options.modelAssetPath ?? 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task' },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: true,
        },
      );
      this.handLandmarker = await vision.HandLandmarker.createFromOptions(
        await vision.FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm'),
        {
          baseOptions: { modelAssetPath: options.handModelAssetPath ?? 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task' },
          runningMode: 'VIDEO',
          numHands: 1,
        },
      );
    } catch {
      this.landmarker = this.landmarker ?? null;
      this.handLandmarker = null;
    }
    this.tick();
  }

  stop() {
    cancelAnimationFrame(this.animationFrame);
    this.stream?.getTracks().forEach((track) => track.stop());
    if (this.video) this.video.srcObject = null;
    this.landmarker?.close?.();
    this.handLandmarker?.close?.();
    this.stream = null;
    this.landmarker = null;
    this.handLandmarker = null;
    this.video = null;
    this.options = null;
  }

  private tick = () => {
    if (!this.video || !this.options) return;
    const now = performance.now();
    if (this.landmarker && now - this.lastFaceAt > 66 && this.video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      this.lastFaceAt = now;
      const result = this.landmarker.detectForVideo(this.video, now);
      const eyeTarget = eyeMidpointFromLandmarks(result.faceLandmarks?.[0]);
      if (eyeTarget) {
        this.options.onEvent(faceToPerceptionEvent({ x: eyeTarget.x, y: eyeTarget.y, confidence: 0.9, timestamp: Date.now() }));
        const smile = result.faceBlendshapes?.[0]?.categories?.find((category) => category.categoryName === 'mouthSmileLeft');
        if (smile?.score > 0.72) this.options.onEvent({ type: 'face', gesture: 'smile', confidence: smile.score, timestamp: Date.now() });
      }
    }
    if (this.handLandmarker && now - this.lastHandAt > 120 && this.video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      this.lastHandAt = now;
      const result = this.handLandmarker.detectForVideo(this.video, now);
      const wrist = result.landmarks?.[0]?.[0];
      if (wrist) {
        const previousX = this.lastHandX;
        this.lastHandX = wrist.x;
        if (previousX !== null && Math.abs(wrist.x - previousX) > 0.055) {
          this.options.onEvent({ type: 'hand', gesture: 'wave', confidence: 0.82, timestamp: Date.now() });
        }
      } else {
        this.lastHandX = null;
      }
    }
    this.animationFrame = requestAnimationFrame(this.tick);
  };
}
