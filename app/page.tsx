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
  "Components",
  "UI states",
  "Buttons",
  "Inputs",
  "Navigation",
  "Loading states",
  "Results",
  "Interactions",
];

const CINEMATIC_MOTION: [string, string][] = [
  ["Focus", "Find the important UI."],
  ["Zoom", "Move the camera toward the interaction."],
  ["Pan", "Follow the feature as it changes."],
  ["Timing", "Match motion to the interaction."],
  ["Cursor", "Make clicks and interactions obvious."],
  ["Transitions", "Move naturally between UI states."],
];

const USE_CASES: [string, string][] = [
  ["Landing pages", "Show the feature while someone reads about it."],
  ["Product Hunt", "Turn every feature into a visual demo."],
  ["X / LinkedIn", "Post feature launches without editing videos manually."],
  ["Documentation", "Show instead of explaining."],
  ["Changelogs", "Make every release visual."],
];

const MICRO_DEMOS = `AI Research       3.8s
Document Upload   2.4s
AI Chat           3.1s
Export Report     2.7s
Collaboration     4.2s`;

const BUILD_MARK_CLIP = `Your React App

[data-clep="ai-research"]
        ↓
/clep:clep
        ↓
AI Research
        ↓
✨ 2–5s product clip`;

const CAMERA_ARC = `Click
 ↓
Zoom
 ↓
Interaction
 ↓
State change
 ↓
Focus result
 ↓
Zoom out`;

const RELEASE_WORKFLOW = `Build
 ↓
Test
 ↓
Ship
 ↓
/clep:clep
 ↓
Publish`;

