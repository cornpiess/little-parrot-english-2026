// Experience Host Protocol v1 —— 宿主侧协议实现（React 前端的"协议孪生"）。
// 与 ai-infinite-content/content-system/experience-package/{spec.md, sdk/protocol.js} 的线上格式逐字段一致；
// 两侧独立实现、互不导入，靠规范与两侧测试钉住兼容性。改动线上格式必须两侧同步并升版本。
// 安全约定：只接受 event.source === iframe.contentWindow 且 event.origin ∈ allowedOrigins 的消息；
// ready 唯一；握手后宿主生成随机 nonce 随 init 下发；此后双向消息必须匹配 nonce，下行消息使用明确的体验 origin。

export const EXPERIENCE_HOST_CHANNEL = "aicc-xpkg";
export const EXPERIENCE_HOST_PROTOCOL_VERSION = 1;

const EXP_TO_HOST_TYPES = ["ready", "semantic-event", "request-agent-turn", "end"] as const;
const HOST_TO_EXP_TYPES = ["init", "pause", "resume", "exit", "agent-turn", "error"] as const;
export const MAX_MESSAGE_BYTES = 65536;

export type ExpToHostType = (typeof EXP_TO_HOST_TYPES)[number];
export type HostToExpType = (typeof HOST_TO_EXP_TYPES)[number];

export interface Envelope<T extends ExpToHostType | HostToExpType> {
  channel: typeof EXPERIENCE_HOST_CHANNEL;
  proto: number;
  dir: "exp->host" | "host->exp";
  type: T;
  nonce: string | null;
  payload: Record<string, unknown>;
}

export interface SemanticEventV1 {
  version: 1;
  id: string;
  childId: string;
  sessionId: string;
  sceneId: string;
  sceneTitle?: string;
  type: string;
  time: string;
  data: Record<string, unknown>;
}

export interface ReadyPayload {
  experienceId: string;
  protocolVersion: number;
  title?: string;
  capabilities: { agentTurn: boolean };
}

export interface AgentTurnResult {
  status: "unavailable" | "completed";
  reason?: string;
  lines?: string[];
}

export type HostState = "awaiting-ready" | "ready" | "ended" | "timeout";

export interface ProtocolViolation {
  code: string;
  message: string;
}

export class ProtocolError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = "ProtocolError";
  }
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const nonEmptyString = (v: unknown, max: number): v is string =>
  typeof v === "string" && v.length > 0 && v.length <= max;
// 与内容仓库 sdk/protocol.js 一致：context 允许任意 JSON 值，序列化后 ≤ limit 字节
const jsonWithin = (v: unknown, limit: number): boolean => {
  try {
    return JSON.stringify(v).length <= limit;
  } catch {
    return false;
  }
};

// 镜像 ai-infinite-content/protocol/index.js 的 validateSemanticEvent（v1）
export function isValidSemanticEvent(e: unknown): e is SemanticEventV1 {
  if (!isPlainObject(e)) return false;
  if (e.version !== 1) return false;
  for (const key of ["id", "childId", "sessionId", "sceneId", "type", "time"] as const) {
    if (!nonEmptyString(e[key], Infinity)) return false;
  }
  if (Number.isNaN(Date.parse(e.time as string))) return false;
  return isPlainObject(e.data);
}

export function makeEnvelope(dir: "host->exp", type: HostToExpType, nonce: string | null, payload: Record<string, unknown>): Envelope<HostToExpType>;
export function makeEnvelope(dir: "exp->host", type: ExpToHostType, nonce: string | null, payload: Record<string, unknown>): Envelope<ExpToHostType>;
export function makeEnvelope(dir: "exp->host" | "host->exp", type: ExpToHostType | HostToExpType, nonce: string | null, payload: Record<string, unknown>): Envelope<ExpToHostType | HostToExpType> {
  return { channel: EXPERIENCE_HOST_CHANNEL, proto: EXPERIENCE_HOST_PROTOCOL_VERSION, dir, type, nonce, payload };
}

