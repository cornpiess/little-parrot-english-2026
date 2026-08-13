import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  FilesetResolver,
  HandLandmarker,
  FaceLandmarker,
  type HandLandmarkerResult,
  type FaceLandmarkerResult,
} from '@mediapipe/tasks-vision';

export type GestureType =
  | 'open_hand' // 五指张开 -> 继续 / 开始
  | 'ok' // 拇指食指圈 -> 确认
  | 'thumbs_up' // 点赞 -> 喜欢
  | 'wave' // 招手 -> 打招呼
  | 'smile' // 微笑
  | 'open_mouth' // 张嘴 -> 哇
  | 'nod' // 点头 -> 是 / 继续
  | null;

// 模型与 wasm 资源（官方 CDN，Google 开源方案）
const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm';
const HAND_MODEL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
const FACE_MODEL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

// 手部关键点索引
const TIP = [4, 8, 12, 16, 20];
const PIP = [3, 6, 10, 14, 18];

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// 判断某根手指是否伸直（指尖比 PIP 关节离手腕更远）
function fingerExtended(landmarks: { x: number; y: number }[], tip: number, pip: number, wrist: number) {
  return dist(landmarks[tip], landmarks[wrist]) > dist(landmarks[pip], landmarks[wrist]) * 1.05;
}

// 识别一个手的手势
function classifyHand(landmarks: { x: number; y: number }[]): Exclude<GestureType, null | 'smile' | 'open_mouth' | 'nod' | 'wave'> {
  const fingers = TIP.map((t, i) => fingerExtended(landmarks, t, PIP[i], 0));
  const extendedCount = fingers.filter(Boolean).length;

  // 点赞：仅拇指伸直且朝上，其余收拢
  const thumbUp = fingers[0] && !fingers[1] && !fingers[2] && !fingers[3] && !fingers[4];
  if (thumbUp && landmarks[4].y < landmarks[3].y - 0.02) return 'thumbs_up';

  // OK 手势：拇指与食指尖靠近成圈，其余三指伸直
  const okRing = dist(landmarks[4], landmarks[8]) < 0.08;
  if (okRing && fingers[2] && fingers[3] && fingers[4]) return 'ok';

  // 五指张开
  if (extendedCount >= 4) return 'open_hand';

  return 'open_hand'; // 退化为开放手掌，宽容处理
}

export interface UseGestureControlOptions {
  // enabled 仅控制「是否运行手势/表情推理」。摄像头预览始终开启（除非 cameraOff=true），
  // 这样关闭识别时仍然保留预览画面，可用于叠加道具。
  enabled: boolean;
  onGesture: (g: Exclude<GestureType, null>) => void;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  cameraOff?: boolean;
}

