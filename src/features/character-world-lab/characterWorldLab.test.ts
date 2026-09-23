import { describe, expect, it } from "vitest";
import { runWorldRigExperiment, behaviorOutline, SCRIPT_TOTAL_MS } from "./worldRig";

const result = runWorldRigExperiment();

describe("角色与动态世界实验台（基线 1）", () => {
  it("角色/物体/场景身份：各自唯一且全程稳定", () => {
    const ids = Object.keys(result.finalWorld.characters);
    expect(ids).toEqual(["char-a", "char-b"]);
    expect(new Set(ids).size).toBe(2);
    expect(Object.keys(result.finalWorld.objects).sort()).toEqual(["object-1", "object-2"]);
    const scenes = result.positionTrack.map(p => p.scene);
    expect(scenes[0]).toBe("scene-1-morning-mat");
    expect(scenes[scenes.length - 1]).toBe("scene-2-sky-deck");
    expect(new Set(result.keyframes.map(k => k.world.scene)).size).toBe(2);
    // 时间线中任何条目都不会引入第三个角色或物体
    for (const entry of result.entries) {
      if (entry.actor === "char-a" || entry.actor === "char-b") continue;
      expect(["child", "world"]).toContain(entry.actor);
    }
  });

  it("动作顺序：倾听→说话→看向→移动→接触→打断→场景变化→放置→回待机", () => {
    const outline = behaviorOutline(result);
    const order = [
      "A: presence=speaking",
      "B: presence=listening",
      "A: attention→object-1",
      "A: locomotion(朝 object-1)",
      "A: direction=discover(伸手)",
      "object-1: surface(table)→hand(char-a)",
      "interrupt(child→object-2)",
      "A: attention→object-2(孩子所指)",
      "B: presence=speaking(回应孩子)",
      "scene=scene-2-sky-deck",
      "A: locomotion(朝 shelf)",
      "object-1: hand→surface(shelf)",
      "A: presence=idle(回到待机)",
      "B: presence=idle(回到待机)",
    ];
    let cursor = 0;
    for (const expected of order) {
      const found = outline.findIndex((label, index) => index >= cursor && label.includes(expected));
      expect(found, `应在位置 ${cursor} 之后找到「${expected}」，实际序列：${JSON.stringify(outline)}`).toBeGreaterThan(-1);
      cursor = found + 1;
    }
  });

  it("打断后的状态：物体仍在手中、无移动目标、放置意图被推迟且随后恢复", () => {
    const interrupt = result.entries.find(e => e.kind === "interrupt");
    expect(interrupt).toBeDefined();
    const after = result.entries.filter(e => e.tMs >= interrupt!.tMs && e.tMs <= interrupt!.tMs + 100);
    const postState = result.entries.find(e => e.label.includes("打断后状态"));
    expect(postState).toBeDefined();
    expect((postState!.data as { object1: { kind: string } }).object1.kind).toBe("hand");
    expect((postState!.data as { locomotionTarget: unknown }).locomotionTarget).toBeNull();
    expect((postState!.data as { pendingPlace: boolean }).pendingPlace).toBe(true);
    // 打断后 A 的视线转向孩子所指的 object-2
    const gaze = result.keyframes.find(k => k.name === "k6-interrupt")!;
    expect(gaze.frames["char-a"].attention.focus).toBe("object");
    // B 在打断期间开口回应（presence=speaking）
    expect(gaze.frames["char-b"].presence).toBe("speaking");
    // 放置在场景 2 恢复：hand→surface(shelf) 出现在 scene 变化之后
    const sceneChange = result.entries.find(e => e.label.includes("scene=scene-2-sky-deck"))!;
    const place = result.entries.find(e => e.label.includes("hand→surface(shelf)"))!;
    expect(place.tMs).toBeGreaterThan(sceneChange.tMs);
    // 最终：不悬挂任何待办
    expect(result.finalWorld.characters["char-a"].pendingPlace).toBe(false);
    expect(result.finalWorld.objects["object-1"].relation).toEqual({ kind: "surface", anchor: "shelf" });
    expect(result.finalWorld.characters["char-a"].locomotionTarget).toBeNull();
  });

  it("重放一致性：两次完整运行逐字节一致", () => {
    const again = runWorldRigExperiment();
    expect(JSON.stringify(again)).toBe(JSON.stringify(result));
    expect(again.summary).toEqual(result.summary);
    expect(again.keyframes.length).toBe(result.keyframes.length);
    expect(again.positionTrack).toEqual(result.positionTrack);
  });

  it("无故事约束：语音内容只有占位标记，不出现台词", () => {
    const json = JSON.stringify(result);
    expect(json).toContain("占位 tone:invite");
    expect(json).toContain("占位，非台词");
    // 检查所有 intent 里的 voice features 不携带文本字段；文本性数据仅允许占位标记
    const voiceInputs = result.entries.filter(e => e.kind === "intent" && (e.data as { type?: string })?.type === "voice");
    expect(voiceInputs.length).toBeGreaterThanOrEqual(2);
    for (const entry of voiceInputs) {
      const features = (entry.data as unknown as { features: Record<string, unknown> }).features;
      expect(Object.keys(features).every(key => key !== "text")).toBe(true);
    }
  });

  it("场景变化恰好一次且锚点布局不同；移动真的发生（位置轨有位移）", () => {
    expect(result.summary.sceneChanges).toBe(1);
    const s1 = result.keyframes.find(k => k.name === "k1-idle")!;
    const s2 = result.keyframes.find(k => k.name === "k7-scene2")!;
    expect(s1.world.scene).not.toBe(s2.world.scene);
    // A 从起点移动到过 object-1（位移 > 100px）
    const positions = result.positionTrack.map(p => p.charA);
    const minX = Math.min(...positions.map(p => p.x));
    const maxX = Math.max(...positions.map(p => p.x));
    expect(maxX - minX).toBeGreaterThan(100);
    expect(result.summary.durationMs).toBe(SCRIPT_TOTAL_MS);
    expect(result.summary.ticks).toBe(SCRIPT_TOTAL_MS / 100 + 1);
  });
});
