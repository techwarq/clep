"use client";

import { useEffect, useRef, useState } from "react";
import ClepLogo from "../components/Logo";
import Reveal from "../components/Reveal";

const BETA = process.env.NEXT_PUBLIC_IN_BETA === "true";
const SIGNUP_HREF = BETA ? "/invite" : "/signup";
const SIGNUP_LABEL = BETA ? "Ask for invite" : "Start free";

const ROTATE = ["every single day.", "in minutes, not weeks.", "without an agency."];

const TEMPLATES = [
  { id: "feature-film", name: "Feature Film", tag: "SaaS launches", prompt: "Launch video for our new export feature", desc: "Your real product floating on a gradient — the camera follows every click." },
  { id: "agent-run", name: "Agent Run", tag: "AI agents", prompt: "Show our agent researching 50 companies", desc: "A prompt types itself, the agent works the list live, the number lands." },
  { id: "teaser", name: "Teaser", tag: "Coming soon posts", prompt: "Hype teaser for Tuesday's launch", desc: "Kinetic type on the beat — the announcement before anyone sees the UI." },
  { id: "editorial", name: "Editorial", tag: "Thoughtful brands", prompt: "Calm, editorial story about why we built it", desc: "Paper, serif headlines, italic accents — the product as proof." },
  { id: "phone-chat", name: "Phone Chat", tag: "Consumer apps", prompt: "Our assistant fixing a trip over text", desc: "A bright phone, a real conversation — you just approve." },
];

const ARC: [string, string][] = [
  ["editorial", "a-l2"],
  ["agent-run", "a-l1"],
  ["feature-film", "a-c"],
  ["phone-chat", "a-r1"],
  ["teaser", "a-r2"],
];

const CONTROLS = [
  ["Fonts", "8 pairings or your own"],
  ["Colors", "pulled from your site"],
  ["Backdrops", "mesh · pastel · paper · grid · spotlight"],
  ["Pace", "calm · normal · snappy"],
  ["Text motion", "mask · slam · scramble · blur"],
  ["Transitions", "cut · blur · whip · zoom · flash"],
  ["Camera", "still → dynamic push-ins"],
  ["Format", "16:9 · 9:16 · 1:1 · 4:5"],
];

function useTyped(text: string, run: boolean, speed = 38) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    if (!run) return;
    const t = window.setInterval(() => setN((k) => (k >= text.length ? k : k + 1)), speed);
    return () => window.clearInterval(t);
  }, [text, run, speed]);
  return text.slice(0, n);
}

