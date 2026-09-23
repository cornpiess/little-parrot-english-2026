import { useEffect, useMemo, useRef, useState } from "react";
import PlaceholderStage from "./PlaceholderStage";
import { runWorldRigExperiment, compactTrace, TICK_MS, type WorldRigResult } from "./worldRig";

// /_integration/character-world —— 角色与动态世界实验台（仅开发环境）。
// 固定无故事脚本：双占位角色、双物体、一次场景变化、一次孩子打断；
// 倾听/说话/看向/移动/接触/回待机全序列可回放，轨迹可导出。
// 页面只做展示与回放，不产生新的实验数据：一切数据来自 runWorldRigExperiment()（纯函数）。
const KIND_STYLE: Record<string, string> = {
  input: "bg-sky-100 text-sky-800",
  intent: "bg-amber-100 text-amber-800",
  state: "bg-slate-200 text-slate-700",
  output: "bg-emerald-100 text-emerald-800",
  interrupt: "bg-red-100 text-red-700",
};

export default function CharacterWorldLab() {
  if (!import.meta.env.DEV) return null; // 生产构建即使被意外引入也不渲染
  const result = useMemo(() => runWorldRigExperiment(), []);
  const [tickIndex, setTickIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [selectedKeyframe, setSelectedKeyframe] = useState<string | null>(null);
  const rafRef = useRef<number | null>(null);

  // 捕获脚本用：暴露只读轨迹（开发页面专用，不影响实验本身）
  useEffect(() => {
    (window as { __cwLab?: unknown }).__cwLab = { trace: compactTrace(result) };
    return () => { delete (window as { __cwLab?: unknown }).__cwLab; };
  }, [result]);

  const totalTicks = result.positionTrack.length - 1;
  const current = result.positionTrack[Math.min(tickIndex, totalTicks)];

  // 回放：按真实速度步进预计算好的轨迹（不重新运行实验，保证所见即记录）
  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    let accumulator = 0;
    const step = (now: number) => {
      accumulator += now - last;
      last = now;
      const advance = Math.floor(accumulator / TICK_MS);
      if (advance > 0) {
        accumulator -= advance * TICK_MS;
        setTickIndex(index => {
          if (index >= totalTicks) {
            setPlaying(false);
            return index;
          }
          return index + advance;
        });
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, totalTicks]);

  // 回放到当前 tick 时展示的世界与帧：帧取最近的采样（每 tick 都有，这里从关键帧 + 位置轨重建近似帧）
  const view = useMemo(() => {
    const nearestKeyframe = result.keyframes.reduce((best, k) => (k.tMs <= current.tMs ? k : best), result.keyframes[0]);
    const world = { ...nearestKeyframe.world, characters: { ...nearestKeyframe.world.characters } };
    // 用位置轨的真实位置覆盖关键帧位置，物体关系取该时刻最近的真实状态变化
    world.characters = {
      "char-a": { ...world.characters["char-a"], position: current.charA },
      "char-b": { ...world.characters["char-b"], position: current.charB },
    };
    const relationAt = (tMs: number) => {
      const take = result.entries.find(e => e.label.includes("surface(table)→hand"));
      const place = result.entries.find(e => e.label.includes("hand→surface(shelf)"));
      if (place && tMs >= place.tMs) return { kind: "surface" as const, anchor: "shelf" as const };
      if (take && tMs >= take.tMs) return { kind: "hand" as const, holder: "char-a" as const };
      return { kind: "surface" as const, anchor: "table" as const };
    };
    world.objects = { ...world.objects, "object-1": { ...world.objects["object-1"], relation: relationAt(current.tMs) } };
    return { world, frames: nearestKeyframe.frames };
  }, [current, result]);

  const exportTrace = () => {
    const blob = new Blob([JSON.stringify(compactTrace(result), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "character-world-lab-trace.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <header className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold">角色与动态世界实验台（基线 1：复用 Olaf 表演栈）</h1>
        <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">仅开发环境 · 无故事 · 几何占位</span>
        <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
          t = {current.tMs} ms / {result.summary.durationMs} ms · tick {tickIndex}/{totalTicks}
        </span>
      </header>

      <p className="mb-4 max-w-4xl text-sm text-slate-600">
        固定脚本：A 说话（占位音）/ B 倾听 → A 看、走向、拿起占位球 → 孩子点击占位块打断 → 场景切换 → A 放回架子、双角色回待机。
        角色帧来自 <code>olaf-live/performanceModel</code>（复用），孩子输入映射来自 <code>actionDirector.perceptionToInputs</code>（复用）；
        持久位置与物体关系属于实验台世界层。人工评价项（自然度/协调性/视觉表现/角色可信度）不作自动评分。
      </p>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button onClick={() => setPlaying(p => !p)} className="rounded bg-slate-800 px-3 py-1.5 text-sm text-white">{playing ? "Ⅱ 暂停回放" : "▶ 回放"}</button>
        <button onClick={() => { setPlaying(false); setTickIndex(0); }} className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm">↺ 回到起点</button>
        <input type="range" min={0} max={totalTicks} value={Math.min(tickIndex, totalTicks)} onChange={e => { setPlaying(false); setTickIndex(Number(e.target.value)); }} className="w-64" aria-label="时间轴" />
        <button onClick={exportTrace} className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm">⬇ 导出轨迹 JSON</button>
        {result.keyframes.map(k => (
          <button
            key={k.name}
            onClick={() => { setPlaying(false); setSelectedKeyframe(k.name); setTickIndex(Math.round(k.tMs / TICK_MS)); }}
            className={`rounded px-2 py-1 text-xs ${selectedKeyframe === k.name ? "bg-slate-800 text-white" : "border border-slate-300 bg-white"}`}
            title={k.caption}
          >
            {k.name}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,960px)_minmax(300px,1fr)]">
        <div className="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm">
          <PlaceholderStage world={view.world} frames={view.frames} />
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <section className="rounded-lg border border-slate-300 bg-white p-3 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold">时间线（{result.entries.length} 条，可回放）</h2>
            <div className="max-h-[520px] space-y-1 overflow-y-auto font-mono text-[11px]">
              {result.entries.map(entry => (
                <button
                  key={entry.seq}
                  onClick={() => { setPlaying(false); setTickIndex(Math.round(entry.tMs / TICK_MS)); }}
                  className={`block w-full rounded px-2 py-1 text-left ${entry.tMs <= current.tMs ? "opacity-100" : "opacity-40"}`}
                >
                  <span className={`mr-2 rounded px-1 ${KIND_STYLE[entry.kind] ?? ""}`}>{entry.kind}</span>
                  <span className="text-slate-400">{entry.tMs}ms</span> <span className="text-slate-600">{entry.actor}</span> {entry.label}
                </button>
              ))}
            </div>
          </section>
          <section className="rounded-lg border border-slate-300 bg-white p-3 text-xs shadow-sm">
            <h2 className="mb-2 text-sm font-semibold">汇总</h2>
            <pre className="whitespace-pre-wrap font-mono text-[11px] text-slate-600">{JSON.stringify(result.summary, null, 2)}</pre>
            <h2 className="mb-2 mt-3 text-sm font-semibold">人工评价项（不作自动评分）</h2>
            <ul className="list-disc pl-4 text-slate-600">
              <li>自然度：动作衔接是否有预备与余韵</li>
              <li>协调性：双角色同场时的节奏与注视关系</li>
              <li>视觉表现：几何占位下层级/朝向是否可读</li>
              <li>角色可信度：打断后的反应是否"像活的"</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
