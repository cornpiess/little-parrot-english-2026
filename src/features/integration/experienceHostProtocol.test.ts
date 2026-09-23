import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  EXPERIENCE_HOST_CHANNEL,
  createExperienceHostController,
  isValidSemanticEvent,
  makeEnvelope,
  validateIncomingEnvelope,
} from "./experienceHostProtocol";
import { checkExpectedExperienceId } from "./useExperienceHost";

const EXP_ORIGIN = "http://127.0.0.1:4173";
const OTHER_ORIGIN = "http://127.0.0.1:9999";

const validEvent = (overwrites: Record<string, unknown> = {}) => ({
  version: 1,
  id: "session-1:1",
  childId: "fictional-a",
  sessionId: "session-1",
  sceneId: "breakfast",
  sceneTitle: "早餐小屋",
  type: "choice",
  time: new Date().toISOString(),
  data: { instanceId: "bowl-a" },
  ...overwrites,
});

interface Harness {
  post: ReturnType<typeof vi.fn>;
  events: unknown[];
  violations: { code: string; message: string }[];
  controller: ReturnType<typeof createExperienceHostController>;
  simulate: (data: unknown, options?: { origin?: string; source?: unknown }) => void;
}

const fakeSource = {} as MessageEventSource;

function createHarness(initPayload: Record<string, unknown> = { childId: "fictional-a" }): Harness {
  const post = vi.fn();
  const events: unknown[] = [];
  const violations: { code: string; message: string }[] = [];
  const controller = createExperienceHostController({
    allowedOrigins: [EXP_ORIGIN],
    initPayload,
    callbacks: {
      onSemanticEvent: (event) => events.push(event),
      onProtocolViolation: (violation) => violations.push(violation),
    },
    post,
    expectedSource: () => fakeSource,
    generateNonce: () => "test-nonce",
    readyTimeoutMs: 60000,
  });
  const simulate = (data: unknown, options: { origin?: string; source?: unknown } = {}) =>
    controller.handleMessage({ data, origin: options.origin ?? EXP_ORIGIN, source: options.source ?? fakeSource } as MessageEvent);
  return { post, events, violations, controller, simulate };
}

function handshake(harness: Harness) {
  harness.simulate(makeEnvelope("exp->host", "ready", null, { experienceId: "breakfast", protocolVersion: 1, capabilities: { agentTurn: false } }));
}

describe("envelope validation", () => {
  it("accepts a well-formed ready without nonce", () => {
    const message = validateIncomingEnvelope(makeEnvelope("exp->host", "ready", null, { experienceId: "breakfast", protocolVersion: 1, capabilities: { agentTurn: false } }));
    expect(message.type).toBe("ready");
    expect(message.nonce).toBeNull();
  });

  it("rejects wrong channel, protocol, direction and unknown types", () => {
    const ready = { experienceId: "breakfast", protocolVersion: 1, capabilities: { agentTurn: false } };
    expect(() => validateIncomingEnvelope({ ...makeEnvelope("exp->host", "ready", null, ready), channel: "other" })).toThrow(/channel/);
    expect(() => validateIncomingEnvelope({ ...makeEnvelope("exp->host", "ready", null, ready), proto: 2 })).toThrow(/protocol version/);
    expect(() => validateIncomingEnvelope(makeEnvelope("host->exp", "exit", "n", {}))).toThrow(/direction/);
    expect(() => validateIncomingEnvelope(makeEnvelope("exp->host", "spoof" as never, "n", {}))).toThrow(/unknown/);
  });

  it("rejects ready carrying a nonce and non-ready messages without one", () => {
    const ready = { experienceId: "breakfast", protocolVersion: 1, capabilities: { agentTurn: false } };
    expect(() => validateIncomingEnvelope(makeEnvelope("exp->host", "ready", "n", ready))).toThrow(/must not carry/);
    expect(() => validateIncomingEnvelope(makeEnvelope("exp->host", "end", null, { reason: "completed" }))).toThrow(/nonce/);
  });

  it("validates semantic events against protocol v1", () => {
    expect(isValidSemanticEvent(validEvent())).toBe(true);
    expect(isValidSemanticEvent(validEvent({ sessionId: "" }))).toBe(false);
    expect(isValidSemanticEvent(validEvent({ time: "not-a-date" }))).toBe(false);
    expect(isValidSemanticEvent(validEvent({ data: "flat" }))).toBe(false);
    expect(() => validateIncomingEnvelope(makeEnvelope("exp->host", "semantic-event", "n", { event: validEvent({ id: "" }) }))).toThrow(/SemanticEvent/);
  });

  it("keeps field rules aligned with the content repo (ready.title, context, init.sessionId)", () => {
    const ready = { experienceId: "x", protocolVersion: 1, capabilities: { agentTurn: false } };
    expect(() => validateIncomingEnvelope(makeEnvelope("exp->host", "ready", null, { ...ready, title: "x".repeat(201) }))).toThrow(/title/);
    expect(() => validateIncomingEnvelope(makeEnvelope("exp->host", "ready", null, { ...ready, title: 42 }))).toThrow(/title/);
    expect(() => validateIncomingEnvelope(makeEnvelope("exp->host", "request-agent-turn", "n", { requestId: "r", node: "n", context: "plain-string-ok" }))).not.toThrow();
    expect(() => validateIncomingEnvelope(makeEnvelope("exp->host", "request-agent-turn", "n", { requestId: "r", node: "n", context: { blob: "x".repeat(5000) } }))).toThrow(/context/);
    expect(() => validateIncomingEnvelope(makeEnvelope("exp->host", "request-agent-turn", "n", { requestId: "r", node: "n", context: () => {} }))).toThrow(/context/);
    // init.sessionId 属下行消息，宿主发送前自查（controller.send 内部校验），这里直接验证 payload 规则
    const controller = createHarness({ sessionId: "s-1" });
    handshake(controller);
    expect(controller.post.mock.calls[0][1].payload).toEqual({ sessionId: "s-1" });
  });
});

