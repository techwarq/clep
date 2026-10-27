"use client";

import { Ico } from "../../../components/dash/icons";
import { PageHead, Soon, minutesText, thisMonth } from "../../../components/dash/ui";
import { useDash } from "../../../lib/dashboard";
import { ADDONS, PLANS } from "../../../lib/pricing";

export default function Billing() {
  const { clips, account } = useDash();
  const usage = account?.usage;
  const month = thisMonth(clips);
  const ready = month.filter((j) => j.status === "done").length;

  return (
    <div className="cd-page">
      <PageHead title="Usage & billing" sub="Minutes and clips used this month, your plan and top-ups." />

      <section className="cd-stats cd-stats-3">
        <div className="cd-stat">
          <div>
            <p className="cd-label">Plan</p>
            <p className="cd-big">{usage ? `${usage.plan[0].toUpperCase()}${usage.plan.slice(1)}` : "…"}</p>
            <p className="cd-stat-note">{usage?.plan === "beta" ? "Free while in beta" : "Billed monthly"}</p>
          </div>
        </div>
        <div className="cd-stat">
          <div>
            <p className="cd-label">Clips this month</p>
            <p className="cd-big">{ready}</p>
            <p className="cd-stat-note">{month.length - ready} more started or failed</p>
          </div>
        </div>
        <div className="cd-stat">
          <div>
            <p className="cd-label">Export minutes</p>
            <p className="cd-big">{usage ? minutesText(usage.used_seconds) : "…"}</p>
            <p className="cd-stat-note">{usage ? `of ${minutesText(usage.limit_seconds)} this month · resets on the 1st` : ""}</p>
          </div>
        </div>
      </section>

      <h2 className="cd-h2">Plans</h2>
      <div className="cd-plans">
        {PLANS.map((p) => (
          <section key={p.name} className={`cd-card cd-plan ${p.featured ? "featured" : ""}`}>
            <h3>{p.name}</h3>
            <p className="cd-plan-price">${p.monthly}<span>/mo</span></p>
            <p className="cd-plan-min">{p.minutes}</p>
            <ul>
              {p.highlights.map((h) => <li key={h}>{Ico.check}{h}</li>)}
            </ul>
            <button type="button" className={`cd-btn cd-btn-block ${p.featured ? "cd-btn-pink" : ""}`} disabled>
              {p.monthly === 0 ? "Included in beta" : "Upgrade"} {p.monthly > 0 && <Soon />}
            </button>
          </section>
        ))}
      </div>

      <div className="cd-split cd-split-even">
        {ADDONS.map((a) => (
          <section key={a.name} className="cd-card">
            <div className="cd-card-head">
              <div>
                <h2>Top-up · {a.price}</h2>
                <p>{a.detail}</p>
              </div>
              <button type="button" className="cd-btn" disabled>Buy <Soon /></button>
            </div>
          </section>
        ))}
        <section className="cd-card">
          <div className="cd-card-head">
            <div>
              <h2>Enterprise</h2>
              <p>SSO, a renderer in your own cloud and an SLA.</p>
            </div>
            <a href="mailto:support@clep.dev" className="cd-btn">Talk to us</a>
          </div>
        </section>
      </div>
    </div>
  );
}