export function useGestureControl({ enabled, onGesture, videoRef: externalVideoRef, cameraOff = false }: UseGestureControlOptions) {
  const internalVideoRef = useRef<HTMLVideoElement | null>(null);
  const videoRef = externalVideoRef ?? internalVideoRef;
  const [ready, setReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [mirrored, setMirrored] = useState(true);

  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastEmitRef = useRef<number>(0);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  // 轨迹缓存（用于招手 / 点头检测）
  const handXRef = useRef<number[]>([]);
  const mouthOpenRef = useRef<number>(0);
  const smileRef = useRef<boolean>(false);
  const faceYRef = useRef<number[]>([]);

  const stopCamera = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setReady(false);
  };

  // 当活动摄像头 <video> 元素切换（例如预览从角落小窗搬进驾驶舱大窗）时，
  // 把现有 MediaStream 重新挂到新元素上，避免切换到空画面。
  const lastAttachedVideoRef = useRef<HTMLVideoElement | null>(null);
  useLayoutEffect(() => {
    const v = videoRef.current;
    if (v && streamRef.current && v !== lastAttachedVideoRef.current) {
      lastAttachedVideoRef.current = v;
      if (v.srcObject !== streamRef.current) v.srcObject = streamRef.current;
      v.play().catch(() => {});
    }
  });

  const emit = (g: Exclude<GestureType, null>) => {
    const now = performance.now();
    if (now - lastEmitRef.current < 700) return; // 去抖，避免连续误触
    lastEmitRef.current = now;
    onGesture(g);
  };

  // 摄像头预览：始终开启（除非 cameraOff），与推理解耦
  useEffect(() => {
    if (cameraOff) {
      stopCamera();
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 320, height: 240 },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        setReady(true);

        // 仅在 enabled 时启动推理 RAF 循环；关闭识别时不跑任何空转循环，
        // 让 <video> 由浏览器自行渲染预览，彻底零 CPU 占用，避免卡顿。
        if (!enabledRef.current) return;

        let frame = 0;
        const loop = async () => {
          if (cancelled) return;
          const v = videoRef.current;
          if (!v || v.readyState < 2) {
            rafRef.current = requestAnimationFrame(loop);
            return;
          }
          // 仅在 enabled 时运行推理
          if (enabledRef.current && frame % 2 === 0) {
            const ts = performance.now();

            // 手部识别
            const handResult: HandLandmarkerResult | undefined = handLandmarkerRef.current?.detectForVideo(v, ts);
            if (handResult?.landmarks && handResult.landmarks.length > 0) {
              const lm = handResult.landmarks[0];
              const g = classifyHand(lm);
              handXRef.current.push(lm[9].x);
              if (handXRef.current.length > 8) handXRef.current.shift();
              const xs = handXRef.current;
              const moved = xs.length >= 8 ? Math.abs(xs[xs.length - 1] - xs[0]) : 0;
              if (moved > 0.18 && g === 'open_hand') {
                emit('wave');
              } else {
                emit(g);
              }
            } else {
              handXRef.current = [];
            }

            // 面部识别
            const faceResult: FaceLandmarkerResult | undefined = faceLandmarkerRef.current?.detectForVideo(v, ts);
            const blends = faceResult?.faceBlendshapes?.[0]?.categories;
            if (blends) {
              const get = (name: string) => blends.find((b) => b.categoryName === name)?.score ?? 0;
              const smile = get('mouthSmileLeft') + get('mouthSmileRight');
              const jawOpen = get('jawOpen');
              smileRef.current = smile > 0.6;
              mouthOpenRef.current = jawOpen;
              if (smileRef.current) emit('smile');
              if (jawOpen > 0.5) emit('open_mouth');

              if (faceResult.landmarks?.[0]) {
                const cy = faceResult.landmarks[0][1].y;
                faceYRef.current.push(cy);
                if (faceYRef.current.length > 10) faceYRef.current.shift();
                const ys = faceYRef.current;
                if (ys.length >= 10) {
                  const min = Math.min(...ys);
                  const max = Math.max(...ys);
                  if (max - min > 0.06) emit('nod');
                }
              }
            }
          }
          frame++;
          rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
      } catch (err) {
        console.error('摄像头初始化失败', err);
        setCameraError(err instanceof Error ? err.message : '摄像头加载失败');
      }
    })();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [cameraOff, videoRef]);

  // 推理模型：仅在 enabled 时加载 MediaPipe（关闭识别时不加载，零卡顿）
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    (async () => {
      try {
        const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
        if (cancelled) return;
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: HAND_MODEL, delegate: 'GPU' },
          runningMode: 'VIDEO',
          numHands: 1,
        });
        faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: FACE_MODEL, delegate: 'GPU' },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: true,
        });
      } catch (err) {
        console.error('手势/表情识别模型加载失败', err);
      }
    })();
    return () => {
      cancelled = true;
      handLandmarkerRef.current = null;
      faceLandmarkerRef.current = null;
    };
  }, [enabled]);

  return { videoRef, ready, cameraError, mirrored };
}
