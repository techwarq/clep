"use client";

const BACKDROP = "linear-gradient(135deg,#c4b5fd,#f9a8d4,#bfdbfe)";
const VIDEO_SRC = "/doc-convert-1080p.mp4";

const SNIPPET = `<button data-clep="ai-research" data-clep-action="primary">
  Start Research
</button>`;

export default function DemoWidget({ onToast }: { onToast: (m: string) => void }) {
  const copySnippet = () => {
    navigator.clipboard?.writeText(SNIPPET).catch(() => {});
    onToast("data-clep snippet copied");
  };

  return (
    <div className="demo-shell" id="demo" data-clep="demo-clip">
      <div className="demo-topbar">
        <div className="traffic">
          <i style={{ background: "#FF5F57" }} />
          <i style={{ background: "#FEBC2E" }} />
          <i style={{ background: "#28C840" }} />
        </div>
        <span className="live live-idle">
          <b /> LIVE DEMO
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
              <button onClick={copySnippet}>Copy</button>
            </div>
            <pre>{SNIPPET}</pre>
          </div>
          <p className="demo-hint">
            Prompt Claude: <em>“/clep:clep clip the ai-research feature”</em> — it adds{" "}
            <code className="kbd">data-clep</code> + actions + states, then renders.
          </p>
        </div>

        {/* RIGHT — real clip output */}
        <div className="sheet-pane">
          <div className="clip-stage" style={{ background: BACKDROP }}>
            <video
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
            <div className="clip-caption">16:9 canvas · floating window · gradient backdrop</div>
          </div>

          <div className="sheet-actions">
            <a className="btn btn-lime btn-sm" href={VIDEO_SRC} download>
              ⤓ Download MP4
            </a>
            <button className="btn btn-ghost btn-sm" onClick={() => onToast("trace.json: cursor, clicks, bbox per step")}>
              trace.json
            </button>
            <button className="btn btn-ghost btn-sm" onClick={copySnippet}>
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
