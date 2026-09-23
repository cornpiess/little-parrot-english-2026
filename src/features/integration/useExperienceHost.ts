import { useEffect, useMemo, useRef, useState } from "react";
import {
  createExperienceHostController,
  type HostState,
  type ProtocolViolation,
  type ReadyPayload,
  type SemanticEventV1,
} from "./experienceHostProtocol";

const MAX_EVENTS = 200;
const MAX_VIOLATIONS = 50;

export type ExpectedIdCheck = "no-expectation" | "pending" | "match" | "mismatch";

// 预期包 ID 校验：宿主配置了 VITE_EXPERIENCE_ID 时，ready.experienceId 必须与之一致，
// 否则说明 iframe 里加载的不是配置想要的体验（比如指向了错误的内容源）。
export function checkExpectedExperienceId(expected: string | undefined, ready: ReadyPayload | null): ExpectedIdCheck {
  if (!expected) return "no-expectation";
  if (!ready) return "pending";
  return ready.experienceId === expected ? "match" : "mismatch";
}

export interface ExperienceHostStatus {
  state: HostState;
  ready: ReadyPayload | null;
  end: { reason: string; detail?: string } | null;
  events: SemanticEventV1[];
  violations: ProtocolViolation[];
}

// 开发期集成页专用：管理 iframe 与体验的握手、事件接收与控制按钮。
// 每次重载（reloadKey 变化）都重建控制器 → 重新握手 → 生成新的随机 nonce；
// initPayload 由调用方按 reloadKey 生成新引用（含新的 sessionId），与控制器生命周期同步。
export function useExperienceHost(experienceSrc: string, reloadKey: number, initPayload: { childId?: string; locale?: string; sessionId?: string }) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const controllerRef = useRef<ReturnType<typeof createExperienceHostController> | null>(null);
  const [status, setStatus] = useState<ExperienceHostStatus>({ state: "awaiting-ready", ready: null, end: null, events: [], violations: [] });

  useEffect(() => {
    setStatus({ state: "awaiting-ready", ready: null, end: null, events: [], violations: [] });
    const controller = createExperienceHostController({
      allowedOrigins: [new URL(experienceSrc).origin],
      initPayload,
      callbacks: {
        onReady: (ready) => setStatus((s) => ({ ...s, ready })),
        onStateChange: (state) => setStatus((s) => ({ ...s, state })),
        onSemanticEvent: (event) => setStatus((s) => ({ ...s, events: [...s.events, event].slice(-MAX_EVENTS) })),
        onEnd: (end) => setStatus((s) => ({ ...s, end })),
        onProtocolViolation: (violation) => setStatus((s) => ({ ...s, violations: [...s.violations, violation].slice(-MAX_VIOLATIONS) })),
      },
      post: (targetOrigin, envelope) => iframeRef.current?.contentWindow?.postMessage(envelope, targetOrigin),
      expectedSource: () => iframeRef.current?.contentWindow ?? null,
    });
    controllerRef.current = controller;
    const onMessage = (event: MessageEvent) => controller.handleMessage(event);
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
      controller.dispose();
      controllerRef.current = null;
    };
    // initPayload 由调用方以稳定引用传入（页面内为常量）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experienceSrc, reloadKey]);

  const controls = useMemo(
    () => ({
      pause: () => controllerRef.current?.pause(),
      resume: () => controllerRef.current?.resume(),
      exit: () => controllerRef.current?.exit(),
    }),
    [],
  );

  return { iframeRef, status, ...controls };
}