function validatePayload(dir: "exp->host", type: ExpToHostType, payload: Record<string, unknown>): void;
function validatePayload(dir: "host->exp", type: HostToExpType, payload: Record<string, unknown>): void;
function validatePayload(dir: "exp->host" | "host->exp", type: ExpToHostType | HostToExpType, payload: Record<string, unknown>): void {
  const require2 = (ok: boolean, code: string, message: string) => {
    if (!ok) throw new ProtocolError(code, message);
  };
  if (dir === "exp->host") {
    switch (type) {
      case "ready":
        require2(/^[a-z][a-z0-9-]{0,63}$/.test(String(payload.experienceId ?? "")), "bad-ready", "ready.experienceId invalid");
        require2(payload.protocolVersion === EXPERIENCE_HOST_PROTOCOL_VERSION, "bad-ready", "ready.protocolVersion mismatch");
        require2(isPlainObject(payload.capabilities) && typeof (payload.capabilities as { agentTurn?: unknown }).agentTurn === "boolean", "bad-ready", "ready.capabilities.agentTurn must be boolean");
        require2(payload.title === undefined || nonEmptyString(payload.title, 200), "bad-ready", "ready.title must be a string <=200 chars");
        break;
      case "semantic-event":
        require2(isValidSemanticEvent(payload.event), "bad-semantic-event", "event must be a valid SemanticEvent v1");
        break;
      case "request-agent-turn":
        require2(nonEmptyString(payload.requestId, 64), "bad-agent-request", "requestId required");
        require2(nonEmptyString(payload.node, 200), "bad-agent-request", "node required");
        require2(payload.context === undefined || jsonWithin(payload.context, 4096), "bad-agent-request", "context must be JSON-serializable and <=4096 bytes");
        break;
      case "end":
        require2(["completed", "exited", "error"].includes(String(payload.reason)), "bad-end", "end.reason invalid");
        break;
    }
  } else {
    switch (type) {
      case "init":
        require2(payload.childId === undefined || nonEmptyString(payload.childId, 64), "bad-init", "init.childId invalid");
        require2(payload.locale === undefined || nonEmptyString(payload.locale, 16), "bad-init", "init.locale invalid");
        require2(payload.sessionId === undefined || nonEmptyString(payload.sessionId, 64), "bad-init", "init.sessionId invalid");
        break;
      case "agent-turn":
        require2(nonEmptyString(payload.requestId, 64), "bad-agent-turn", "agent-turn.requestId required");
        require2(payload.status === "unavailable" || payload.status === "completed", "bad-agent-turn", "agent-turn.status invalid");
        require2(payload.status === "unavailable" || Array.isArray(payload.lines), "bad-agent-turn", "completed agent-turn requires lines");
        break;
      case "error":
        require2(nonEmptyString(payload.message, 300), "bad-error", "error.message required");
        break;
      default:
        break; // pause / resume / exit：无字段
    }
  }
}

// 校验收到的信封（宿主收 exp->host）。返回归一化结果；不合法抛 ProtocolError，调用方必须丢弃。
export function validateIncomingEnvelope(raw: unknown): { type: ExpToHostType; nonce: string | null; payload: Record<string, unknown> } {
  if (!isPlainObject(raw)) throw new ProtocolError("not-envelope", "message must be an object");
  if (raw.channel !== EXPERIENCE_HOST_CHANNEL) throw new ProtocolError("wrong-channel", "unknown channel");
  if (raw.proto !== EXPERIENCE_HOST_PROTOCOL_VERSION) throw new ProtocolError("wrong-proto", `protocol version must be ${EXPERIENCE_HOST_PROTOCOL_VERSION}`);
  if (raw.dir !== "exp->host") throw new ProtocolError("wrong-dir", "direction must be exp->host");
  const type = raw.type as ExpToHostType;
  if (!EXP_TO_HOST_TYPES.includes(type)) throw new ProtocolError("unknown-type", "unknown message type");
  const nonceRequired = type !== "ready";
  if (nonceRequired && !nonEmptyString(raw.nonce, 128)) throw new ProtocolError("missing-nonce", "nonce required");
  if (!nonceRequired && raw.nonce != null) throw new ProtocolError("unexpected-nonce", "ready must not carry a nonce");
  if (!isPlainObject(raw.payload)) throw new ProtocolError("bad-payload", "payload must be an object");
  let size = -1;
  try {
    size = JSON.stringify(raw).length;
  } catch {
    throw new ProtocolError("bad-payload", "payload is not serializable");
  }
  if (size > MAX_MESSAGE_BYTES) throw new ProtocolError("too-large", `message exceeds ${MAX_MESSAGE_BYTES} bytes`);
  validatePayload("exp->host", type, raw.payload);
  return { type, nonce: (raw.nonce as string | null) ?? null, payload: raw.payload };
}

export interface HostControllerCallbacks {
  onReady?: (payload: ReadyPayload) => void;
  onSemanticEvent?: (event: SemanticEventV1) => void;
  onEnd?: (payload: { reason: string; detail?: string }) => void;
  onAgentTurn?: (request: { requestId: string; node: string; context?: unknown }, respond: (result: AgentTurnResult) => void) => void;
  onProtocolViolation?: (violation: ProtocolViolation) => void;
  onStateChange?: (state: HostState) => void;
}

