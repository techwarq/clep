import "./landing.css";
import CopyCommand from "../components/CopyCommand";
import HeroFilm from "../components/HeroFilm";
import InViewVideo from "../components/InViewVideo";
import ClepLogo from "../components/Logo";
import { EFFECTS, LAUNCH_VIDEO, PACING, SETUP_COMMAND, SKILL_URL } from "../lib/landing";

const BETA = process.env.NEXT_PUBLIC_IN_BETA === "true";
const SIGNUP_LABEL = BETA ? "Ask for invite" : "Get API key";

const STEPS = [
  {
    name: "Record",
    call: "clep record",
    text: "Clep's recorder drives your app in a real browser. Localhost, staging, behind a login.",
  },
  {
    name: "Edit",
    call: "clep edit",
    text: "Our engine cuts it: a camera that follows every click, cursor, speed ramps, your backdrop.",
  },
  {
    name: "Ship",
    call: "clip ready",
    text: "The MP4 lands in your repo. 16:9, 9:16, 1:1 or the exact size of your landing card.",
  },
];

const RUN = [
  ["›", "make a 10s demo of the signup flow"],
  ["›", "record.py --url localhost:3000 --name signup"],
  ["→", "recorded 11.0s at 2x · uploading 42 MB"],
  ["→", "editing · camera, cursor, pacing"],
  ["✓", "clip ready: clep/signup.mp4"],
];

const WAYS = [
  { name: "Skill", text: "One line in your agent's chat.", code: SETUP_COMMAND },
  { name: "Local recorder", text: "Record localhost, render on Clep.", code: "record.py --url http://localhost:3000" },
  { name: "API", text: "Public pages and mockups, no install.", code: "POST /api/clips { prompt }" },
];

const FAQ = [
  {
    q: "Can it record my localhost?",
    a: "Yes. The recorder runs on your machine, so it sees whatever your browser sees. Only the capture is uploaded; the edit and render happen on Clep.",
  },
  {
    q: "Will my agent write its own recording code?",
    a: "No. The skill tells it to run Clep's recorder and engine as shipped. No hand-rolled Playwright, no ffmpeg, no fake mockups of your app.",
  },
  {
    q: "Which agents work?",
    a: "Any agent that can read a URL and run a shell command: Claude Code, Cursor, Codex, Windsurf, and your own.",
  },
  {
    q: "Do I need to change my app?",
    a: "Not for walkthroughs. Feature demos read a few data-clep attributes, and your agent adds them for you.",
  },
  {
    q: "Do I pick the zooms and speeds?",
    a: "No. Clep reads the recording: clicks get a push-in, typing and loading are sped up, dead air is cut. You can still ask for calmer or more dynamic.",
  },
  {
    q: "What does it cost?",
    a: "Free to start. Pro is $12 a month and Studio $29 a month when you post more.",
  },
];

export default function Page() {
  return (
    <div className="home">
      <header className="home-nav">
        <a href="#top" aria-label="clep — home">
          <ClepLogo height={24} />
        </a>
        <nav className="home-links">
          <a href="#work">Work</a>
          <a href="#how">How it works</a>
          <a href={SKILL_URL}>Docs</a>
        </nav>
        <div className="home-actions">
          {!BETA && <a href="/login" className="home-login">Enter key</a>}
          <a href="/invite" className="get-key">{SIGNUP_LABEL}</a>
        </div>
      </header>

      <section id="top" className="intro">
        <p className="kicker">For Claude Code, Cursor, Codex &amp; every agent</p>
        <h1 className="display">
          Show your product
          <br />
          <span className="ring">every<RingMark /></span> day.
        </h1>
        <p className="intro-sub">
          Your agent records it, Clep cuts it.
          <br />
          Walkthroughs, feature demos &amp; mockups.
        </p>
        <div className="give">
          <p className="give-label">Give this to your agent</p>
          <CopyCommand command={SETUP_COMMAND} />
          <p className="give-note">and let it take it from there.</p>
        </div>
      </section>

      <section className="stage">
        <span className="stage-label left">Scroll for the cut</span>
        <HeroFilm />
        <span className="stage-label right">Made with Clep</span>
      </section>

      <section id="how" className="block">
        <h2 className="block-title">Tell your agent what to film. It runs Clep.</h2>
        <div className="how">
          <ol className="how-steps">
            {STEPS.map((step, i) => (
              <li key={step.name} className="how-step">
                <span className="how-num">0{i + 1}</span>
                <div>
                  <h3>{step.name} <code>{step.call}</code></h3>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="term" aria-label="An agent making a clip">
            <div className="term-bar"><i /><i /><i /><span>~/acme · agent</span></div>
            {RUN.map(([mark, line]) => (
              <p key={line} className={mark === "✓" ? "term-ok" : ""}>
                <span>{mark}</span> {line}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="block launch">
        <div className="block-head">
          <h2 className="block-title">{LAUNCH_VIDEO.title}</h2>
          <p className="block-note">{LAUNCH_VIDEO.line}</p>
        </div>
        <InViewVideo slug={LAUNCH_VIDEO.slug} className="tile-video launch-video" />
      </section>

      <section id="work" className="block">
        <div className="block-head">
          <h2 className="block-title">Clep picks the effect.</h2>
          <p className="block-note">It reads the page and the recording, then decides what goes where.</p>
        </div>
        <div className="pacing" aria-label="How Clep paces a recording">
          {PACING.map(([moment, speed]) => (
            <span key={moment}><strong>{speed}</strong> {moment}</span>
          ))}
        </div>
        <div className="demos">
          {EFFECTS.map((effect) => (
            <article key={effect.slug} className="tile">
              <InViewVideo slug={effect.slug} className="tile-video" />
              <p className="tile-detected">Saw: {effect.detected}</p>
              <h3>{effect.title}</h3>
              <p>{effect.line}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="block">
        <h2 className="block-title">Three ways to connect.</h2>
        <p className="block-note">Same engine, same key, whichever your agent speaks.</p>
        <div className="ways">
          {WAYS.map((way) => (
            <div key={way.name} className="way">
              <h3>{way.name}</h3>
              <p>{way.text}</p>
              <code>{way.code}</code>
            </div>
          ))}
        </div>
      </section>

      <section className="block questions">
        <h2 className="block-title">Common questions.</h2>
        {FAQ.map((item) => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </section>

      <section className="closer">
        <h2 className="display small">
          Ship it. <span className="accent">We&apos;ll film it.</span>
        </h2>
        <CopyCommand command={SETUP_COMMAND} />
        <a href="/invite" className="get-key">{SIGNUP_LABEL}</a>
      </section>

      <footer className="home-foot">
        <ClepLogo height={20} />
        <span>© 2026 clep</span>
        <nav>
          <a href={SKILL_URL}>Skill</a>
          <a href="/login">Enter key</a>
          <a href="/dashboard">Dashboard</a>
        </nav>
      </footer>
    </div>
  );
}

function RingMark() {
  return (
    <svg className="ring-mark" viewBox="0 -14 200 134" aria-hidden preserveAspectRatio="none">
      <path d="M18 70 C 14 30, 80 12, 128 18 C 176 24, 196 52, 182 80 C 166 108, 92 114, 50 102 C 20 94, 8 76, 24 56" />
      <path d="M128 4 L 128 -10" />
      <path d="M150 6 L 160 -6" />
      <path d="M170 16 L 184 6" />
    </svg>
  );
}
