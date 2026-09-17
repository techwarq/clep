"use client";

import { useCallback, useRef, useState } from "react";
import SegmentedTabs from "./SegmentedTabs";

type StyleKey = "saas" | "minimal" | "cinematic" | "apple";

const STYLES: Record<StyleKey, { label: string; backdrop: string; window: string; accent: string; sub: string }> = {
  saas: {
    label: "SaaS",
    backdrop: "linear-gradient(135deg,#c4b5fd,#f9a8d4,#bfdbfe)",
    window: "#ffffff",
    accent: "#4d7c0f",
    sub: "Gradient backdrop · floating window",
  },
  minimal: {
    label: "Minimal",
    backdrop: "linear-gradient(135deg,#e8e8ee,#f8f8fa,#e0e4ec)",
    window: "#ffffff",
    accent: "#0a0a0a",
    sub: "Quiet canvas · sharp focus",
  },
  cinematic: {
    label: "Cinematic",
    backdrop: "linear-gradient(135deg,#341c60,#100c26,#602478)",
    window: "#1c1e24",
    accent: "#d6ff3b",
    sub: "Dark grade · slow push-in",
  },
  apple: {
    label: "Apple",
    backdrop: "linear-gradient(135deg,#c7d2fe,#f3f4f6,#bae6fd)",
    window: "#ffffff",
    accent: "#007aff",
    sub: "Soft light · crisp type",
  },
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
  const dark = s.window !== "#ffffff";
  const busy = phase === "recording" || phase === "editing";

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
        <span className={`live live-${phase}`}>
          <b />{" "}
          {phase === "recording"
            ? "RECORDING"
            : phase === "editing"
              ? "EDITING"
              : phase === "done"
                ? "MP4 READY"
                : "LIVE DEMO"}
        </span>
      </div>

      <div className="demo-grid">
        {/* LEFT — instrument */}
        <div className="drop-pane">
          <div className="demo-step-label">
            <span>1</span> Instrument once — Claude does this for you
          </div>
          <div className="demo-snippet">
            <div className="demo-snippet-head">
              <span>ai-research.tsx</span>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(SNIPPET).catch(() => {});
                  onToast("data-clep snippet copied");
                }}
              >
                Copy
              </button>
            </div>
            <pre>{SNIPPET}</pre>
          </div>
          <p className="demo-hint">
            Prompt Claude: <em>“/clep:clep clip the ai-research feature”</em> — it adds{" "}
            <code className="kbd">data-clep</code> + actions + states, then renders.
          </p>

          <div className="demo-step-label" style={{ marginTop: 18 }}>
            <span>2</span> Pick a grade
          </div>
          <SegmentedTabs
            options={(Object.keys(STYLES) as StyleKey[]).map((k) => ({ key: k, label: STYLES[k].label }))}
            value={styleKey}
            onChange={(k) => setStyleKey(k as StyleKey)}
          />
          <div className="style-sub">{s.sub}</div>

          <div className="demo-step-label" style={{ marginTop: 18 }}>
            <span>3</span> Direct the moment
          </div>
          <div className="query-box">
            <span aria-hidden>⌕</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Query override"
              placeholder="AI browser agents"
            />
          </div>

          <button className="btn btn-lime btn-lg demo-run" onClick={runClip}>
            {phase === "idle" ? "▶ Make Clip — watch it happen" : phase === "done" ? "↻ Replay the pipeline" : "● Running…"}
          </button>
          <div className="demo-fine">No manual recording. Plugin + API key only — no SDK install.</div>
        </div>

        {/* RIGHT — clip output */}
        <div className="sheet-pane">
          <div className="conv-head">
            <strong>ai-research.mp4</strong>
            <span className="conv-meta">{phase === "done" ? "1920×1080 · 60fps" : `${progress}%`}</span>
          </div>
          <div className={`progress ${busy ? "loading" : ""}`}>
            <div style={{ width: `${progress}%` }} />
          </div>

          <div className="clip-stage" style={{ background: s.backdrop }}>
            <div className={`clip-window ${busy ? "zooming" : ""}`} style={{ background: s.window }}>
              <div className="clip-chrome">
                <span>
                  <i style={{ background: "#FF5F57" }} />
                  <i style={{ background: "#FEBC2E" }} />
                  <i style={{ background: "#28C840" }} />
                </span>
                <em style={{ color: dark ? "#a1a1aa" : "#9aa39e" }}>clep — ai-research</em>
              </div>
              <div className="clip-query" style={{ color: dark ? "#f5f5f7" : "#111827" }}>
                ⌕ {query || "AI browser agents"}
              </div>
              <div className="clip-action-row">
                <span
                  className="clip-btn"
                  style={{
                    background: s.accent,
                    color: styleKey === "cinematic" ? "#0c0d10" : styleKey === "minimal" ? "#fff" : "#fff",
                  }}
                >
                  {phase === "done" ? "✓ Sources appear" : phase === "idle" ? "Start Research" : "● Research running…"}
                </span>
                {busy && <span className="cursor" aria-hidden>➤</span>}
              </div>
              {phase === "recording" && <span className="rec-dot">● REC</span>}
              {phase === "done" && (
                <div className="clip-tags" style={{ color: dark ? "#d4d4d8" : "#55605b" }}>
                  auto-zoom · custom cursor · click ripple · {s.label} grade
                </div>
              )}
              {busy && <span className="zoom-frame" aria-hidden />}
            </div>
            <div className="clip-caption">{phase === "idle" ? "16:9 canvas · floating window · gradient backdrop" : phase === "done" ? "▶ preview — 2–5s product clip" : STEPS[stepIdx]}</div>
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
          <div className="demo-fine" style={{ textAlign: "left", marginTop: 10 }}>
            Real clips render on your hosted backend: Playwright drives the feature, polish edits it to 1080p60.
          </div>
        </div>
      </div>
    </div>
  );
}
