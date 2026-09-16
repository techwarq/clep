"use client";

import { useCallback, useRef, useState } from "react";
import SegmentedTabs from "./SegmentedTabs";

type StyleKey = "saas" | "minimal" | "cinematic" | "apple";

const STYLES: Record<StyleKey, { label: string; backdrop: string; window: string; accent: string }> = {
  saas: { label: "SaaS", backdrop: "linear-gradient(135deg,#c4b5fd,#f9a8d4,#bfdbfe)", window: "#ffffff", accent: "#4d7c0f" },
  minimal: { label: "Minimal", backdrop: "linear-gradient(135deg,#e8e8ee,#f8f8fa,#e0e4ec)", window: "#ffffff", accent: "#0a0a0a" },
  cinematic: { label: "Cinematic", backdrop: "linear-gradient(135deg,#341c60,#100c26,#602478)", window: "#1c1e24", accent: "#d6ff3b" },
  apple: { label: "Apple", backdrop: "linear-gradient(135deg,#c7d2fe,#f3f4f6,#bae6fd)", window: "#ffffff", accent: "#007aff" },
};

const STEPS = [
  "Discovering data-clep features…",
  "Driving the live feature…",
  "Editing raw capture (zoom, cursor, ripple)…",
  "Exporting 16:9 MP4, 60fps…",
];

const SNIPPET = `<button data-clep="ai-research" data-clep-action="primary">
  Start Research
</button>`;