function HeroStage() {
  const [idx, setIdx] = useState(0);
  const [reduced, setReduced] = useState(false);
  const vids = useRef<(HTMLVideoElement | null)[]>([]);
  const t = TEMPLATES[idx];
  const typed = useTyped(t.prompt, !reduced);

  useEffect(() => {
    setReduced(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
  }, []);

  useEffect(() => {
    vids.current.forEach((v, i) => {
      if (!v) return;
      if (i === idx) {
        v.currentTime = 0;
        v.play().catch(() => {});
      } else v.pause();
    });
  }, [idx]);

  return (
    <div className="lx-stage-wrap">
      <div className="lx-stage">
        {TEMPLATES.map((tp, i) => (
          <video
            key={tp.id}
            ref={(el) => {
              vids.current[i] = el;
            }}
            className={i === idx ? "on" : ""}
            src={`/templates/${tp.id}.mp4`}
            poster={`/templates/${tp.id}.jpg`}
            muted
            playsInline
            preload={i === 0 ? "auto" : "metadata"}
            autoPlay={i === 0}
            onEnded={() => setIdx((k) => (k + 1) % TEMPLATES.length)}
          />
        ))}
        <div className="lx-prompt" aria-hidden>
          <span className="lx-prompt-ava">✦</span>
          <span className="lx-prompt-text">
            {reduced ? t.prompt : typed}
            <i className="lx-caret" />
          </span>
          <span className="lx-prompt-go">→</span>
        </div>
      </div>
      <div className="lx-stage-tabs" role="tablist" aria-label="Templates">
        {TEMPLATES.map((tp, i) => (
          <button key={tp.id} role="tab" aria-selected={i === idx} className={i === idx ? "on" : ""} onClick={() => setIdx(i)}>
            {tp.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  const [toast, setToast] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rot, setRot] = useState(0);

  const showToast = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2600);
  };

  useEffect(() => {
    const t = window.setInterval(() => setRot((i) => (i + 1) % ROTATE.length), 2600);
    return () => window.clearInterval(t);
  }, []);

  const INSTALL_CMDS = `/plugin marketplace add techwarq/clep-plugin
/plugin install clep@clep-marketplace`;

  const copyCmd = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_CMDS);
    } catch {}
    setCopied(true);
    showToast("Copied — Clep Capture is in early access");
    window.setTimeout(() => setCopied(false), 1600);
  };

  const navGo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="lp">
      {/* HERO — sky card with nav inside */}
      <header id="top" className="sky">
        <div className="sky-bg" aria-hidden />
        <div className="sky-nav">
          <a className="brand" href="#top" aria-label="clep — home">
            <ClepLogo markSize={26} fontSize={21} color="#fff" />
          </a>
          <nav className="sky-links">
            <a href="#how">How it works</a>
            <a href="#templates">Templates</a>
            <a href="#capture">Capture</a>
            <a href="#pricing">Pricing</a>
          </nav>
          <div className="sky-actions">
            {!BETA && (
              <a href="/login" className="sky-login">
                Log in
              </a>
            )}
            <a href={SIGNUP_HREF} className="pill-btn pill-lime pill-sm">
              {SIGNUP_LABEL}
            </a>
            <button
              className="sky-burger"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
          {menuOpen && (
            <div className="sky-menu">
              <a onClick={() => navGo("how")}>How it works</a>
              <a onClick={() => navGo("templates")}>Templates</a>
              <a onClick={() => navGo("capture")}>Capture</a>
              <a onClick={() => navGo("pricing")}>Pricing</a>
              <a href="/dashboard">Dashboard</a>
              {!BETA && <a href="/login">Log in</a>}
            </div>
          )}
        </div>

        <section className="sky-hero">
          <h1 className="sky-title hero-anim d1">
            Launch your product
            <br />
            <span className="lx-rot" aria-live="polite">
              <em key={rot} className="lx-rot-word">
                {ROTATE[rot]}
              </em>
            </span>
          </h1>
          <p className="sky-sub hero-anim d2">
            The fastest, cheapest way to make launch videos. Paste your site, describe the video, and get a
            studio-grade motion piece in your brand.
          </p>
          <div className="sky-cta hero-anim d3">
            <a className="pill-btn pill-glass" href="#templates">
              See templates
            </a>
            <a className="pill-btn pill-lime" href={SIGNUP_HREF}>
              {SIGNUP_LABEL}
              <i className="pill-ico" aria-hidden>
                ↗
              </i>
            </a>
          </div>
        </section>

        <div className="arc hero-anim d4" aria-hidden>
          {ARC.map(([id, pos]) => {
            const tp = TEMPLATES.find((x) => x.id === id)!;
            return (
              <div key={id} className={`arc-card ${pos}`}>
                <video src={`/templates/${id}.mp4`} poster={`/templates/${id}.jpg`} muted loop autoPlay playsInline preload="metadata" />
                {pos === "a-c" ? (
                  <span className="arc-make">
                    <i>+</i> Make a video
                  </span>
                ) : (
                  <span className="arc-tag">{tp.name}</span>
                )}
              </div>
            );
          })}
        </div>

        <p className="sky-proof hero-anim d5">
          <span>No editor</span>
          <span>No After Effects</span>
          <span>Free to start</span>
        </p>
      </header>

      {/* TEMPLATE STRIP */}
      <div className="strip" aria-hidden>
        <div className="strip-track">
          {[...TEMPLATES, ...TEMPLATES, ...TEMPLATES, ...TEMPLATES].map((t, i) => (
            <span key={i} className="strip-item">
              <i>✦</i>
              {t.name}
            </span>
          ))}
        </div>
      </div>

      <main className="wrap">
        {/* HOW — bento */}
        <Reveal className="section roomy" id="how">
          <div className="section-head">
            <div className="eyebrow">How it works</div>
            <h2 className="h2">
              From your site <span className="chip-ico blue">⌘</span> to a launch video{" "}
              <span className="chip-ico lime">▶</span> <em className="lx-em">in minutes, not weeks.</em>
            </h2>
          </div>
          <div className="bento">
            <div className="bn bn-img">
              <video className="bn-vid" src="/templates/feature-film.mp4" poster="/templates/feature-film.jpg" muted loop autoPlay playsInline preload="metadata" aria-hidden />
              <span className="bn-url">yourproduct.com</span>
              <div className="bn-img-card">
                <span className="bn-k">01 · Paste your site</span>
                <b className="bn-big">Your brand</b>
                <p>We pull your real colors, fonts, logo, copy and screenshots.</p>
              </div>
            </div>
            <div className="bn bn-grey">
              <span className="bn-k">02 · Describe it</span>
              <b className="bn-big">Just say it.</b>
              <div className="bn-chat">
                <div className="u">Punchy teaser for Tuesday&apos;s launch</div>
                <div className="b">
                  <span className="ms-ava">✦</span>
                  On it — kinetic type, snappy pace, 9:16.
                </div>
              </div>
              <p>Chat what you want — or pick a template. Tweak anything.</p>
            </div>
            <div className="bn-col">
              <div className="bn bn-lime">
                <span className="bn-k">03 · Ship it</span>
                <b className="bn-big">1080p MP4</b>
                <p>Render a finished video for X, LinkedIn, TikTok or your site.</p>
              </div>
              <div className="bn bn-dark">
                <span className="bn-k">Formats · 16:9 · 9:16 · 1:1 · 4:5</span>
                <b className="bn-big">4</b>
              </div>
            </div>
          </div>
        </Reveal>

        {/* TEMPLATES */}
        <Reveal className="section roomy" id="templates">
          <div className="section-head">
            <div className="eyebrow">Templates</div>
            <h2 className="h2">
              Looks that actually ship. <em className="lx-em">Your brand drops straight in.</em>
            </h2>
            <p className="lead">Directed from the launch videos top startups post every week.</p>
            <a className="pill-btn pill-dark" href={SIGNUP_HREF} style={{ marginTop: 20 }}>
              {SIGNUP_LABEL}
              <i className="pill-ico" aria-hidden>
                ↗
              </i>
            </a>
          </div>
          <HeroStage />
          <div className="tray">
            {TEMPLATES.map((t, i) => (
              <Reveal key={t.id} delay={i * 70} className="tc">
                <div
                  className="tc-media"
                  onMouseEnter={(e) => e.currentTarget.querySelector("video")?.play().catch(() => {})}
                  onMouseLeave={(e) => {
                    const v = e.currentTarget.querySelector("video");
                    if (v) {
                      v.pause();
                      v.currentTime = 0;
                    }
                  }}
                >
                  <video src={`/templates/${t.id}.mp4`} poster={`/templates/${t.id}.jpg`} muted loop playsInline preload="none" />
                </div>
                <div className="tc-row">
                  <span className="ico-sq">✦</span>
                  <span className="tc-tag">{t.tag}</span>
                </div>
                <h3>{t.name}</h3>
                <p>{t.desc}</p>
              </Reveal>
            ))}
            <Reveal delay={5 * 70} className="tc tc-more">
              <span className="ico-sq dark">＋</span>
              <h3>More every week</h3>
              <p>Or just describe the video — the director picks the look.</p>
            </Reveal>
          </div>
        </Reveal>

        {/* EDITABLE */}
        <Reveal className="section roomy">
          <div className="section-head">
            <div className="eyebrow">Everything is editable</div>
            <h2 className="h2">
              Tell it like a director. <em className="lx-em">It edits one line.</em>
            </h2>
            <p className="lead">Change copy, fonts or colors in the editor — or just say it. No re-doing the whole video.</p>
          </div>
          <div className="edit-grid">
            <div className="edit-chat" aria-hidden>
              <span className="bn-k">Director chat</span>
              <div className="lx-cm-msg user">Make it calmer and vertical for TikTok</div>
              <div className="lx-cm-msg bot">
                <span className="ms-ava">✦</span>
                Done — slowed the pace, softer transitions, now 9:16.
              </div>
              <div className="lx-cm-msg user">Change the button to “Join the beta”</div>
              <div className="lx-cm-msg bot">
                <span className="ms-ava">✦</span>
                Updated the end card.
              </div>
              <div className="lx-cm-input">
                Tell me what to change…<span className="lx-prompt-go">→</span>
              </div>
            </div>
            <div className="edit-tiles">
              {CONTROLS.map(([k, v], i) => (
                <div key={k} className={`et ${i === 1 ? "lime" : i === 7 ? "dark" : ""}`}>
                  <span className="ico-sq">{["Aa", "◐", "▦", "⏱", "T", "⇄", "◎", "▭"][i]}</span>
                  <b>{k}</b>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* COMPARE */}
        <Reveal className="section roomy">
          <div className="section-head">
            <div className="eyebrow">Why Clep</div>
            <h2 className="h2">
              Not an agency timeline. <em className="lx-em">Ship with every release.</em>
            </h2>
          </div>
          <div className="cmp">
            <div className="cmp-card">
              <span className="bn-k">The usual way</span>
              <b className="bn-big">Weeks</b>
              <div className="cmp-flow">
                {["Brief", "Storyboard", "Animate", "Revise", "Export"].map((s, i) => (
                  <span key={s}>
                    {i > 0 && <i aria-hidden>→</i>}
                    <em>{s}</em>
                  </span>
                ))}
              </div>
            </div>
            <div className="cmp-card dark">
              <span className="bn-k">Clep</span>
              <b className="bn-big">Minutes</b>
              <div className="cmp-flow">
                {["Paste your site", "Describe it", "Video"].map((s, i) => (
                  <span key={s}>
                    {i > 0 && <i aria-hidden>→</i>}
                    <em>{s}</em>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* CAPTURE — COMING SOON */}
        <Reveal className="section roomy" id="capture">
          <div className="lx-capture">
            <div className="lx-capture-copy">
              <span className="cap-soon">Coming soon</span>
              <h2>
                Clep Capture — <em>straight from your code.</em>
              </h2>
              <p>
                A Claude Code plugin that finds a feature in your codebase, drives the real UI in a browser — cursor and
                all — and sends the recording to Motion. One command: <code>/clep</code>.
              </p>
              <div className="lx-capture-steps">
                <span>
                  <b>01</b> Finds the feature
                </span>
                <span>
                  <b>02</b> Runs it live
                </span>
                <span>
                  <b>03</b> Ships the video
                </span>
              </div>
              <a className="pill-btn pill-lime" href={SIGNUP_HREF}>
                Get early access
                <i className="pill-ico" aria-hidden>
                  ↗
                </i>
              </a>
            </div>
            <div
              className="install-box lx-capture-box"
              role="button"
              tabIndex={0}
              onClick={copyCmd}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") copyCmd();
              }}
              aria-label="Copy plugin install commands"
              title="Click to copy"
            >
              <div className="install-lines">
                <div className="install-line">
                  <span className="cmd-dollar">$</span>
                  <code>/plugin marketplace add techwarq/clep-plugin</code>
                </div>
                <div className="install-line">
                  <span className="cmd-dollar">$</span>
                  <code>/plugin install clep@clep-marketplace</code>
                </div>
                <div className="install-line">
                  <span className="cmd-dollar">$</span>
                  <code>/clep make a clip of the signup flow</code>
                </div>
              </div>
              <span className="install-copy" aria-hidden>
                {copied ? "✓" : "⧉"}
              </span>
            </div>
          </div>
        </Reveal>

        {/* PRICING */}
        <Reveal className="section roomy" id="pricing">
          <div className="section-head">
            <div className="eyebrow">Pricing</div>
            <h2 className="h2">
              Start creating for free. <em className="lx-em">Upgrade when you ship more.</em>
            </h2>
          </div>
          <div className="pc-grid">
            <div className="pc">
              <span className="bn-k">Free</span>
              <b className="bn-big">$0</b>
              <ul>
                <li>5 videos / month</li>
                <li>1080p exports</li>
                <li>All templates</li>
              </ul>
              <a className="pill-btn pill-dark" href={SIGNUP_HREF}>
                {BETA ? "Ask for invite" : "Start free"}
              </a>
            </div>
            <div className="pc dark">
              <span className="bn-k">
                Pro <i className="pc-pop">Popular</i>
              </span>
              <b className="bn-big">
                $9<small>/ month</small>
              </b>
              <ul>
                <li>50 videos / month</li>
                <li>1080p60 exports</li>
                <li>Priority rendering</li>
              </ul>
              <a className="pill-btn pill-lime" href={BETA ? SIGNUP_HREF : "/dashboard?view=billing"}>
                {BETA ? "Ask for invite" : "Get Pro"}
              </a>
            </div>
            <div className="pc">
              <span className="bn-k">Studio</span>
              <b className="bn-big">
                $19<small>/ month</small>
              </b>
              <ul>
                <li>150 videos / month</li>
                <li>Everything in Pro</li>
                <li>Team workspace</li>
              </ul>
              <a className="pill-btn pill-dark" href={BETA ? SIGNUP_HREF : "/dashboard?view=billing"}>
                {BETA ? "Ask for invite" : "Get Studio"}
              </a>
            </div>
          </div>
        </Reveal>

        {/* FINAL CTA */}
        <Reveal className="final-dark">
          <div className="eyebrow">Get started</div>
          <h2>
            Ship a launch video <em>today.</em>
          </h2>
          <p>Paste your site. Clep does the motion.</p>
          <a className="pill-btn pill-lime" href={SIGNUP_HREF}>
            {SIGNUP_LABEL}
            <i className="pill-ico" aria-hidden>
              ↗
            </i>
          </a>
        </Reveal>

        <footer className="lp-foot">
          <div className="lp-foot-grid">
            <div>
              <ClepLogo markSize={24} fontSize={19} />
              <p className="foot-tag">Launch every day.</p>
            </div>
            <nav>
              <b>Product</b>
              <a href="#how">How it works</a>
              <a href="#templates">Templates</a>
              <a href="#pricing">Pricing</a>
            </nav>
            <nav>
              <b>Build</b>
              <a href="/dashboard">Dashboard</a>
              <a href="#capture">Clep Capture</a>
            </nav>
            <nav>
              <b>Account</b>
              {BETA ? (
                <a href="/invite">Ask for invite</a>
              ) : (
                <>
                  <a href="/login">Log in</a>
                  <a href="/signup">Sign up</a>
                </>
              )}
            </nav>
          </div>
          <div className="lp-foot-mark" aria-hidden>
            clep
          </div>
          <div className="lp-foot-bar">
            <span>© 2026 Clep</span>
            <span>Describe it. Render it. Ship it.</span>
          </div>
        </footer>
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
