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
  if (!epochSeconds) return "—";
  const mins = Math.floor((Date.now() - epochSeconds * 1000) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return "last month";
}

function maskKey(key: string): string {
  if (!key) return "";
  if (key.length <= 14) return `${key.slice(0, 8)}_********`;
  return `${key.slice(0, 12)}_********`;
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
  const [revealKey, setRevealKey] = useState(false);

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

  const copyText = (text: string, msg: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    showToast(msg);
  };

  const doRegenerate = async () => {
    setRegenBusy(true);
    try {
      const newKey = await regenerateApiKey();
      setUser((u) => (u ? { ...u, api_key: newKey } : u));
      setConfirmRegen(false);
      setRevealKey(false);
      showToast("New key created — the old one stopped working");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Couldn't create key");
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
  const installCmd = `/plugin marketplace add techwarq/allore-pipelines\n/plugin install clep@clep-marketplace`;
  const configureCmd = `clep configure --url ${apiUrl || "<CLEP_API_URL>"} --key ${user?.api_key ?? "<your key>"}`;
  const tryCmd = `/clep:clep make a clip of the signup flow at http://localhost:3000`;
  const keyLabel = user ? (revealKey ? user.api_key : maskKey(user.api_key)) : "Loading…";
  const planName = billing?.plan_name ?? null;
  const userInitial = user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="app-shell">
      <Sidebar view={view} onNavigate={setView} user={user} planName={planName} onLogout={logout} />

      <main className="sb-main">
        <div className="mk-wrap">
          {view === "start" && (
            <>
              <div className="mk-hero">
                <h1>Welcome to Clep</h1>
                <p>One plugin. Every clip your launch needs.</p>
              </div>

              <section className="mk-card">
                <div className="mk-card-head">
                  <span className="mk-num">1</span>
                  <span className="mk-card-title">Set up your</span>
                  <span className="mk-picker">✦&nbsp; Claude Code ▾</span>
                  <a
                    className="mk-docs"
                    href="https://github.com/techwarq/clep_plugin_be"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M5 4.5h10.5A2.5 2.5 0 0 1 18 7v13.5H7.5A2.5 2.5 0 0 1 5 18V4.5zM5 16.5A2.5 2.5 0 0 1 7.5 14H18" />
                    </svg>
                    Docs
                  </a>
                </div>
                <div className="mk-card-body">
                  <div className="mk-tabs">
                    <span className="mk-tab active">✦&nbsp; Plugin</span>
                  </div>
                  <p className="mk-line">
                    <span className="mk-claude">✦</span> Setting up Clep for <strong>Claude Code</strong>
                  </p>
                  <p className="mk-muted">In Claude Code, run:</p>
                  <div className="mk-code">
                    <pre>{installCmd}</pre>
                    <button className="mk-copy" onClick={() => copyText(installCmd, "Install commands copied")}>
                      Copy
                    </button>
                  </div>
                  <p className="mk-muted" style={{ marginTop: 14 }}>Then point it at this account:</p>
                  <div className="mk-code">
                    <pre>{configureCmd}</pre>
                    <button className="mk-copy" onClick={() => copyText(configureCmd, "Configure command copied")}>
                      Copy
                    </button>
                  </div>
                </div>
              </section>

              <section className="mk-card">
                <div className="mk-card-head">
                  <span className="mk-num">2</span>
                  <span className="mk-card-title">Your API key for Claude Code</span>
                </div>
                <div className="mk-card-body">
                  <p className="mk-muted">Give this key to your agent to authorize Clep calls.</p>
                  <div className="mk-keyrow">
                    <span className="mk-tag">live</span>
                    <code className="mk-key">{keyLabel}</code>
                    <span className="mk-key-spacer" />
                    <button className="mk-btn-light" onClick={() => user && copyText(user.api_key, "API key copied")}>
                      Copy
                    </button>
                    <button className="mk-btn-light" onClick={() => setView("keys")}>
                      <span aria-hidden>⚙</span> Manage
                    </button>
                  </div>
                </div>
              </section>

              <section className="mk-card">
                <div className="mk-card-head">
                  <span className="mk-num">3</span>
                  <span className="mk-card-title">Try it out</span>
                </div>
                <div className="mk-card-body">
                  <p className="mk-muted">In Claude Code, in the app you want to clip:</p>
                  <div className="mk-code">
                    <pre>{tryCmd}</pre>
                    <button className="mk-copy" onClick={() => copyText(tryCmd, "Prompt copied")}>
                      Copy
                    </button>
                  </div>
                  <p className="mk-muted" style={{ marginTop: 14 }}>
                    Claude instruments the feature if needed, renders it, and reports back. Finished clips show up
                    under Usage.
                  </p>
                  <button className="mk-btn-dark" style={{ marginTop: 4 }} onClick={() => setView("usage")}>
                    View usage →
                  </button>
                </div>
              </section>
            </>
          )}

          {view === "keys" && (
            <>
              <div className="mk-pagehead">
                <div>
                  <h1>API Keys</h1>
                  <p>Manage API keys for your workspace</p>
                </div>
                {!confirmRegen ? (
                  <button className="mk-btn-dark" onClick={() => setConfirmRegen(true)}>
                    ＋ Create API Key
                  </button>
                ) : (
                  <div className="mk-confirm">
                    <span>Creating a key invalidates the current one. Sure?</span>
                    <button className="mk-btn-dark" disabled={regenBusy} onClick={doRegenerate}>
                      {regenBusy ? "Creating…" : "Yes, create"}
                    </button>
                    <button className="mk-btn-light" onClick={() => setConfirmRegen(false)}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <section className="mk-card mk-table-card">
                <div className="mk-table-scroll">
                  <div className="mk-table mk-keys-grid">
                    <div className="mk-th">Label</div>
                    <div className="mk-th">Key</div>
                    <div className="mk-th">Created By</div>
                    <div className="mk-th">Created</div>
                    <div className="mk-th">Last Used</div>
                    <div className="mk-th" />
                    {user ? (
                      <>
                        <div className="mk-td mk-muted">live</div>
                        <div className="mk-td mk-mono">
                          {keyLabel}
                          <button className="mk-mini-link" onClick={() => setRevealKey((r) => !r)}>
                            {revealKey ? "Hide" : "Reveal"}
                          </button>
                        </div>
                        <div className="mk-td">
                          <span className="mk-avatar">{userInitial}</span>
                          <span className="mk-user">{user.name || user.email}</span>
                          <span className="mk-role">Admin</span>
                        </div>
                        <div className="mk-td mk-muted">—</div>
                        <div className="mk-td mk-muted">—</div>
                        <div className="mk-td mk-actions">
                          <button className="mk-mini-link" onClick={() => copyText(user.api_key, "API key copied")}>
                            Copy
                          </button>
                          <button
                            className="mk-danger"
                            onClick={() => setConfirmRegen(true)}
                          >
                            Regenerate
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="mk-td mk-muted">—</div>
                        <div className="mk-td mk-muted">Loading…</div>
                        <div className="mk-td mk-muted">—</div>
                        <div className="mk-td mk-muted">—</div>
                        <div className="mk-td mk-muted">—</div>
                        <div className="mk-td" />
                      </>
                    )}
                  </div>
                </div>
                <div className="mk-pagefoot">Page 1</div>
              </section>
            </>
          )}

          {view === "billing" && (
            <>
              <div className="mk-pagehead">
                <div>
                  <h1>Billing</h1>
                  <p>Payments are handled by Dodo Payments — Clep never sees your card.</p>
                </div>
              </div>
              <section className="mk-card">
                <div className="mk-card-body">
                  <div className="mk-plan-hero">
                    <div>
                      <div className="mk-label">CURRENT PLAN</div>
                      <div className="mk-plan-name">
                        {billing ? (billing.plan_name ? billing.plan_name[0].toUpperCase() + billing.plan_name.slice(1) : "Free") : "—"}
                      </div>
                      <span className="mk-dodo">⬤ Powered by Dodo Payments</span>
                    </div>
                    {planName !== "pro" && (
                      <button
                        className="mk-btn-dark"
                        disabled={checkoutBusy || !billing?.billing_configured}
                        onClick={upgrade}
                      >
                        {checkoutBusy ? "Redirecting…" : "Upgrade to Pro"}
                      </button>
                    )}
                  </div>
                  {billing && !billing.billing_configured && (
                    <p className="mk-muted" style={{ marginTop: 14, marginBottom: 0 }}>
                      Billing isn&apos;t configured on this backend yet (no Dodo API key set) — upgrades are disabled
                      until it is.
                    </p>
                  )}
                </div>
              </section>
            </>
          )}

          {view === "usage" && (
            <>
              <div className="mk-pagehead">
                <div>
                  <h1>Usage</h1>
                  <p>Every clip job rendered on this account, newest first.</p>
                </div>
              </div>
              <section className="mk-card mk-table-card">
                {jobs.length === 0 ? (
                  <div className="mk-empty">
                    <div className="mk-empty-title">No clips rendered yet</div>
                    <p className="mk-muted">Run the plugin from Get Started, then come back here.</p>
                    <button className="mk-btn-dark" onClick={() => setView("start")}>
                      Go to Get Started →
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mk-table-scroll">
                      <div className="mk-table mk-usage-grid">
                        <div className="mk-th">Clip</div>
                        <div className="mk-th">Job ID</div>
                        <div className="mk-th">Created</div>
                        <div className="mk-th">Status</div>
                        <div className="mk-th" />
                        {jobs.map((j) => (
                          <>
                            <div className="mk-td" key={`${j.id}-name`}>
                              <strong>{j.name}</strong>
                            </div>
                            <div className="mk-td mk-mono mk-muted" key={`${j.id}-id`}>{j.id}</div>
                            <div className="mk-td mk-muted" key={`${j.id}-time`}>{relativeTime(j.created)}</div>
                            <div className="mk-td" key={`${j.id}-status`}>
                              <span
                                className={`mk-status mk-status-${j.status === "done" ? "done" : j.status === "error" ? "error" : "busy"}`}
                              >
                                {j.status === "done" || j.status === "error" ? (
                                  <i className="mk-sdot" />
                                ) : (
                                  <i className="mk-spin" />
                                )}
                                {STATUS_LABEL[j.status]}
                              </span>
                            </div>
                            <div className="mk-td mk-actions" key={`${j.id}-act`}>
                              {j.status === "done" && j.out ? (
                                <a className="mk-btn-light" href={`${apiUrl}${j.out}`} target="_blank" rel="noreferrer">
                                  Download
                                </a>
                              ) : null}
                            </div>
                          </>
                        ))}
                      </div>
                    </div>
                    <div className="mk-pagefoot">Page 1</div>
                  </>
                )}
              </section>
            </>
          )}
        </div>
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