export default function DemoWidget({ onToast }: { onToast: (m: string) => void }) {
  const [styleKey, setStyleKey] = useState<StyleKey>("saas");
  const [phase, setPhase] = useState<"idle" | "recording" | "editing" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [query, setQuery] = useState("AI browser agents");
  const timers = useRef<number[]>([]);

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const runClip = useCallback(() => {
    clear();
    setPhase("recording");
    setProgress(4);
    setStepIdx(0);
    STEPS.forEach((_, i) => {
      timers.current.push(
        window.setTimeout(() => {
          setStepIdx(i);
          setProgress(8 + Math.round(((i + 1) / STEPS.length) * 88));
          if (i === 2) setPhase("editing");
        }, 700 * (i + 1)),
      );
    });
    timers.current.push(
      window.setTimeout(() => {
        setPhase("done");
        setProgress(100);
      }, 700 * (STEPS.length + 1)),
    );
  }, []);

  const s = STYLES[styleKey];

  return (
    <div className="demo-shell" id="demo" data-clep="demo-clip" data-clep-state={phase}>
      <div className="demo-topbar">
        <div className="traffic">
          <i style={{ background: "#FF5F57" }} />
          <i style={{ background: "#FEBC2E" }} />
          <i style={{ background: "#28C840" }} />
          <span className="topbar-url" style={{ marginLeft: 10 }}>
            app.clep.io — feature → clip
          </span>
        </div>
        <span className="live">
          <b /> {phase === "recording" ? "RECORDING" : phase === "editing" ? "EDITING" : phase === "done" ? "MP4 READY" : "LIVE DEMO"}
        </span>
      </div>

      <div className="demo-grid">
        {/* LEFT — instrument */}
        <div className="drop-pane">
          <div className="prompt-box" style={{ marginTop: 0 }}>
            <div className="prompt-head">1 · Instrument once (Claude does this for you)</div>
            <pre
              style={{
                margin: 0,
                fontFamily: "var(--mono)",
                fontSize: 12.5,
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                background: "#0d1412",
                color: "#eef7d0",
                borderRadius: 10,
                padding: "12px 14px",
              }}
            >
              {SNIPPET}
            </pre>
            <div style={{ fontSize: 12.5, color: "#55605b", marginTop: 8 }}>
              Prompt Claude: <em style={{ fontFamily: "var(--mono)" }}>“/clep:clep clip the ai-research feature”</em> — it
              adds <span style={{ fontFamily: "var(--mono)" }}>data-clep</span> + actions + states, then renders.
            </div>
          </div>

          <SegmentedTabs
            options={(Object.keys(STYLES) as StyleKey[]).map((k) => ({ key: k, label: STYLES[k].label }))}
            value={styleKey}
            onChange={(k) => setStyleKey(k as StyleKey)}
          />

          <div className="prompt-box">
            <div className="prompt-head">2 · Query the agent types</div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Query override"
              style={{
                width: "100%",
                border: 0,
                background: "transparent",
                fontFamily: "var(--mono)",
                fontSize: 13.5,
                color: "var(--text)",
              }}
            />
          </div>

          <button className="btn btn-lime" style={{ marginTop: 14, width: "100%", justifyContent: "center" }} onClick={runClip}>
            {phase === "idle" ? "▶ Make Clip — watch it happen" : phase === "done" ? "↻ Replay the pipeline" : "● Running…"}
          </button>
          <div style={{ fontSize: 12, color: "#55605b", marginTop: 8, textAlign: "center" }}>
            No manual recording. No SDK install yet — just the plugin + API key.
          </div>
        </div>

        {/* RIGHT — clip output mock */}
        <div className="sheet-pane">
          <div className="conv-head">
            <strong>ai-research.mp4</strong>
            <span className="conv-meta">{phase === "done" ? "1920×1080 · 60fps" : `${progress}%`}</span>
          </div>
          <div className={`progress ${phase === "recording" || phase === "editing" ? "loading" : ""}`}>
            <div style={{ width: `${progress}%` }} />
          </div>

          {/* mock 16:9 player */}
          <div
            style={{
              marginTop: 12,
              borderRadius: 14,
              overflow: "hidden",
              background: s.backdrop,
              padding: 18,
              border: "1px solid var(--line)",
            }}
          >
            <div
              style={{
                background: s.window,
                borderRadius: 12,
                padding: 14,
                boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
                color: s.window === "#ffffff" ? "#111827" : "#f5f5f7",
              }}
            >
              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                <i style={{ width: 9, height: 9, borderRadius: "50%", background: "#FF5F57", display: "block" }} />
                <i style={{ width: 9, height: 9, borderRadius: "50%", background: "#FEBC2E", display: "block" }} />
                <i style={{ width: 9, height: 9, borderRadius: "50%", background: "#28C840", display: "block" }} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8 }}>⌕ {query || "AI browser agents"}</div>
              <div
                style={{
                  fontSize: 12,
                  borderRadius: 8,
                  padding: "8px 12px",
                  display: "inline-block",
                  background: s.accent,
                  color: s.window === "#ffffff" && styleKey !== "minimal" ? "#fff" : styleKey === "cinematic" ? "#0c0d10" : "#f2f7e4",
                  fontWeight: 700,
                }}
              >
                {phase === "done" ? "✓ Sources appear" : phase === "idle" ? "Start Research" : "● Research running…"}
              </div>
              {phase === "done" && (
                <div style={{ fontSize: 11.5, marginTop: 10, opacity: 0.75, fontFamily: "var(--mono)" }}>
                  auto-zoom · custom cursor · click ripple · {s.label} grade
                </div>
              )}
            </div>
            <div style={{ textAlign: "center", marginTop: 10, fontSize: 11.5, fontFamily: "var(--mono)", color: "#0d1412cc" }}>
              {phase === "idle" ? "16:9 canvas · floating window · gradient backdrop" : phase === "done" ? "▶ preview — 2–5s product clip" : STEPS[stepIdx]}
            </div>
          </div>

          <ol className="conv-steps">
            {STEPS.map((label, i) => {
              const done = phase === "done" || (phase !== "idle" && i < stepIdx);
              const act = phase !== "idle" && phase !== "done" && i === stepIdx;
              return (
                <li key={label} className={done ? "done" : act ? "active" : ""}>
                  {done ? <span className="tick">✓</span> : act ? <span className="spin" /> : <span className="tick" />}
                  {label}
                </li>
              );
            })}
          </ol>

          <div className="sheet-actions">
            <button
              className="btn btn-lime btn-sm"
              onClick={() => onToast(phase === "done" ? "Demo MP4 downloaded (mock)" : "Hit Make Clip first")}
            >
              ⤓ Download MP4
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => onToast("trace.json: cursor, clicks, bbox per step")}>
              trace.json
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                navigator.clipboard?.writeText(SNIPPET).catch(() => {});
                onToast("data-clep snippet copied");
              }}
            >
              Copy snippet
            </button>
          </div>
          <div style={{ fontSize: 12, color: "#55605b", marginTop: 10 }}>
            Real clips render on your hosted backend: Playwright drives the feature, polish edits it to 1080p60.
          </div>
        </div>
      </div>
    </div>
  );
}
