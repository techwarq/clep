import "./landing.css";
import HeroFilm from "../components/HeroFilm";
import HowRun from "../components/HowRun";
import InViewVideo from "../components/InViewVideo";
import PixelGrid from "../components/PixelGrid";
import StickyNav from "../components/StickyNav";
import Waitlist from "../components/Waitlist";
import { EFFECTS, LAUNCH_VIDEO, PACING, SKILL_URL } from "../lib/landing";
import { PLANS } from "../lib/pricing";

const FOOTER_LINKS = [
  { title: "Product", links: [["Work", "#work"], ["How It Works", "#how"], ["Pricing", "/pricing"]] },
  { title: "Resources", links: [["Docs", SKILL_URL], ["Common Questions", "#faq"]] },
  { title: "Account", links: [["Reserve Your Spot", "/reserve"], ["Login", "/login"]] },
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
    a: "Free to start, with every effect and format. Pro is $19 a month and Studio $39 a month when you post more.",
  },
];

export default function Page() {
  return (
    <div className="home">
      <div className="hero-bg" aria-hidden>
        <PixelGrid />
      </div>

      <StickyNav>
        <a href="#top" aria-label="Clep home" className="home-logo">
          <img src="/brand/clep-logo-cream.png" alt="Clep" width={110} height={43} />
        </a>
        <nav className="home-links">
          <a href="#work">Work</a>
          <a href="#how">How It Works</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <div className="home-actions">
          <a href="/login" className="btn-line">Login</a>
          <a href="/reserve" className="btn-pink">Reserve Spot</a>
        </div>
      </StickyNav>

      <section id="top" className="intro">
        <p className="works-with">
          Works with
          <span className="agents" aria-label="Claude Code, Cursor, Codex">
            <AgentIcons />
          </span>
          &amp; Every Available Agent
        </p>
        <h1 className="display">
          Turn every <span className="pink">shipped feature</span>
          <br />
          into a
          <img src="/brand/hero-cursor.png" alt="" aria-hidden className="hero-cursor" />
          <span className="pink">video.</span>
        </h1>
        <p className="intro-sub">
          Your agent records it, Clep cuts it.
          <br />
          Walkthroughs, feature demos &amp; mockups.
        </p>
        <div className="give">
          <a href="/reserve" className="btn-soft give-cta">Join the Private Beta</a>
          <p className="give-note">Be the first in. We&apos;ll email you an access code.</p>
        </div>
      </section>

      <section className="stage demo">
        <HeroFilm src="/clep-demo.mp4" />
      </section>

      <section id="how" className="block">
        <h2 className="block-title">Tell your agent what to film. <span className="pink">It runs Clep.</span></h2>
        <HowRun />
      </section>

      <section className="block launch">
        <div className="block-head">
          <h2 className="block-title">Push a feature. <span className="pink">Get the launch video.</span></h2>
          <p className="block-note">{LAUNCH_VIDEO.line}</p>
        </div>
        <InViewVideo slug={LAUNCH_VIDEO.slug} className="tile-video launch-video" />
      </section>

      <section id="work" className="block">
        <div className="block-head">
          <h2 className="block-title">Clep <span className="pink">picks the effect.</span></h2>
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

      <section id="pricing" className="block">
        <div className="block-head">
          <h2 className="block-title">Simple <span className="pink">pricing.</span></h2>
          <p className="block-note">Free while you try it. Upgrade when you post more.</p>
        </div>
        <div className="plans">
          {PLANS.map((plan) => (
            <div key={plan.name} className={plan.featured ? "plan featured" : "plan"}>
              <h3>{plan.name}</h3>
              <p className="plan-price">${plan.monthly}<span>/mo</span></p>
              <p>{plan.for}. {plan.minutes}.</p>
              <a href="/reserve" className={plan.featured ? "btn-pink" : "btn-line"}>Reserve Spot</a>
            </div>
          ))}
        </div>
        <a href="/pricing" className="block-cta">Compare all plans →</a>
      </section>

      <section id="faq" className="block questions">
        <h2 className="block-title">Common <span className="pink">questions.</span></h2>
        {FAQ.map((item) => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </section>

      <footer className="home-foot">
        <div className="foot-head">
          <img src="/brand/clep-mark-gradient.png" alt="" width={48} height={57} className="foot-mark" />
          <img src="/brand/clep-word-gradient.png" alt="Clep" width={392} height={171} className="foot-word" />
        </div>

        <div className="foot-main">
          <nav className="foot-cols" aria-label="Footer">
            {FOOTER_LINKS.map((col) => (
              <div key={col.title}>
                <h3>{col.title}</h3>
                {col.links.map(([label, href]) => (
                  <a key={label} href={href}>{label}</a>
                ))}
              </div>
            ))}
          </nav>
          <div className="foot-signup">
            <p className="foot-signup-lead">
              Ship it. <span className="pink">We&apos;ll film it.</span> Get early access to Clep.
            </p>
            <Waitlist variant="line" cta="Join" />
            <p className="foot-fine">
              Clep is in private beta. We&apos;ll only email you about your access.
            </p>
          </div>
        </div>

        <div className="foot-bottom">
          <span>© 2026 Clep · Made by <a href="https://abstraklabs.com">Abstrak Labs</a></span>
          <a href="#top" className="foot-top-link">Back to top ↑</a>
        </div>
      </footer>
    </div>
  );
}

/** Tiny marks for the agents Clep works with. */
function AgentIcons() {
  return (
    <>
      <svg viewBox="0 0 22 14" width="22" height="14" aria-hidden>
        <g fill="#d97757">
          <rect x="3" y="0" width="16" height="9" />
          <rect x="0" y="4" width="3" height="3" />
          <rect x="19" y="4" width="3" height="3" />
          <rect x="4" y="9" width="2" height="5" /><rect x="8" y="9" width="2" height="5" />
          <rect x="12" y="9" width="2" height="5" /><rect x="16" y="9" width="2" height="5" />
        </g>
        <rect x="6" y="3" width="2" height="2" fill="#1a1210" /><rect x="14" y="3" width="2" height="2" fill="#1a1210" />
      </svg>
      <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden>
        <path d="M8 1 L14.5 4.7 L14.5 11.3 L8 15 L1.5 11.3 L1.5 4.7 Z" fill="#3a3a3a" stroke="#d8d8d8" strokeWidth="1" />
        <path d="M8 1 L8 8 L14.5 11.3 M8 8 L1.5 11.3" stroke="#d8d8d8" strokeWidth="1" fill="none" />
        <path d="M8 1 L14.5 4.7 L8 8 L1.5 4.7 Z" fill="#f2f2f2" />
      </svg>
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
        <rect width="16" height="16" rx="4" fill="#5b7cfa" />
        <circle cx="8" cy="8" r="4.2" fill="none" stroke="#fff" strokeWidth="1.6" />
        <circle cx="8" cy="8" r="1.4" fill="#fff" />
      </svg>
    </>
  );
}
