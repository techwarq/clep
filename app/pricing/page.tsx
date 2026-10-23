import type { Metadata } from "next";
import "../landing.css";
import PixelGrid from "../../components/PixelGrid";
import PricingPlans from "../../components/PricingPlans";
import StickyNav from "../../components/StickyNav";
import { ADDONS, COMPARE, type Cell } from "../../lib/pricing";

export const metadata: Metadata = {
  title: "Pricing — Clep",
  description: "Free to start. Pro $19 a month, Studio $39 a month. Every effect and every format on every plan.",
};

const FAQ = [
  {
    q: "What counts as an export minute?",
    a: "One minute of finished video. A 40-second clip uses 40 seconds. A 4K export counts double, so a 1-minute 4K clip uses 2 minutes.",
  },
  {
    q: "Why is Clep this cheap?",
    a: "Your coding agent works out what to film and the recording runs on your machine or in your CI. Clep only edits, renders and stores the video.",
  },
  {
    q: "What happens when I hit my limit?",
    a: "Renders pause until next month. You can buy 20 more minutes for $8, or turn on overage at about $0.40 per extra minute.",
  },
  {
    q: "Does the Free plan get every effect?",
    a: "Yes. Zooms, cursor, speed-ups, dead-air cuts, privacy blur and every format. Free clips are 1080p, up to 30 seconds, with a small \"Made with Clep\" badge.",
  },
  {
    q: "Can I change plans later?",
    a: "Any time. Upgrades apply right away; downgrades take effect at the end of the billing period.",
  },
];

export default function Pricing() {
  return (
    <div className="home">
      <div className="hero-bg" aria-hidden>
        <PixelGrid />
      </div>

      <StickyNav>
        <a href="/" aria-label="Clep home" className="home-logo">
          <img src="/brand/clep-logo-cream.png" alt="Clep" width={110} height={43} />
        </a>
        <nav className="home-links">
          <a href="/#work">Work</a>
          <a href="/#how">How It Works</a>
          <a href="/pricing" aria-current="page">Pricing</a>
        </nav>
        <div className="home-actions">
          <a href="/login" className="btn-line">Login</a>
          <a href="/reserve" className="btn-pink">Reserve Spot</a>
        </div>
      </StickyNav>

      <section className="intro pricing-intro">
        <h1 className="display small">
          Simple <span className="pink">pricing.</span>
        </h1>
        <p className="intro-sub">
          Every effect, every format, on every plan.
          <br />
          Pay for minutes, not features.
        </p>
      </section>

      <section className="block pricing-cards">
        <PricingPlans />
        <p className="plans-note">A 4K export counts as 2 minutes of your allowance.</p>
      </section>

      <section className="block">
        <h2 className="block-title">Compare <span className="pink">plans.</span></h2>
        <div className="ptable-wrap">
          <table className="ptable">
            <thead>
              <tr>
                <th scope="col" aria-label="Feature" />
                <th scope="col">Free</th>
                <th scope="col" className="is-featured">Pro</th>
                <th scope="col">Studio</th>
              </tr>
            </thead>
            {COMPARE.map((section) => (
              <tbody key={section.group}>
                <tr className="ptable-group">
                  <th scope="rowgroup" colSpan={4}>{section.group}</th>
                </tr>
                {section.rows.map(([label, ...cells]) => (
                  <tr key={label}>
                    <th scope="row">{label}</th>
                    {cells.map((cell, i) => (
                      <td key={i} className={i === 1 ? "is-featured" : undefined}><CellValue value={cell} /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      </section>

      <section className="block">
        <div className="block-head">
          <h2 className="block-title">Need <span className="pink">more?</span></h2>
          <p className="block-note">Add-ons for Pro and Studio. Buy them when you need them.</p>
        </div>
        <div className="addons">
          {ADDONS.map((addon) => (
            <div key={addon.name} className="addon">
              <h3>{addon.name}</h3>
              <p className="addon-price">{addon.price}</p>
              <p>{addon.detail}</p>
            </div>
          ))}
        </div>
        <div className="enterprise">
          <div>
            <h3>Enterprise</h3>
            <p>SSO, a renderer inside your own cloud, an SLA and audit logs. Custom price.</p>
          </div>
          <a href="mailto:support@clep.dev" className="btn-line">Talk to us</a>
        </div>
      </section>

      <section className="block questions">
        <h2 className="block-title">Pricing <span className="pink">questions.</span></h2>
        {FAQ.map((item) => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </section>

      <footer className="pricing-foot">
        <span>© 2026 Clep · Made by <a href="https://abstraklabs.com">Abstrak Labs</a></span>
        <a href="/">Back to home →</a>
      </footer>
    </div>
  );
}

function CellValue({ value }: { value: Cell }) {
  if (value === true) return <span className="yes" aria-label="Included">✓</span>;
  if (value === false) return <span className="no" aria-label="Not included">—</span>;
  return <>{value}</>;
}
