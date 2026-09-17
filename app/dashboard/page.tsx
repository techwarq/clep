"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar, { type DashView } from "../../components/Sidebar";
import {
  clearClepSession,
  clepMe,
  getBilling,
  getClepToken,
  listClipJobs,
  regenerateApiKey,
  startClepCheckout,
  type BillingInfo,
  type ClepJob,
  type ClepUser,
} from "../../lib/api";

const STATUS_LABEL: Record<ClepJob["status"], string> = {
  queued: "Queued",
  recording: "Recording",
  editing: "Editing",
  done: "Done",
  error: "Error",
};

function relativeTime(epochSeconds: number | undefined): string {
  if (!epochSeconds) return "";
  const mins = Math.floor((Date.now() - epochSeconds * 1000) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function Dashboard() {
  return (
    <Suspense fallback={null}>
      <DashboardInner />
    </Suspense>
  );
}

function DashboardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialView = (searchParams.get("view") as DashView | null) ?? "start";
  const [view, setView] = useState<DashView>(initialView);
  const [user, setUser] = useState<ClepUser | null>(null);
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [jobs, setJobs] = useState<ClepJob[]>([]);
  const [regenBusy, setRegenBusy] = useState(false);
  const [confirmRegen, setConfirmRegen] = useState(false);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2600);
  };

  useEffect(() => {
    if (!getClepToken()) {
      router.replace("/login");
      return;
    }
    clepMe()
      .then(setUser)
      .catch(() => router.replace("/login"));
    getBilling()
      .then(setBilling)
      .catch((err) => showToast(err instanceof Error ? err.message : "Couldn't load billing"));
    listClipJobs()
      .then((res) => setJobs(res.jobs))
      .catch((err) => showToast(err instanceof Error ? err.message : "Couldn't load usage"));
  }, [router]);

  const logout = () => {
    clearClepSession();
    window.location.href = "/login";
  };

  const copyKey = () => {
    if (!user) return;
    navigator.clipboard?.writeText(user.api_key).catch(() => {});
    showToast("API key copied");
  };

  const doRegenerate = async () => {
    setRegenBusy(true);
    try {
      const newKey = await regenerateApiKey();
      setUser((u) => (u ? { ...u, api_key: newKey } : u));
      setConfirmRegen(false);
      showToast("New key generated — the old one stopped working");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Couldn't regenerate key");
    } finally {
      setRegenBusy(false);
    }
  };

  const upgrade = async () => {
    setCheckoutBusy(true);
    try {
      const { checkout_url } = await startClepCheckout(window.location.href);
      window.location.href = checkout_url;
    } catch (err) {
      setCheckoutBusy(false);
      showToast(err instanceof Error ? err.message : "Couldn't start checkout");
    }
  };

  const apiUrl = process.env.NEXT_PUBLIC_CLEP_API_URL ?? "";

  return (
    <div className="app-shell">
      <Sidebar view={view} onNavigate={setView} user={user} planName={billing?.plan_name ?? null} onLogout={logout} />

      <main className="sb-main">
        {view === "start" && (
          <>
            <h1 className="dash-title">Welcome to Clep</h1>
            <p className="dash-sub">Turn any feature into a 3–5 second product clip — from inside Claude Code.</p>

            <div className="step-card">
              <div className="step-head"><span className="step-num">1</span>Install the plugin</div>
              <div className="step-body">
                <p>In Claude Code:</p>
                <pre className="code-block">{`/plugin marketplace add techwarq/allore-pipelines\n/plugin install clep@clep-marketplace`}</pre>
                <p>Then point it at this account:</p>
                <pre className="code-block">{`clep configure --url ${apiUrl || "<CLEP_API_URL>"} --key ${user?.api_key ?? "<your key>"}`}</pre>
              </div>
            </div>

            <div className="step-card">
              <div className="step-head"><span className="step-num">2</span>Your API key</div>
              <div className="step-body">
                <p>The plugin uses this to authorize calls to your account.</p>
                {user ? (
                  <div className="key-row">
                    <pre className="code-block">{user.api_key}</pre>
                    <button className="btn btn-lime btn-sm" onClick={copyKey}>Copy</button>
                  </div>
                ) : (
                  <p className="usage-note">Loading…</p>
                )}
              </div>
            </div>

            <div className="step-card">
              <div className="step-head"><span className="step-num">3</span>Try it out</div>
              <div className="step-body">
                <p>In Claude Code, in the app you want to clip:</p>
                <pre className="code-block">{`/clep:clep make a clip of the signup flow at http://localhost:3000`}</pre>
                <p>Claude instruments the feature if needed, renders it, and reports back. Finished clips show up under Usage.</p>
              </div>
            </div>
          </>
        )}

        {view === "keys" && (
          <>
            <h1 className="dash-title">API Keys</h1>
            <p className="dash-sub">One live key per account. Regenerating invalidates the old one immediately.</p>
            <div className="step-card">
              <div className="step-body">
                {user ? (
                  <>
                    <div className="key-row">
                      <pre className="code-block">{user.api_key}</pre>
                      <button className="btn btn-ghost btn-sm" onClick={copyKey}>Copy</button>
                    </div>
                    {!confirmRegen ? (
                      <button className="mini-btn" style={{ marginTop: 12 }} onClick={() => setConfirmRegen(true)}>
                        Regenerate key
                      </button>
                    ) : (
                      <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
                        <span className="usage-note" style={{ margin: 0 }}>
                          Anything using the old key (the plugin, a deployed SDK) will break until reconfigured. Sure?
                        </span>
                        <button className="mini-btn solid" disabled={regenBusy} onClick={doRegenerate}>
                          {regenBusy ? "Regenerating…" : "Yes, regenerate"}
                        </button>
                        <button className="mini-btn ghost" onClick={() => setConfirmRegen(false)}>Cancel</button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="usage-note">Loading…</p>
                )}
              </div>
            </div>
          </>
        )}

        {view === "billing" && (
          <>
            <h1 className="dash-title">Billing</h1>
            <p className="dash-sub">Payments are handled by Dodo Payments — Clep never sees your card.</p>
            <div className="step-card">
              <div className="step-body">
                <div className="plan-hero">
                  <div>
                    <div className="sb-plan-label">CURRENT PLAN</div>
                    <div className="plan-hero-name">{billing ? billing.plan_name[0].toUpperCase() + billing.plan_name.slice(1) : "—"}</div>
                    <span className="dodo-badge">⬤ Powered by Dodo Payments</span>
                  </div>
                  {billing?.plan_name !== "pro" && (
                    <button className="btn btn-lime" disabled={checkoutBusy || !billing?.billing_configured} onClick={upgrade}>
                      {checkoutBusy ? "Redirecting…" : "Upgrade to Pro"}
                    </button>
                  )}
                </div>
                {billing && !billing.billing_configured && (
                  <p className="usage-note" style={{ marginTop: 14 }}>
                    Billing isn't configured on this backend yet (no Dodo API key set) — upgrades are disabled until it is.
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {view === "usage" && (
          <>
            <h1 className="dash-title">Usage</h1>
            <p className="dash-sub">Every clip job rendered on this account, newest first.</p>
            <div className="step-card">
              <div className="step-body">
                {jobs.length === 0 ? (
                  <p className="usage-note">No clips rendered yet — try the plugin from Get Started.</p>
                ) : (
                  jobs.map((j) => (
                    <div className="usage-row" key={j.id}>
                      <div className="usage-row-meta">
                        <strong>{j.name}</strong>
                        <span>{j.id} · {relativeTime(j.created)}</span>
                      </div>
                      <span className={`badge badge-${j.status === "done" ? "done" : j.status === "error" ? "failed" : "processing"}`}>
                        {STATUS_LABEL[j.status]}
                      </span>
                      {j.status === "done" && j.out && (
                        <a className="mini-btn" href={`${apiUrl}${j.out}`} target="_blank" rel="noreferrer">Download</a>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
