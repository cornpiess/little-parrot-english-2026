import { useMemo, useState } from "react";
import { checkExpectedExperienceId, useExperienceHost } from "./useExperienceHost";

// /_integration/experience —— 仅开发环境的体验宿主集成页。
// 用 iframe 承载本地内容源（默认播放器 http://127.0.0.1:4173；指向体验包用环境变量：
//   VITE_EXPERIENCE_ORIGIN=http://127.0.0.1:4175 VITE_EXPERIENCE_ID=contract-fixture npm run dev
// ），验证 Experience Package v1 宿主协议：握手（含预期包 ID 校验）、语义事件上报、暂停/继续/退出。
// 注意：breakfast 是 rejected 原型、contract-fixture 是无故事测试夹具，都只允许用于内部集成测试，
// 禁止接入正式用户入口（正式入口只允许 review.json 为 approved 且无第三方 IP 问题的体验包）。
const DEFAULT_EXPERIENCE_ORIGIN = "http://127.0.0.1:4173";
const EXPECTED_ID_LABEL: Record<string, { text: string; style: string }> = {
  "no-expectation": { text: "未设预期 ID", style: "bg-slate-200 text-slate-600" },
  pending: { text: "等待 ID 校验", style: "bg-amber-100 text-amber-800" },
  match: { text: "ID 匹配", style: "bg-emerald-100 text-emerald-800" },
  mismatch: { text: "ID 不匹配！", style: "bg-red-100 text-red-700" },
};

const STATE_LABEL: Record<string, string> = {
  "awaiting-ready": "等待体验握手（ready）",
  ready: "已连接",
  ended: "已结束",
  timeout: "握手超时",
};

const STATUS_STYLE: Record<string, string> = {
  "awaiting-ready": "bg-amber-100 text-amber-800",
  ready: "bg-emerald-100 text-emerald-800",
  ended: "bg-slate-200 text-slate-700",
  timeout: "bg-red-100 text-red-700",
};

export default function ExperienceIntegrationPage() {
  if (!import.meta.env.DEV) return null; // 双保险：生产构建即使被意外引入也不渲染
  const [reloadKey, setReloadKey] = useState(0);
  const experienceSrc = (import.meta.env.VITE_EXPERIENCE_ORIGIN as string | undefined) ?? DEFAULT_EXPERIENCE_ORIGIN;
  const expectedId = import.meta.env.VITE_EXPERIENCE_ID as string | undefined;
  const initPayload = useMemo(() => ({ childId: "fictional-a", locale: "zh-CN", sessionId: crypto.randomUUID() }), [reloadKey]);
  const { iframeRef, status, pause, resume, exit } = useExperienceHost(experienceSrc, reloadKey, initPayload);
  const latest = [...status.events].reverse();
  const idCheck = checkExpectedExperienceId(expectedId, status.ready);
  const idBadge = EXPECTED_ID_LABEL[idCheck];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <header className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold">体验宿主集成测试（Experience Package v1）</h1>
        <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">仅开发环境 · 内部测试用</span>
        <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[status.state] ?? ""}`}>{STATE_LABEL[status.state] ?? status.state}</span>
        <span className={`rounded px-2 py-0.5 text-xs font-medium ${idBadge.style}`}>{idBadge.text}{expectedId ? `（${expectedId}）` : ""}</span>
      </header>

      <p className="mb-4 max-w-3xl text-sm text-slate-600">
        内容源：<code className="rounded bg-slate-200 px-1">{experienceSrc}</code>（播放器用内容仓库 <code>npm start</code>；体验包用 <code>npm run xpkg serve &lt;id&gt;</code>）。
        当前内容仅用于协议集成验证；正式用户入口只允许 approved 且无第三方 IP 的体验包。
      </p>

      {idCheck === "mismatch" && (
        <p className="mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          ready.experienceId（{status.ready?.experienceId}）与预期包 ID（{expectedId}）不一致——iframe 里加载的不是配置想要的体验，请检查内容源。
        </p>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button onClick={pause} disabled={status.state !== "ready"} className="rounded bg-slate-800 px-3 py-1.5 text-sm text-white disabled:opacity-40">Ⅱ 暂停</button>
        <button onClick={resume} disabled={status.state !== "ready"} className="rounded bg-slate-800 px-3 py-1.5 text-sm text-white disabled:opacity-40">▶ 继续</button>
        <button onClick={exit} disabled={status.state !== "ready"} className="rounded bg-red-600 px-3 py-1.5 text-sm text-white disabled:opacity-40">⏹ 退出</button>
        <button onClick={() => setReloadKey((k) => k + 1)} className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm">↺ 重新加载（新 nonce）</button>
        {status.ready && (
          <span className="text-xs text-slate-500">
            握手：{status.ready.experienceId} · 协议 v{status.ready.protocolVersion} · agentTurn={String(status.ready.capabilities.agentTurn)}
          </span>
        )}
        {status.end && <span className="text-xs text-slate-500">end: {status.end.reason}{status.end.detail ? ` · ${status.end.detail}` : ""}</span>}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,960px)_minmax(280px,1fr)]">
        <div className="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm">
          {/* 跨源 iframe 不加 sandbox：sandbox 会让体验进入 opaque origin（event.origin 变 "null"），
              既破坏来源白名单校验也让体验的 localStorage 失效；安全性由协议的来源/nonce 校验承担 */}
          <iframe
            key={reloadKey}
            ref={iframeRef}
            src={experienceSrc}
            title="content experience"
            className="block h-[620px] w-full border-0"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <section className="rounded-lg border border-slate-300 bg-white p-3 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold">收到的语义事件（{status.events.length}，最新在上）</h2>
            <div className="max-h-[430px] space-y-1.5 overflow-y-auto">
              {latest.length === 0 && <p className="text-xs text-slate-400">在体验里选择物品并开始，事件会出现在这里。</p>}
              {latest.map((event) => (
                <div key={event.id} className="rounded border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-mono font-semibold text-slate-700">{event.type}</span>
                    <span className="text-slate-400">{new Date(event.time).toLocaleTimeString()}</span>
                  </div>
                  <div className="truncate font-mono text-[11px] text-slate-500" title={event.id}>id: {event.id}</div>
                  <div className="truncate font-mono text-[11px] text-slate-500">session: {event.sessionId}</div>
                  <div className="truncate font-mono text-[11px] text-slate-500" title={JSON.stringify(event.data)}>data: {JSON.stringify(event.data)}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-slate-300 bg-white p-3 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold">协议违规 / 拒收（{status.violations.length}）</h2>
            <div className="max-h-40 space-y-1 overflow-y-auto">
              {status.violations.length === 0 && <p className="text-xs text-slate-400">没有拒收消息。</p>}
              {status.violations.map((violation, index) => (
                <div key={index} className="rounded border border-amber-200 bg-amber-50 px-2 py-1 font-mono text-[11px] text-amber-800">
                  {violation.code}: {violation.message}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
