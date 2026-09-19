"use client";

import { useCallback, useRef, useState } from "react";

const BACKDROP = "linear-gradient(135deg,#c4b5fd,#f9a8d4,#bfdbfe)";
const VIDEO_SRC = "/doc-convert-1080p.mp4";

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
  const [phase, setPhase] = useState<"idle" | "recording" | "editing" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const timers = useRef<number[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const runClip = useCallback(() => {
    clear();
    setPhase("recording");
    setProgress(4);
    setStepIdx(0);
    const v = videoRef.current;
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
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

          <button className="btn btn-lime btn-lg demo-run" onClick={runClip}>
            {phase === "idle" ? "▶ Make Clip — watch it happen" : phase === "done" ? "↻ Replay the pipeline" : "● Running…"}
          </button>
          <div className="demo-fine">No manual recording. Plugin + API key only — no SDK install.</div>
        </div>

        {/* RIGHT — real clip output */}
        <div className="sheet-pane">
          <div className={`progress ${busy ? "loading" : ""}`}>
            <div style={{ width: `${progress}%` }} />
          </div>

          <div className="clip-stage" style={{ background: BACKDROP }}>
            <video
              ref={videoRef}
              className="clip-video"
              src={VIDEO_SRC}
              autoPlay
              controls
              muted
              loop
              playsInline
              preload="metadata"
              onLoadedMetadata={(e) => {
                const v = e.currentTarget;
                v.muted = true;
                v.play().catch(() => {});
              }}
            />
            <div className="clip-caption">{phase === "idle" ? "16:9 canvas · floating window · gradient backdrop" : phase === "done" ? "▶ real render — dashboard convert, 1080p60" : STEPS[stepIdx]}</div>
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
            <a className="btn btn-lime btn-sm" href={VIDEO_SRC} download>
              ⤓ Download MP4
            </a>
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
