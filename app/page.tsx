"use client";

import { useEffect, useState } from "react";
import ClepLogo from "../components/Logo";
import DemoWidget from "../components/DemoWidget";
import Reveal from "../components/Reveal";

const FEATURES = ["AI Research", "Document Upload", "AI Chat", "Checkout", "Dashboard", "Analytics"];

const HERO_FLOW = ["React code", '<Feature data-clip="research" />', "/clip research", "3.8s video"];

export default function Page() {
  const [toast, setToast] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [featIdx, setFeatIdx] = useState(0);
  const [flowIdx, setFlowIdx] = useState(0);

  const showToast = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2600);
  };

  useEffect(() => {
    const t = window.setInterval(() => setFeatIdx((i) => (i + 1) % FEATURES.length), 1500);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    const t = window.setInterval(() => setFlowIdx((i) => (i + 1) % HERO_FLOW.length), 1700);
    return () => window.clearInterval(t);
  }, []);

  const copyCmd = async () => {
    try {
      await navigator.clipboard.writeText("/clip");
    } catch {}
    setCopied(true);
    showToast("Copied — paste it anywhere you build");
    window.setTimeout(() => setCopied(false), 1600);
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
            <ClepLogo markSize={28} fontSize={23} />
          </a>
          <nav className="nav-links">
            <a href="#how">How it Works</a>
            <a href="#build">Claude Code</a>
            <a href="#examples">Examples</a>
            <a href="#pricing">Pricing</a>
          </nav>
          <div className="nav-actions">
            <a href="/login" className="login-link">
              Log in
            </a>
            <a href="/signup" className="btn btn-lime btn-sm">
              Try Clep Free <span aria-hidden>→</span>
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
            <a onClick={() => navGo("build")}>Claude Code</a>
            <a onClick={() => navGo("examples")}>Examples</a>
            <a onClick={() => navGo("pricing")}>Pricing</a>
            <a href="/dashboard">Dashboard</a>
            <a href="/login">Log in</a>
            <a href="/signup" className="btn btn-lime">
              Try Clep Free →
            </a>
          </div>
        )}
      </div>

      <main id="top" className="wrap">
        {/* HERO */}
        <section className="hero">
          <p className="hero-eyebrow hero-anim d1">Your product knows how it works.</p>
          <h1 className="hero-anim d2">Turn it into video.</h1>
          <p className="sub hero-anim d3">
            Create product videos, walkthroughs, and UI mockups directly from your code.
          </p>
          <div className="hero-anim d4">
            <button className="cmd-pill" onClick={copyCmd} aria-label="Copy the /clip command">
              <span className="cmd-dollar">$</span>
              <code>/clip</code>
              <span className="cmd-copy" aria-hidden>
                {copied ? (
                  "✓"
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="12" height="12" rx="2.5" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </span>
            </button>
          </div>
          <div className="hero-cta hero-anim d5">
            <a className="btn btn-lime btn-lg" href="/signup">
              Try Clep Free <span aria-hidden>→</span>
            </a>
          </div>
        </section>

        {/* HERO VISUAL */}
        <section className="hero-anim d6">
          <div className="flow-strip" aria-hidden>
            {HERO_FLOW.map((s, i) => (
              <span key={s} className="flow-group">
                <span className={`flow-node ${i === flowIdx ? "on" : i < flowIdx ? "done" : ""}`}>
                  {i < flowIdx ? "✓ " : ""}{s}
                </span>
                {i < HERO_FLOW.length - 1 && <span className="flow-arrow">↓</span>}
              </span>
            ))}
          </div>
          <DemoWidget onToast={showToast} />
        </section>

        {/* ONE COMMAND */}
        <Reveal className="section roomy">
          <div className="section-head">
            <h2 className="h2">One command. Your whole product.</h2>
            <div className="giant-cmd">/clip</div>
            <p className="detect-line">
              <span className="detect-check">✓</span>{" "}
              <span key={featIdx} className="detect-word">
                {FEATURES[featIdx]}
              </span>{" "}
              <span className="detect-muted">detected</span>
            </p>
            <p className="detect-sub">
              <strong>Clep finds the feature.</strong>
              <strong>Runs it.</strong>
              <strong>Turns it into a video.</strong>
            </p>
          </div>
        </Reveal>

        {/* FROM CODE TO CLIP */}
        <Reveal className="section roomy" id="how">
          <div className="section-head">
            <div className="eyebrow">How it works</div>
            <h2 className="h2">From code to clip.</h2>
          </div>
          <div className="steps">
            <div className="step">
              <span className="step-num">01</span>
              <h3>Mark</h3>
              <p>Tag the feature in your code.</p>
              <code className="kbd">data-clip=&quot;ai-research&quot;</code>
            </div>
            <div className="step">
              <span className="step-num">02</span>
              <h3>Run</h3>
              <p>Ask for the clip.</p>
              <code className="kbd">/clip ai-research</code>
            </div>
            <div className="step">
              <span className="step-num">03</span>
              <h3>Export</h3>
              <p>Get a finished video file.</p>
              <code className="kbd">3.8s · 1080p · 60fps</code>
            </div>
          </div>
        </Reveal>

        {/* NOT A SCREEN RECORDING */}
        <Reveal className="section roomy">
          <div className="section-head">
            <h2 className="h2">Not a screen recording.</h2>
          </div>
          <div className="split-duo">
            <div className="trad-card">
              <div className="split-head">Traditional</div>
              <div className="vflow">
                {["Record", "Edit", "Zoom", "Crop", "Export"].map((s) => (
                  <span key={s} className="vflow-group">
                    <span className="vflow-pill muted">{s}</span>
                    <span className="vflow-arrow" aria-hidden>↓</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="clep-card">
              <div className="split-head">Clep</div>
              <div className="vflow">
                {["Code", "/clip", "Video"].map((s) => (
                  <span key={s} className="vflow-group">
                    <span className="vflow-pill lime">{s}</span>
                    <span className="vflow-arrow" aria-hidden>↓</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <p className="split-foot">
            <strong>Your code already knows what the feature does.</strong>
          </p>
        </Reveal>

        {/* THREE WAYS TO SHOW */}
        <Reveal className="section roomy" id="examples">
          <div className="section-head">
            <h2 className="h2">Three ways to show your product.</h2>
          </div>
          <div className="way-grid">
            <div className="card way-card">
              <div className="loop-visual">
                <span className="lv-play">▶</span>
                <span className="lv-track">
                  <span className="lv-fill" />
                </span>
              </div>
              <h3>Product Videos</h3>
              <p>Show a feature in action.</p>
            </div>
            <div className="card way-card">
              <div className="loop-visual">
                <ul className="lv-steps">
                  <li>Sign up</li>
                  <li>Invite team</li>
                  <li>Ship demo</li>
                </ul>
              </div>
              <h3>Walkthroughs</h3>
              <p>Turn workflows into demos.</p>
            </div>
            <div className="card way-card">
              <div className="loop-visual">
                <div className="lv-zoom">
                  <span className="lv-bar" />
                  <span className="lv-bar short" />
                  <span className="lv-btn" />
                </div>
              </div>
              <h3>UI Mockups</h3>
              <p>Create cinematic UI motion.</p>
            </div>
          </div>
        </Reveal>

        {/* WHEREVER YOU BUILD */}
        <Reveal className="section roomy" id="build">
          <div className="section-head">
            <div className="eyebrow">Connect</div>
            <h2 className="h2">Use Clep wherever you build.</h2>
          </div>
          <div className="connect-grid">
            <div className="card connect-card">
              <h3>Claude Code</h3>
              <div className="code-window mini">
                <pre>/clip</pre>
                <button
                  className="copy-btn"
                  onClick={() => {
                    navigator.clipboard?.writeText("/clip").catch(() => {});
                    showToast("Copied — paste it in Claude Code");
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="card connect-card">
              <h3>CLI</h3>
              <div className="code-window mini">
                <pre>clep clip</pre>
                <button
                  className="copy-btn"
                  onClick={() => {
                    navigator.clipboard?.writeText("clep clip").catch(() => {});
                    showToast("Copied — run it in your terminal");
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="card connect-card">
              <h3>Dashboard</h3>
              <p>Select a feature → Create clip.</p>
              <a className="btn btn-lime btn-sm" href="/dashboard">
                Open dashboard →
              </a>
            </div>
          </div>
        </Reveal>

        {/* PRICING */}
        <Reveal className="section roomy" id="pricing">
          <div className="section-head">
            <h2 className="h2">Start creating for free.</h2>
          </div>
          <div className="price-grid">
            <div className="price-card">
              <h3>Free</h3>
              <div className="p-amount">$0</div>
              <ul>
                <li>5 clips / month</li>
                <li>1080p exports</li>
                <li>All three kinds</li>
              </ul>
              <a className="btn btn-ghost price-btn" href="/signup">
                Start Free
              </a>
            </div>
            <div className="price-card featured">
              <h3>Pro</h3>
              <div className="p-amount">
                $9 <span>/ month</span>
              </div>
              <ul>
                <li>50 clips / month</li>
                <li>1080p60 exports</li>
                <li>Priority rendering</li>
              </ul>
              <a className="btn btn-lime price-btn" href="/dashboard?view=billing">
                Get Pro
              </a>
            </div>
            <div className="price-card">
              <h3>Studio</h3>
              <div className="p-amount">
                $19 <span>/ month</span>
              </div>
              <ul>
                <li>150 clips / month</li>
                <li>Everything in Pro</li>
                <li>Team workspace</li>
              </ul>
              <a className="btn btn-ghost price-btn" href="/dashboard?view=billing">
                Get Studio
              </a>
            </div>
          </div>
        </Reveal>

        {/* FINAL CTA */}
        <Reveal className="final-center">
          <h2>Your product knows how to demo itself.</h2>
          <p>Turn it into video with Clep.</p>
          <div>
            <button className="cmd-pill" onClick={copyCmd} aria-label="Copy the /clip command">
              <span className="cmd-dollar">$</span>
              <code>/clip</code>
            </button>
          </div>
          <div className="hero-cta" style={{ marginTop: 22 }}>
            <a className="btn btn-lime btn-lg" href="/signup">
              Try Clep Free <span aria-hidden>→</span>
            </a>
          </div>
        </Reveal>

        <footer>
          <div className="foot-grid foot-slim">
            <div>
              <ClepLogo markSize={24} fontSize={19} />
              <p className="foot-tag">Turn it into video.</p>
            </div>
            <nav>
              <b>Product</b>
              <a href="#how">How it works</a>
              <a href="#examples">Examples</a>
              <a href="#pricing">Pricing</a>
            </nav>
            <nav>
              <b>Build</b>
              <a href="#build">Claude Code</a>
              <a href="#build">CLI</a>
              <a href="/dashboard">Dashboard</a>
            </nav>
            <nav>
              <b>Account</b>
              <a href="/login">Log in</a>
              <a href="/signup">Sign up</a>
            </nav>
          </div>
          <div className="foot">
            <span>© 2026 Clep</span>
            <span>Code it. Clip it. Ship it.</span>
          </div>
        </footer>
      </main>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