export default function Page() {
  const [toast, setToast] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const showToast = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2600);
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
            <a href="/login" className="login-link">Log in</a>
            <a href="/signup" className="btn btn-lime btn-sm">Try Clep Free</a>
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
            <a href="/signup" className="btn btn-lime">Try Clep Free</a>
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
            Add one <span style={{ fontFamily: "var(--mono)" }}>data-clep</span> attribute to your React app —
            or just prompt Claude and let it add one for you. Then run{" "}
            <span style={{ fontFamily: "var(--mono)" }}>/clep:clep</span> in Claude Code to capture the feature,
            automatically frame the important interactions, and generate a cinematic demo.
          </p>
          <div className="hero-cta hero-anim d4">
            <a className="btn btn-lime btn-lg" href="/signup">
              Try Clep Free
            </a>
            <button className="btn btn-ghost btn-lg" onClick={scrollToDemo}>
              ▶ View Demo
            </button>
          </div>
          <div className="trust hero-anim d5">No screen recording. No timeline editing. No manually moving cameras.</div>
        </section>

        <div className="logos hero-anim d6">
          CLIPS, NOT SCREEN RECORDINGS
          <div className="marquee">
            <div className="marquee-track">
              {[0, 1].map((k) => (
                <div className="marquee-group" key={k}>
                  {["16:9 MP4", "60FPS", "1080P", "AUTO-ZOOM", "CURSOR", "RIPPLE", "SAAS", "CINEMATIC"].map((f) => (
                    <span key={f}>{f}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BUILD IT. MARK IT. CLIP IT. */}
        <Reveal className="section">
          <div className="eyebrow">Build it. Mark it. Clip it.</div>
          <div className="card" style={{ marginTop: 16 }}>
            <pre style={{ margin: 0, fontFamily: "var(--mono)", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", textAlign: "center" }}>
              {BUILD_MARK_CLIP}
            </pre>
          </div>
        </Reveal>

        <div className="hero-anim d6">
          <DemoWidget onToast={showToast} />
        </div>

        {/* SECTION 1 — THE PROBLEM */}
        <Reveal className="section">
          <div className="eyebrow">The problem</div>
          <h2 className="h2">You built the feature. Now you have to make a video about it.</h2>
          <p className="lead">Shipping a feature is easy compared to showing it beautifully. You usually have to:</p>
          <div className="ugly-cloud">
            {MANUAL_STEPS.map((s) => (
              <span key={s} className="ugly-chip">{s}</span>
            ))}
          </div>
          <p className="lead" style={{ marginTop: 22, fontSize: 19 }}>
            <strong>Clep turns all of that into one command.</strong>
          </p>
        </Reveal>

        {/* SECTION 2 — HOW IT WORKS */}
        <Reveal className="section" id="how">
          <div className="eyebrow">How it works</div>
          <h2 className="h2">From React component to product video.</h2>
          <div className="steps4">
            <div className="step">
              <span className="step-num">01</span>
              <h3>Mark your feature</h3>
              <p>
                Prompt Claude and it adds <span style={{ fontFamily: "var(--mono)" }}>data-clep=&quot;ai-research&quot;</span> to
                the right component for you — or add it yourself any time. Clep understands where the feature lives in your app.
              </p>
            </div>
            <div className="step">
              <span className="step-num">02</span>
              <h3>Run your app locally</h3>
              <p>
                <span style={{ fontFamily: "var(--mono)" }}>npm run dev</span>. Clep connects to your local dev server —
                your source code stays on your machine during capture.
              </p>
            </div>
            <div className="step">
              <span className="step-num">03</span>
              <h3>Run /clep:clep</h3>
              <p>
                Inside Claude Code: <span style={{ fontFamily: "var(--mono)" }}>/clep:clep clip the ai-research feature</span>.
                Clep finds it, opens your app in an isolated browser, and runs the interaction.
              </p>
            </div>
            <div className="step">
              <span className="step-num">04</span>
              <h3>Get the clip</h3>
              <p>Clep captures the interaction and automatically directs the camera movement. 2–5s. Ready to ship.</p>
            </div>
          </div>
          <div className="card" style={{ marginTop: 22 }}>
            <pre style={{ margin: 0, fontFamily: "var(--mono)", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", textAlign: "center" }}>
              {CAMERA_ARC}
            </pre>
          </div>
        </Reveal>

        {/* SECTION 3 — BUILT FOR DEVELOPERS */}
        <Reveal className="section">
          <div className="eyebrow">Built for developers</div>
          <h2 className="h2">Your app is the source of truth.</h2>
          <p className="lead">
            Clep doesn&apos;t need a designer to manually explain the product. Your code already contains:
          </p>
          <div className="ugly-cloud">
            {SOURCE_OF_TRUTH.map((s) => (
              <span key={s} className="ugly-chip">{s}</span>
            ))}
          </div>
          <p className="lead" style={{ marginTop: 22 }}>
            Clep uses that structure to understand what is happening on screen — your feature becomes a structured timeline,
            and that timeline becomes the foundation for the video.
          </p>
        </Reveal>

        {/* SECTION 4 — CLAUDE CODE */}
        <Reveal className="section" id="claude">
          <div className="problem">
            <div className="problem-quote">
              <div className="eyebrow">Ask Claude to show your feature</div>
              <blockquote style={{ fontStyle: "italic", marginTop: 12 }}>
                &ldquo;/clep:clep create a 4 second demo of the new AI research feature.&rdquo;
              </blockquote>
            </div>
            <div className="card" style={{ borderColor: "rgba(101,163,13,.35)" }}>
              <div className="eyebrow">Claude Code does the rest</div>
              <ul className="check-list">
                <li>✓ Found AI Research</li>
                <li>✓ Found interaction flow</li>
                <li>✓ Started local app</li>
                <li>✓ Captured the feature</li>
                <li>✓ Generated the motion</li>
                <li>✓ 🎬 ai-research.mp4 — 1920×1080</li>
              </ul>
            </div>
          </div>
        </Reveal>

        {/* SECTION 5 — CINEMATIC MOTION */}
        <Reveal className="section">
          <div className="eyebrow">Not a screen recording</div>
          <h2 className="h2">Cinematic motion, automatically.</h2>
          <p className="lead">Clep turns raw browser interaction into a deliberate camera sequence.</p>
          <div className="grid4">
            {CINEMATIC_MOTION.map(([t, d]) => (
              <div className="card" key={t} style={{ padding: 20 }}>
                <div className="icon" style={{ width: 36, height: 36, fontSize: 17 }}>✓</div>
                <h3 style={{ fontSize: 21 }}>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* SECTION 6 — MICRO DEMOS */}
        <Reveal className="section" id="demos">
          <div className="eyebrow">Micro demos</div>
          <h2 className="h2">Perfect for tiny feature moments.</h2>
          <p className="lead">
            Don&apos;t make a 2-minute product tour. Make dozens of tiny clips.
          </p>
          <div className="card" style={{ marginTop: 16 }}>
            <pre style={{ margin: 0, fontFamily: "var(--mono)", fontSize: 13, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
              {MICRO_DEMOS}
            </pre>
          </div>
          <p className="lead" style={{ marginTop: 22, fontSize: 17 }}>Use them anywhere:</p>
          <div className="grid4">
            {USE_CASES.map(([t, d]) => (
              <div className="card" key={t} style={{ padding: 20 }}>
                <h3 style={{ fontSize: 21 }}>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* SECTION 7 — PLUGIN */}
        <Reveal className="section" id="plugin">
          <div className="eyebrow">One command, no SDK</div>
          <h2 className="h2">Install the plugin. Mark it. Run /clep:clep.</h2>
          <p className="lead">
            No npm package to install — there isn&apos;t one yet. Claude adds <span style={{ fontFamily: "var(--mono)" }}>data-clep</span> for
            you via the plugin, and plain HTML attributes work without any JS.
          </p>
          <div className="card" style={{ marginTop: 22 }}>
            <pre style={{ margin: 0, fontFamily: "var(--mono)", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
{`# 1. Add the marketplace, once
/plugin marketplace add techwarq/clep-plugin
/plugin install clep@clep-marketplace

# 2. Paste your API key (dashboard → API Keys)
export CLEP_API_KEY=clep_live_...

# 3. In your app repo, prompt Claude Code:
/clep:clep clip the ai-research feature — cinematic style`}
            </pre>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
              <a className="btn btn-lime btn-sm" href="/signup">Get your API key</a>
              <a className="btn btn-ghost btn-sm" href="/dashboard">Open dashboard →</a>
            </div>
          </div>
        </Reveal>

        {/* SECTION 8 — PRIVACY / LOCAL-FIRST */}
        <Reveal className="section">
          <div className="eyebrow">Local-first</div>
          <h2 className="h2">Your app stays local during capture.</h2>
          <p className="lead">Clep connects to your development server locally — it doesn&apos;t require you to deploy an unfinished feature just to make a demo.</p>
          <div className="card" style={{ marginTop: 16, maxWidth: 320, margin: "16px auto 0" }}>
            <pre style={{ margin: 0, fontFamily: "var(--mono)", fontSize: 13, lineHeight: 1.9, whiteSpace: "pre-wrap", textAlign: "center" }}>
{`localhost
   ↓
clep
   ↓
Playwright
   ↓
Browser capture`}
            </pre>
          </div>
          <p className="lead" style={{ marginTop: 22, fontSize: 19, textAlign: "center" }}>
            <strong>Capture locally. Render when you&apos;re ready.</strong>
          </p>
        </Reveal>

        {/* SECTION 9 — FOR EVERY FEATURE YOU SHIP */}
        <Reveal className="cta">
          <div>
            <h2>Ship the feature. Ship the demo.</h2>
            <p>Every new feature can have a corresponding clip. Your release workflow becomes:</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a className="btn btn-lime btn-lg" href="/signup">
                Try Clep Free
              </a>
            </div>
            <div className="trust" style={{ textAlign: "left" }}>No SDK • No credit card</div>
          </div>
          <div className="cta-mock">
            <pre style={{ margin: 0, fontFamily: "var(--mono)", fontSize: 13, lineHeight: 1.9, whiteSpace: "pre-wrap", textAlign: "center" }}>
              {RELEASE_WORKFLOW}
            </pre>
          </div>
        </Reveal>

        {/* FINAL CTA */}
        <Reveal className="cta">
          <div>
            <h2>Your next feature already knows how to demo itself.</h2>
            <p>Turn your UI into motion.</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a className="btn btn-lime btn-lg" href="/signup">
                Start Building
              </a>
            </div>
            <div className="trust" style={{ textAlign: "left" }}>
              No video editing timeline. No manual recording. Just your code and /clep:clep.
            </div>
          </div>
          <div className="cta-mock">
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>Take videos from the platform</div>
            <div style={{ fontSize: 12, color: "#55605b" }}>Scan a URL, pick a feature, hit Make Clip — download the MP4.</div>
            <div style={{ marginTop: 14 }}>
              <a className="btn btn-lime" href="/signup">Try Clep Free</a>
            </div>
          </div>
        </Reveal>

        <footer>
          <div className="foot">
            <span><strong>clep</strong> — Code it. Clip it. Ship it.</span>
          </div>
          <div className="foot" style={{ marginTop: 8 }}>
            <span>© 2026 Clep</span>
            <nav>
              <a href="/dashboard">Dashboard</a>
              <a href="#plugin">Privacy</a>
              <a href="#plugin">Security</a>
              <a href="#plugin">Terms</a>
            </nav>
          </div>
        </footer>
      </main>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
