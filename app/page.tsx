"use client";

import { useState } from "react";
import Image from "next/image";
import DemoWidget from "../components/DemoWidget";
import Reveal from "../components/Reveal";

const MANUAL_STEPS = [
  "Open your app",
  "Start a screen recording",
  "Perform the workflow perfectly",
  "Crop the recording",
  "Zoom into the important UI",
  "Add cursor movement",
  "Add transitions",
  "Export",
  "Repeat for every feature",
];

const SOURCE_OF_TRUTH = [
  ["◧", "Components", "What renders where"],
  ["◐", "UI states", "Idle, loading, done"],
  ["▢", "Buttons", "What can be clicked"],
  ["▤", "Inputs", "What can be typed"],
  ["⎙", "Navigation", "How views connect"],
  ["◌", "Loading states", "What waits look like"],
  ["✓", "Results", "What success looks like"],
  ["✦", "Interactions", "What drives the story"],
] as [string, string, string][];

const CINEMATIC_MOTION: [string, string, string][] = [
  ["◎", "Focus", "Find the important UI and ignore the rest."],
  ["＋", "Zoom", "Move the camera toward the interaction."],
  ["↔", "Pan", "Follow the feature as it changes."],
  ["◷", "Timing", "Match motion to the interaction, not a template."],
  ["➤", "Cursor", "Make clicks and interactions obvious."],
  ["〜", "Transitions", "Move naturally between UI states."],
];

const USE_CASES: [string, string, string][] = [
  ["◈", "Landing pages", "Show the feature while someone reads about it."],
  ["▲", "Product Hunt", "Turn every feature into a visual demo."],
  ["✕", "X / LinkedIn", "Post launches without editing video manually."],
  ["▤", "Documentation", "Show instead of explaining."],
  ["✦", "Changelogs", "Make every release visual."],
];

const MICRO_DEMOS = [
  { name: "AI Research", meta: "Search → sources appear", dur: "3.8s", w: "76%" },
  { name: "Document Upload", meta: "Drop → parsed rows", dur: "2.4s", w: "48%" },
  { name: "AI Chat", meta: "Prompt → streaming answer", dur: "3.1s", w: "62%" },
  { name: "Export Report", meta: "Click → MP4 + CSV", dur: "2.7s", w: "54%" },
  { name: "Collaboration", meta: "Invite → live cursors", dur: "4.2s", w: "84%" },
];

const CAMERA_STEPS = ["Click", "Zoom", "Interaction", "State change", "Focus result", "Zoom out"];

const RELEASE_STEPS = ["Build", "Test", "Ship", "/clep:clep", "Publish"];

const INSTALL_CMD = `/plugin marketplace add techwarq/clep-plugin
/plugin install clep@clep-marketplace

# Paste your API key (dashboard → API Keys)
export CLEP_API_KEY=clep_live_...

# In your app repo, prompt Claude Code:
/clep:clep clip the ai-research feature — cinematic style`;