describe("expected experience id check", () => {
  const readyOf = (experienceId: string) => ({ experienceId, protocolVersion: 1, capabilities: { agentTurn: false } });
  it("returns no-expectation / pending / match / mismatch", () => {
    expect(checkExpectedExperienceId(undefined, null)).toBe("no-expectation");
    expect(checkExpectedExperienceId(undefined, readyOf("any"))).toBe("no-expectation");
    expect(checkExpectedExperienceId("contract-fixture", null)).toBe("pending");
    expect(checkExpectedExperienceId("contract-fixture", readyOf("contract-fixture"))).toBe("match");
    expect(checkExpectedExperienceId("contract-fixture", readyOf("breakfast"))).toBe("mismatch");
  });
});

describe("experience host controller", () => {
  it("handshakes: ready → init with fresh nonce to the explicit experience origin", () => {
    const harness = createHarness({ childId: "fictional-b" });
    handshake(harness);
    expect(harness.controller.state()).toBe("ready");
    expect(harness.post).toHaveBeenCalledTimes(1);
    const [targetOrigin, envelope] = harness.post.mock.calls[0];
    expect(targetOrigin).toBe(EXP_ORIGIN); // 明确 origin，绝不 '*'
    expect(envelope.type).toBe("init");
    expect(envelope.nonce).toBe("test-nonce");
    expect(envelope.payload).toEqual({ childId: "fictional-b" });
    expect(harness.violations).toEqual([]);
  });

  it("ignores messages from other origins and other windows", () => {
    const harness = createHarness();
    const otherWindow = {} as MessageEventSource;
    harness.simulate(makeEnvelope("exp->host", "ready", null, { experienceId: "x", protocolVersion: 1, capabilities: {} }), { origin: OTHER_ORIGIN });
    harness.simulate(makeEnvelope("exp->host", "ready", null, { experienceId: "x", protocolVersion: 1, capabilities: {} }), { source: otherWindow });
    expect(harness.controller.state()).toBe("awaiting-ready");
    expect(harness.post).not.toHaveBeenCalled();
  });

  it("delivers semantic events unchanged and rejects nonce mismatch", () => {
    const harness = createHarness();
    handshake(harness);
    const event = validEvent();
    harness.simulate(makeEnvelope("exp->host", "semantic-event", "test-nonce", { event }));
    expect(harness.events).toEqual([event]);
    const before = harness.events.length;
    harness.simulate(makeEnvelope("exp->host", "semantic-event", "forged", { event }));
    expect(harness.events.length).toBe(before);
    expect(harness.violations.some((v) => v.code === "bad-nonce")).toBe(true);
  });

  it("rejects a second ready after handshake", () => {
    const harness = createHarness();
    handshake(harness);
    handshake(harness);
    expect(harness.violations.some((v) => v.code === "duplicate-ready")).toBe(true);
  });

  it("answers request-agent-turn with unavailable (phase 1)", () => {
    const harness = createHarness();
    handshake(harness);
    harness.post.mockClear();
    harness.simulate(makeEnvelope("exp->host", "request-agent-turn", "test-nonce", { requestId: "r1", node: "act2/storm" }));
    expect(harness.post).toHaveBeenCalledTimes(1);
    const [targetOrigin, envelope] = harness.post.mock.calls[0];
    expect(targetOrigin).toBe(EXP_ORIGIN);
    expect(envelope.type).toBe("agent-turn");
    expect(envelope.payload).toMatchObject({ requestId: "r1", status: "unavailable" });
  });

  it("ends on end message and ignores everything afterwards", () => {
    const harness = createHarness();
    handshake(harness);
    harness.simulate(makeEnvelope("exp->host", "end", "test-nonce", { reason: "exited" }));
    expect(harness.controller.state()).toBe("ended");
    harness.simulate(makeEnvelope("exp->host", "semantic-event", "test-nonce", { event: validEvent() }));
    expect(harness.events.length).toBe(0);
  });

  it("pause/resume/exit only work while ready and carry the session nonce", () => {
    const harness = createHarness();
    harness.controller.pause(); // 未握手：不发送
    expect(harness.post).not.toHaveBeenCalled();
    handshake(harness);
    harness.controller.pause();
    harness.controller.resume();
    harness.controller.exit();
    const types = harness.post.mock.calls.map(([, envelope]) => envelope.type);
    expect(types).toEqual(["init", "pause", "resume", "exit"]);
    for (const [, envelope] of harness.post.mock.calls) {
      expect(envelope.channel).toBe(EXPERIENCE_HOST_CHANNEL);
      if (envelope.type !== "init") expect(envelope.nonce).toBe("test-nonce");
    }
  });

  it("reports ready timeout", () => {
    vi.useFakeTimers();
    try {
      const post = vi.fn();
      const violations: { code: string }[] = [];
      const controller = createExperienceHostController({
        allowedOrigins: [EXP_ORIGIN],
        post,
        expectedSource: () => fakeSource,
        generateNonce: () => "n",
        readyTimeoutMs: 100,
        callbacks: { onProtocolViolation: (v) => violations.push(v) },
      });
      vi.advanceTimersByTime(150);
      expect(controller.state()).toBe("timeout");
      expect(violations[0]?.code).toBe("ready-timeout");
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("controller cleanup", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());
  it("dispose cancels the ready timeout", () => {
    const controller = createHarness().controller;
    controller.dispose();
    vi.advanceTimersByTime(120000);
    expect(controller.state()).toBe("ended");
  });
});
