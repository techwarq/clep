"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getMe, getToken, startCheckout, type PlanInfo } from "../../../lib/api";

interface PlanCard {
  name: string;
  price: string;
  period: string;
  features: string[];
  featured?: boolean;
  contactOnly?: boolean;
}

const PLANS: PlanCard[] = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    features: ["50 pages / month", "Up to 50 pages / document", "Structured data extraction", "Verification", "CSV export"],
  },
  {
    name: "Starter",
    price: "$19",
    period: "/mo",
    features: ["500 pages / month", "Up to 250 pages / document", "Verification", "Excel + CSV", "Batch uploads", "Priority processing"],
  },
  {
    name: "Pro",
    price: "$49",
    period: "/mo",
    featured: true,
    features: [
      "2,000 pages / month",
      "Up to 500 pages / document",
      "Advanced verification",
      "Batch processing",
      "Excel + CSV + JSON",
      "Google Sheets",
      "Shareable results",
    ],
  },
  {
    name: "Business",
    price: "$149",
    period: "/mo",
    contactOnly: true,
    features: ["10,000 pages / month", "Up to 500 pages / document", "API access", "Webhooks", "Team workspace", "Advanced exports", "Priority processing"],
  },
];

export default function UpgradePage() {
  const router = useRouter();
  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2600);
  };

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    getMe()
      .then(setPlan)
      .catch((err) => showToast(err instanceof Error ? err.message : "Couldn't load your plan"));
  }, [router]);

  const subscribe = async (planName: string) => {
    setBusy(planName);
    try {
      const { checkoutUrl } = await startCheckout(planName);
      window.location.href = checkoutUrl;
    } catch (err) {
      setBusy(null);
      showToast(err instanceof Error ? err.message : "Couldn't start checkout");
    }
  };

  return (
    <>
      <div className="nav">
        <div className="nav-inner">
          <Link className="brand" href="/" aria-label="clep — home">
            <Image src="/logo.png" alt="clep" width={760} height={413} className="brand-logo" priority />
          </Link>
          <div className="nav-actions">
            <Link href="/dashboard" className="link-btn">
              ← Back to dashboard
            </Link>
          </div>
        </div>
      </div>

      <main className="wrap dash">
        <h1 className="dash-title">Upgrade your plan</h1>
        <p className="lead" style={{ marginTop: -8, marginBottom: 26 }}>
          {plan
            ? `You're on the ${plan.planName} plan — ${plan.pagesRemaining} of ${plan.pageQuota} pages left this month.`
            : "Loading your current plan…"}
        </p>

        <div className="pricing4">
          {PLANS.map((p) => {
            const isCurrent = plan?.planName === p.name;
            return (
              <div className={`price ${p.featured ? "featured" : ""}`} key={p.name}>
                <h3>
                  {p.name}
                  {p.featured ? " ⭐" : ""}
                </h3>
                <div className="amount">
                  {p.price}
                  <span>{p.period}</span>
                </div>
                <ul>
                  {p.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                {isCurrent ? (
                  <span className="badge badge-done" style={{ justifyContent: "center", width: "100%" }}>
                    ✓ Current plan
                  </span>
                ) : p.name === "Free" ? (
                  <button className="btn btn-ghost" disabled>
                    Downgrade via cancellation
                  </button>
                ) : p.contactOnly ? (
                  <button className="btn btn-ghost" onClick={() => showToast("Sales will reach out at launch")}>
                    Contact us
                  </button>
                ) : (
                  <button
                    className={p.featured ? "btn btn-lime" : "btn btn-ghost"}
                    disabled={busy === p.name}
                    onClick={() => subscribe(p.name)}
                  >
                    {busy === p.name ? "Redirecting…" : "Subscribe"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
