"use client";

import { useCallback, useEffect, useState } from "react";
import { Ico } from "../../../components/dash/icons";
import { PageHead, Soon, minutesText, thisMonth } from "../../../components/dash/ui";
import { useDash } from "../../../lib/dashboard";
import { cancelPlan, getBilling, resumePlan, startCheckout, type BillingState, type PaidPlan } from "../../../lib/platform";
import { ADDONS, PLANS } from "../../../lib/pricing";

const PAID: Record<string, PaidPlan> = { Pro: "pro", Studio: "studio" };
const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString(undefined, { month: "long", day: "numeric" }) : "");

export default function Billing() {
  const { clips, account, fail, refresh } = useDash();
  const usage = account?.usage;
  const month = thisMonth(clips);
  const ready = month.filter((j) => j.status === "done").length;
  const [billing, setBilling] = useState<BillingState | null>(null);
  const [working, setWorking] = useState<string | null>(null);

  const load = useCallback(() => getBilling().then(setBilling).catch(fail), [fail]);
  useEffect(() => void load(), [load, usage?.plan]);

  const upgrade = async (plan: PaidPlan) => {
    setWorking(plan);
    try {
      window.location.href = (await startCheckout(plan)).checkout_url;
    } catch (e) {
      fail(e);
      setWorking(null);
    }
  };

  const toggleRenewal = async () => {
    setWorking("renewal");
    try {
      await (billing?.cancel_at_period_end ? resumePlan() : cancelPlan());
      await Promise.all([load(), refresh()]);
    } catch (e) {
      fail(e);
    } finally {
      setWorking(null);
    }
  };

  const sub = billing?.subscription;

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

      {sub && (
        <section className="cd-card">
          <div className="cd-card-head">
            <div>
              <h2>{billing.plan[0].toUpperCase()}{billing.plan.slice(1)} subscription</h2>
              <p>{billing.cancel_at_period_end ? `Ends on ${day(billing.renews_at)}; you keep it until then.` : `Renews on ${day(billing.renews_at)}.`}</p>
            </div>
            <button type="button" className="cd-btn" disabled={working !== null} onClick={toggleRenewal}>
              {working === "renewal" ? "Saving…" : billing.cancel_at_period_end ? "Keep my plan" : "Cancel renewal"}
            </button>
          </div>
        </section>
      )}

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
            {PAID[p.name] ? (
              <button type="button" className={`cd-btn cd-btn-block ${p.featured ? "cd-btn-pink" : ""}`}
                disabled={working !== null || usage?.plan === PAID[p.name] || !!sub}
                onClick={() => upgrade(PAID[p.name])}>
                {usage?.plan === PAID[p.name] ? "Current plan" : working === PAID[p.name] ? "Opening checkout…" : sub ? "Cancel your plan to switch" : "Upgrade"}
              </button>
            ) : (
              <button type="button" className="cd-btn cd-btn-block" disabled>{usage?.plan === "beta" ? "Included in beta" : "Free"}</button>
            )}
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