export interface ExperienceHostControllerOptions {
  allowedOrigins: string[];
  initPayload?: { childId?: string; locale?: string; sessionId?: string };
  callbacks?: HostControllerCallbacks;
  /** 发送下行消息的边界（hook 注入 iframe.contentWindow.postMessage）；参数一是明确的目标 origin，绝不传 "*" */
  post: (targetOrigin: string, envelope: Envelope<HostToExpType>) => void;
  /** 期望的消息来源窗口（iframe.contentWindow） */
  expectedSource: () => MessageEventSource | null;
  generateNonce?: () => string;
  readyTimeoutMs?: number;
}

const UNAVAILABLE: AgentTurnResult = { status: "unavailable", reason: "agent turns are not enabled in this host build (phase 1)" };

export function createExperienceHostController(options: ExperienceHostControllerOptions): {
  handleMessage: (event: MessageEvent) => void;
  pause: (reason?: string) => void;
  resume: (reason?: string) => void;
  exit: () => void;
  respondAgentTurn: (requestId: string, result?: AgentTurnResult) => void;
  state: () => HostState;
  nonce: () => string | null;
  dispose: () => void;
} {
  const { allowedOrigins, initPayload = {}, callbacks = {}, post, expectedSource } = options;
  const origins = new Set(allowedOrigins);
  const generateNonce = options.generateNonce ?? (() => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`));
  let state: HostState = "awaiting-ready";
  let experienceOrigin: string | null = null;
  let nonce: string | null = null;
  let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

  const setState = (next: HostState) => {
    state = next;
    callbacks.onStateChange?.(next);
  };
  const send = (type: HostToExpType, payload: Record<string, unknown>) => {
    if (state !== "ready" || !experienceOrigin) return;
    // 发送前自查结构（含本阶段 agent-turn 只允许 unavailable/completed 的约束）
    validatePayload("host->exp", type, payload);
    post(experienceOrigin, makeEnvelope("host->exp", type, nonce, payload));
  };
  const respondAgentTurn = (requestId: string, result: AgentTurnResult = UNAVAILABLE) => send("agent-turn", { requestId, ...result });

  const handleMessage = (event: MessageEvent) => {
    if (state === "ended" || state === "timeout") return;
    if (event.source !== expectedSource()) return;
    if (!origins.has(event.origin)) return;
    let message: ReturnType<typeof validateIncomingEnvelope>;
    try {
      message = validateIncomingEnvelope(event.data);
    } catch (error) {
      if (error instanceof ProtocolError) {
        callbacks.onProtocolViolation?.({ code: error.code, message: error.message });
        return;
      }
      throw error;
    }
    if (state === "awaiting-ready") {
      if (message.type !== "ready") {
        callbacks.onProtocolViolation?.({ code: "not-ready", message: `dropped ${message.type} before handshake` });
        return;
      }
      if (timeoutHandle) clearTimeout(timeoutHandle);
      experienceOrigin = event.origin;
      nonce = generateNonce();
      setState("ready");
      post(experienceOrigin, makeEnvelope("host->exp", "init", nonce, initPayload)); // nonce 随 init 下发
      callbacks.onReady?.(message.payload as unknown as ReadyPayload);
      return;
    }
    if (message.type === "ready") {
      callbacks.onProtocolViolation?.({ code: "duplicate-ready", message: "second ready after handshake" });
      return;
    }
    if (message.nonce !== nonce) {
      callbacks.onProtocolViolation?.({ code: "bad-nonce", message: "nonce mismatch after handshake" });
      return;
    }
    if (message.type === "semantic-event") {
      callbacks.onSemanticEvent?.(message.payload.event as SemanticEventV1);
      return;
    }
    if (message.type === "request-agent-turn") {
      const { requestId, node, context } = message.payload as { requestId: string; node: string; context?: unknown };
      if (callbacks.onAgentTurn) callbacks.onAgentTurn({ requestId, node, context }, respondAgentTurn);
      else respondAgentTurn(requestId); // 本阶段默认：一律 unavailable
      return;
    }
    if (message.type === "end") {
      setState("ended");
      detach();
      callbacks.onEnd?.(message.payload as { reason: string; detail?: string });
    }
  };

  const detach = () => {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
      timeoutHandle = null;
    }
  };
  timeoutHandle = setTimeout(() => {
    if (state === "awaiting-ready") {
      setState("timeout");
      detach();
      callbacks.onProtocolViolation?.({ code: "ready-timeout", message: "experience did not handshake in time" });
    }
  }, options.readyTimeoutMs ?? 15000);

  return {
    handleMessage,
    pause: (reason = "host") => send("pause", { reason }),
    resume: (reason = "host") => send("resume", { reason }),
    exit: () => send("exit", {}),
    respondAgentTurn,
    state: () => state,
    nonce: () => nonce,
    dispose: () => {
      setState("ended");
      detach();
    },
  };
}