export default function Page() {
  const [toast, setToast] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const showToast = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2600);
  };

  const copy = async (text: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
    showToast(msg);
  };

  const scrollToDemo = () => {
    setMenuOpen(false);
    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const navGo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* NAV */}
      <div className="nav">
        <div className="nav-inner">
          <a className="brand" href="#top" aria-label="clep — home">
            <Image src="/logo.png" alt="clep" width={760} height={413} className="brand-logo" priority />
          </a>
          <nav className="nav-links">
            <a href="#how">How it Works</a>
            <a href="#claude">Claude Code</a>
            <a href="#demos">Micro Demos</a>
            <a href="#plugin">Plugin</a>
          </nav>
          <div className="nav-actions">
            <a href="/login" className="login-link">
              Log in
            </a>
            <a href="/signup" className="btn btn-lime btn-sm">
              Try Clep Free
            </a>
            <button
              className="hamburger"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="mobile-menu">
            <a onClick={() => navGo("how")}>How it Works</a>
            <a onClick={() => navGo("claude")}>Claude Code</a>
            <a onClick={() => navGo("demos")}>Micro Demos</a>
            <a onClick={() => navGo("plugin")}>Plugin</a>
            <a href="/dashboard">Dashboard</a>
            <a href="/login">Log in</a>
            <a href="/signup" className="btn btn-lime">
              Try Clep Free
            </a>
          </div>
        )}
      </div>

      <main id="top" className="wrap">
        {/* HERO */}
        <section className="hero">
          <span className="pill hero-anim d1">
            <span className="dot" /> Your code already knows how your product works
          </span>
          <h1 className="hero-anim d2">
            Turn any feature into a <em>3–5 second</em> product clip.
          </h1>
          <p className="sub hero-anim d3">
            Add one <code className="kbd">data-clep</code> attribute to your React app — or just prompt Claude and let
            it add one for you. Then run <code className="kbd">/clep:clep</code> in Claude Code to capture the
            feature and generate a cinematic demo.
          </p>
          <div className="hero-cta hero-anim d4">
            <a className="btn btn-lime btn-lg" href="/signup">
              Try Clep Free <span aria-hidden>→</span>
            </a>
            <button className="btn btn-ghost btn-lg" onClick={scrollToDemo}>
              <span aria-hidden>▶</span> Watch it work
            </button>
          </div>
          <div className="hero-proof hero-anim d5">
            <span>✓ No screen recording</span>
            <i />
            <span>✓ No timeline editing</span>
            <i />
            <span>✓ No manual camera moves</span>
          </div>
          <div className="stat-strip hero-anim d6">
            <div>
              <b>2–5s</b>
              <span>cinematic clips</span>
            </div>
            <div>
              <b>1080p · 60fps</b>
              <span>16:9 MP4, ready to post</span>
            </div>
            <div>
              <b>1 command</b>
              <span>/clep:clep does the rest</span>
            </div>
          </div>
        </section>

        <div className="logos hero-anim d6">
          CLIPS, NOT SCREEN RECORDINGS
          <div className="marquee">
            <div className="marquee-track">
              {[0, 1].map((k) => (
                <div className="marquee-group" key={k}>
                  {["16:9 MP4", "60FPS", "1080P", "AUTO-ZOOM", "CURSOR", "RIPPLE", "SAAS GRADE", "CINEMATIC"].map(
                    (f) => (
                      <span key={f}>
                        <i className="mq-dot" /> {f}
                      </span>
                    ),
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BUILD → MARK → CLIP */}
        <Reveal className="section">
          <div className="section-head">
            <div className="eyebrow">Build it. Mark it. Clip it.</div>
            <h2 className="h2">Three steps. One command that matters.</h2>
          </div>
          <div className="flow3">
            <div className="flow-step">
              <span className="flow-num">01</span>
              <h3>Build</h3>
              <p>Ship your React feature like normal. Nothing changes in your workflow.</p>
              <code className="kbd">Your React app</code>
            </div>
            <span className="flow-arrow" aria-hidden>
              →
            </span>
            <div className="flow-step">
              <span className="flow-num">02</span>
              <h3>Mark</h3>
              <p>Claude adds one attribute to the right component — or add it yourself.</p>
              <code className="kbd">data-clep="ai-research"</code>
            </div>
            <span className="flow-arrow" aria-hidden>
              →
            </span>
            <div className="flow-step highlight">
              <span className="flow-num">03</span>
              <h3>Clip</h3>
              <p>Run the plugin. Get a framed, directed 2–5s product clip.</p>
              <code className="kbd">/clep:clep</code>
            </div>
          </div>
        </Reveal>

        <div className="hero-anim d6">
          <DemoWidget onToast={showToast} />
        </div>

        {/* THE PROBLEM */}
        <Reveal className="section">
          <div className="section-head">
            <div className="eyebrow">The problem</div>
            <h2 className="h2">You built the feature. Now you have to make a video about it.</h2>
            <p className="lead">Shipping a feature is easy compared to showing it beautifully.</p>
          </div>
          <div className="pain-grid">
            <div className="pain-card bad">
              <div className="pain-head">The old way · 9 painful steps</div>
              <ul>
                {MANUAL_STEPS.map((s) => (
                  <li key={s}>
                    <span className="x">✕</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="pain-card good">
              <div className="pain-head">The Clep way · 1 command</div>
              <div className="clep-cmd">/clep:clep</div>
              <p>Clip the ai-research feature — cinematic style. Clep finds it, drives it, frames it, exports it.</p>
              <ul className="mini-check">
                <li>✓ Auto-framed interaction</li>
                <li>✓ Camera, cursor & ripple</li>
                <li>✓ 1080p60 MP4 in seconds</li>
              </ul>
              <a className="btn btn-lime" href="/signup">
                Skip the editing →
              </a>
            </div>
          </div>
        </Reveal>

        {/* HOW IT WORKS */}
        <Reveal className="section" id="how">
          <div className="section-head">
            <div className="eyebrow">How it works</div>
            <h2 className="h2">From React component to product video.</h2>
          </div>
          <div className="steps4">
            <div className="step">
              <span className="step-num">01</span>
              <h3>Mark your feature</h3>
              <p>
                Prompt Claude and it adds <code className="kbd">data-clep="ai-research"</code> to the right component
                — or add it yourself any time.
              </p>
            </div>
            <div className="step">
              <span className="step-num">02</span>
              <h3>Run your app locally</h3>
              <p>
                <code className="kbd">npm run dev</code>. Clep connects to your local dev server — source stays on
                your machine during capture.
              </p>
            </div>
            <div className="step">
              <span className="step-num">03</span>
              <h3>Run /clep:clep</h3>
              <p>
                Inside Claude Code: <code className="kbd">/clep:clep clip the ai-research feature</code>. Clep opens
                your app in an isolated browser and runs it.
              </p>
            </div>
            <div className="step">
              <span className="step-num">04</span>
              <h3>Get the clip</h3>
              <p>Clep captures the interaction and directs the camera. 2–5s. Ready to ship.</p>
            </div>
          </div>
          <div className="camera-card">
            <div className="camera-label">Every clip follows a deliberate camera arc</div>
            <div className="camera-flow">
              {CAMERA_STEPS.map((c, i) => (
                <span key={c} className="camera-group">
                  <span className="camera-pill">{c}</span>
                  {i < CAMERA_STEPS.length - 1 && (
                    <span className="camera-arrow" aria-hidden>
                      →
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        {/* BUILT FOR DEVELOPERS */}
        <Reveal className="section">
          <div className="section-head">
            <div className="eyebrow">Built for developers</div>
            <h2 className="h2">Your app is the source of truth.</h2>
            <p className="lead">
              No designer walkthrough needed. Your code already contains everything Clep needs to direct the video —
              your feature becomes a structured timeline, and that timeline becomes the video.
            </p>
          </div>
          <div className="truth-grid">
            {SOURCE_OF_TRUTH.map(([icon, t, d]) => (
              <div className="truth-card" key={t}>
                <span className="truth-icon">{icon}</span>
                <div>
                  <b>{t}</b>
                  <span>{d}</span>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* CLAUDE CODE */}
        <Reveal className="section" id="claude">
          <div className="claude-band">
            <div>
              <div className="eyebrow light">Ask Claude to show your feature</div>
              <blockquote className="claude-quote">
                “/clep:clep create a 4 second demo of the new AI research feature.”
              </blockquote>
              <p className="claude-sub">
                Describe the moment you want. Claude finds the feature, drives the interaction, and hands you a
                finished clip.
              </p>
              <button className="btn btn-lime" onClick={() => copy("/clep:clep clip the ai-research feature", "Prompt copied — paste it in Claude Code")}>
                Copy prompt
              </button>
            </div>
            <div className="terminal">
              <div className="term-head">
                <span className="traffic">
                  <i style={{ background: "#FF5F57" }} />
                  <i style={{ background: "#FEBC2E" }} />
                  <i style={{ background: "#28C840" }} />
                </span>
                <span className="term-title">claude code — /clep:clep</span>
              </div>
              <ul className="term-list">
                <li>✓ Found AI Research</li>
                <li>✓ Found interaction flow</li>
                <li>✓ Started local app</li>
                <li>✓ Captured the feature</li>
                <li>✓ Generated the motion</li>
                <li className="term-done">🎬 ai-research.mp4 — 1920×1080</li>
              </ul>
            </div>
          </div>
        </Reveal>

        {/* CINEMATIC MOTION */}
        <Reveal className="section">
          <div className="section-head">
            <div className="eyebrow">Not a screen recording</div>
            <h2 className="h2">Cinematic motion, automatically.</h2>
            <p className="lead">Clep turns raw browser interaction into a deliberate camera sequence.</p>
          </div>
          <div className="grid4">
            {CINEMATIC_MOTION.map(([icon, t, d]) => (
              <div className="card motion-card" key={t}>
                <div className="icon">{icon}</div>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* MICRO DEMOS */}
        <Reveal className="section" id="demos">
          <div className="section-head">
            <div className="eyebrow">Micro demos</div>
            <h2 className="h2">Perfect for tiny feature moments.</h2>
            <p className="lead">Don&apos;t make a 2-minute product tour. Make dozens of tiny clips.</p>
          </div>
          <div className="clip-list">
            {MICRO_DEMOS.map((c) => (
              <div className="clip-row" key={c.name}>
                <span className="play-btn" aria-hidden>
                  ▶
                </span>
                <div className="clip-meta">
                  <b>{c.name}</b>
                  <span>{c.meta}</span>
                  <div className="clip-bar">
                    <div style={{ width: c.w }} />
                  </div>
                </div>
                <span className="dur">{c.dur}</span>
              </div>
            ))}
          </div>
          <p className="use-label">Use them anywhere:</p>
          <div className="use-grid">
            {USE_CASES.map(([icon, t, d]) => (
              <div className="card use-card" key={t}>
                <span className="use-icon">{icon}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* PLUGIN */}
        <Reveal className="section" id="plugin">
          <div className="section-head">
            <div className="eyebrow">One command, no SDK</div>
            <h2 className="h2">Install the plugin. Mark it. Run /clep:clep.</h2>
            <p className="lead">
              No npm package to install — there isn&apos;t one yet. Claude adds{" "}
              <code className="kbd">data-clep</code> for you via the plugin, and plain HTML attributes work without
              any JS.
            </p>
          </div>
          <div className="plugin-grid">
            <div className="plugin-steps">
              {[
                ["1", "Add the marketplace", "Once per machine. Takes 10 seconds."],
                ["2", "Paste your API key", "From dashboard → API Keys. Kept in your shell."],
                ["3", "Prompt Claude in your repo", "Describe the feature. Get back an MP4."],
              ].map(([n, t, d]) => (
                <div className="plugin-step" key={n}>
                  <span className="plugin-num">{n}</span>
                  <div>
                    <b>{t}</b>
                    <span>{d}</span>
                  </div>
                </div>
              ))}
              <div className="plugin-cta">
                <a className="btn btn-lime btn-sm" href="/signup">
                  Get your API key
                </a>
                <a className="btn btn-ghost btn-sm" href="/dashboard">
                  Open dashboard →
                </a>
              </div>
            </div>
            <div className="code-window">
              <div className="code-head">
                <span className="traffic">
                  <i style={{ background: "#FF5F57" }} />
                  <i style={{ background: "#FEBC2E" }} />
                  <i style={{ background: "#28C840" }} />
                </span>
                <span>terminal — bash</span>
                <button className="copy-btn" onClick={() => copy(INSTALL_CMD, "Install commands copied")}>
                  Copy
                </button>
              </div>
              <pre>{INSTALL_CMD}</pre>
            </div>
          </div>
        </Reveal>

        {/* LOCAL-FIRST */}
        <Reveal className="section">
          <div className="section-head">
            <div className="eyebrow">Local-first</div>
            <h2 className="h2">Your app stays local during capture.</h2>
            <p className="lead">
              Clep connects to your development server locally — no need to deploy an unfinished feature just to make
              a demo.
            </p>
          </div>
          <div className="local-flow">
            {["localhost", "clep", "Playwright", "Browser capture"].map((s, i, arr) => (
              <span key={s} className="camera-group">
                <span className={`camera-pill ${i === arr.length - 1 ? "dark" : ""}`}>{s}</span>
                {i < arr.length - 1 && (
                  <span className="camera-arrow" aria-hidden>
                    ↓
                  </span>
                )}
              </span>
            ))}
          </div>
          <p className="local-tag">
            <strong>Capture locally. Render when you&apos;re ready.</strong>
          </p>
        </Reveal>

        {/* SHIP CTA */}
        <Reveal className="cta">
          <div>
            <div className="eyebrow">For every feature you ship</div>
            <h2>Ship the feature. Ship the demo.</h2>
            <p>Every new feature gets a corresponding clip. Your release workflow becomes:</p>
            <div className="release-flow">
              {RELEASE_STEPS.map((s, i) => (
                <span key={s} className="camera-group">
                  <span className={`camera-pill sm ${s === "/clep:clep" ? "lime" : ""}`}>{s}</span>
                  {i < RELEASE_STEPS.length - 1 && (
                    <span className="camera-arrow sm" aria-hidden>
                      →
                    </span>
                  )}
                </span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
              <a className="btn btn-dark btn-lg" href="/signup">
                Try Clep Free →
              </a>
            </div>
            <div className="trust" style={{ textAlign: "left" }}>
              No SDK • No credit card
            </div>
          </div>
          <div className="cta-mock">
            <div className="cta-mock-head">◉ ai-research.mp4</div>
            <div className="cta-mock-sub">1920×1080 · 60fps · 3.8s</div>
            <div className="mini-bar">
              <div style={{ width: "100%" }} />
            </div>
            <div className="cta-mock-tags">
              <span>auto-zoom</span>
              <span>cursor</span>
              <span>ripple</span>
            </div>
          </div>
        </Reveal>

        {/* FINAL CTA */}
        <Reveal className="final-cta">
          <h2>Your next feature already knows how to demo itself.</h2>
          <p>Turn your UI into motion.</p>
          <div className="final-cta-row">
            <a className="btn btn-lime btn-lg" href="/signup">
              Start Building →
            </a>
            <a className="btn btn-ghost btn-lg" href="/dashboard">
              Open dashboard
            </a>
          </div>
          <div className="final-note">No video editing timeline. No manual recording. Just your code and /clep:clep.</div>
        </Reveal>

        <footer>
          <div className="foot-grid">
            <div>
              <span className="foot-brand">clep</span>
              <p className="foot-tag">Code it. Clip it. Ship it.</p>
            </div>
            <nav>
              <b>Product</b>
              <a href="#how">How it works</a>
              <a href="#demos">Micro demos</a>
              <a href="/dashboard">Dashboard</a>
            </nav>
            <nav>
              <b>Developers</b>
              <a href="#plugin">Plugin install</a>
              <a href="#claude">Claude Code</a>
              <a href="/signup">API keys</a>
            </nav>
            <nav>
              <b>Company</b>
              <a href="#plugin">Privacy</a>
              <a href="#plugin">Security</a>
              <a href="#plugin">Terms</a>
            </nav>
          </div>
          <div className="foot">
            <span>© 2026 Clep</span>
            <span>Turn features into clips.</span>
          </div>
        </footer>
      </main>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
