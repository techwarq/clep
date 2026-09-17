"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar, { type DashView } from "../../components/Sidebar";
import {
  clearApiKey,
  clearClepSession,
  clepMe,
  createApiKey,
  deleteApiKey,
  getApiKey,
  getBilling,
  getClepToken,
  listApiKeys,
  listClipJobs,
  startClepCheckout,
  type ApiKeyInfo,
  type BillingInfo,
  type ClepJob,
  type ClepUser,
  type CreatedApiKey,
} from "../../lib/api";

const STATUS_LABEL: Record<ClepJob["status"], string> = {
  queued: "Queued",
  recording: "Recording",
  editing: "Editing",
  done: "Done",
  error: "Error",
};

function relativeTime(epochSeconds: number | null | undefined): string {
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
  const [keys, setKeys] = useState<ApiKeyInfo[]>([]);
  const [keysLoading, setKeysLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newLabel, setNewLabel] = useState("prod");
  const [creating, setCreating] = useState(false);
  const [justCreated, setJustCreated] = useState<CreatedApiKey | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
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
    listApiKeys()
      .then((res) => setKeys(res.keys))
      .catch((err) => showToast(err instanceof Error ? err.message : "Couldn't load API keys"))
      .finally(() => setKeysLoading(false));
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

  const doCreate = async () => {
    const label = newLabel.trim() || "prod";
    setCreating(true);
    try {
      const created = await createApiKey(label);
      setKeys((ks) => [created, ...ks]);
      setJustCreated(created);
      // Surface the fresh secret in Get Started's configure command too.
      setUser((u) => (u ? { ...u, api_key: created.key } : u));
      setShowCreate(false);
      setNewLabel("prod");
      showToast("Key created — copy it now, it won't be shown again");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Couldn't create key");
    } finally {
      setCreating(false);
    }
  };

  const doDelete = async (key: ApiKeyInfo) => {
    setDeletingId(key.id);
    try {
      await deleteApiKey(key.id);
      setKeys((ks) => ks.filter((k) => k.id !== key.id));
      setConfirmDeleteId(null);
      // If the deleted key was the stored CLI key (last4 match), drop it so
      // Usage/configure stop sending a dead secret.
      const stored = getApiKey();
      if (stored && stored.slice(-4) === key.key_last4) {
        clearApiKey();
        setUser((u) => (u && u.api_key && u.api_key.slice(-4) === key.key_last4 ? { ...u, api_key: undefined } : u));
      }
      showToast(`Deleted key "${key.label}"`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Couldn't delete key");
    } finally {
      setDeletingId(null);
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
  // Raw secret is only ever known right after signup/creation — otherwise fall
  // back to the stored CLI key, else prompt to create one.
  const storedKey = typeof window === "undefined" ? null : getApiKey();
  const displayKey = user?.api_key ?? storedKey ?? null;
  const installCmd = `/plugin marketplace add techwarq/allore-pipelines\n/plugin install clep@clep-marketplace`;
  const configureCmd = `clep configure --url ${apiUrl || "<CLEP_API_URL>"} --key ${displayKey ?? "<your key>"}`;
  const tryCmd = `/clep:clep make a clip of the signup flow at http://localhost:3000`;
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
                  {displayKey ? (
                    <div className="mk-keyrow">
                      <span className="mk-tag">live</span>
                      <code className="mk-key">{displayKey}</code>
                      <span className="mk-key-spacer" />
                      <button className="mk-btn-light" onClick={() => copyText(displayKey, "API key copied")}>
                        Copy
                      </button>
                      <button className="mk-btn-light" onClick={() => setView("keys")}>
                        <span aria-hidden>⚙</span> Manage
                      </button>
                    </div>
                  ) : (
                    <div className="mk-keyrow">
                      <span className="mk-muted" style={{ margin: 0 }}>
                        No key on this device yet — create one to connect Claude Code.
                      </span>
                      <span className="mk-key-spacer" />
                      <button className="mk-btn-dark" onClick={() => setView("keys")}>
                        Create API key →
                      </button>
                    </div>
                  )}
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
                {!showCreate ? (
                  <button className="mk-btn-dark" onClick={() => setShowCreate(true)}>
                    ＋ Create API Key
                  </button>
                ) : (
                  <div className="mk-confirm">
                    <input
                      className="mk-label-input"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      placeholder="Label (e.g. prod)"
                      aria-label="Key label"
                      maxLength={40}
                    />
                    <button className="mk-btn-dark" disabled={creating} onClick={doCreate}>
                      {creating ? "Creating…" : "Create"}
                    </button>
                    <button className="mk-btn-light" onClick={() => setShowCreate(false)}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {justCreated && (
                <section className="mk-card mk-created-banner">
                  <div className="mk-card-body">
                    <div className="mk-created-title">Key created — copy it now</div>
                    <p className="mk-muted" style={{ marginBottom: 12 }}>
                      This is the only time the raw secret is shown. It won&apos;t be retrievable later.
                    </p>
                    <div className="mk-keyrow">
                      <span className="mk-tag">{justCreated.label}</span>
                      <code className="mk-key">{justCreated.key}</code>
                      <span className="mk-key-spacer" />
                      <button className="mk-btn-dark" onClick={() => copyText(justCreated.key, "API key copied")}>
                        Copy key
                      </button>
                      <button className="mk-btn-light" onClick={() => setJustCreated(null)}>
                        Done
                      </button>
                    </div>
                  </div>
                </section>
              )}

              <section className="mk-card mk-table-card">
                <div className="mk-table-scroll">
                  <div className="mk-table mk-keys-grid">
                    <div className="mk-th">Label</div>
                    <div className="mk-th">Key</div>
                    <div className="mk-th">Created By</div>
                    <div className="mk-th">Created</div>
                    <div className="mk-th">Last Used</div>
                    <div className="mk-th" />
                    {keysLoading ? (
                      <>
                        <div className="mk-td mk-muted">—</div>
                        <div className="mk-td mk-muted">Loading…</div>
                        <div className="mk-td mk-muted">—</div>
                        <div className="mk-td mk-muted">—</div>
                        <div className="mk-td mk-muted">—</div>
                        <div className="mk-td" />
                      </>
                    ) : keys.length === 0 ? (
                      <>
                        <div className="mk-td mk-muted">—</div>
                        <div className="mk-td mk-muted">No keys yet — create one above.</div>
                        <div className="mk-td mk-muted">—</div>
                        <div className="mk-td mk-muted">—</div>
                        <div className="mk-td mk-muted">—</div>
                        <div className="mk-td" />
                      </>
                    ) : (
                      keys.map((k) => (
                        <>
                          <div className="mk-td mk-muted" key={`${k.id}-label`}>{k.label}</div>
                          <div className="mk-td mk-mono" key={`${k.id}-key`}>clep_live_••••{k.key_last4}</div>
                          <div className="mk-td" key={`${k.id}-by`}>
                            <span className="mk-avatar">{userInitial}</span>
                            <span className="mk-user">{user?.name || user?.email || "—"}</span>
                            <span className="mk-role">Admin</span>
                          </div>
                          <div className="mk-td mk-muted" key={`${k.id}-created`}>{relativeTime(k.created)}</div>
                          <div className="mk-td mk-muted" key={`${k.id}-used`}>{relativeTime(k.last_used)}</div>
                          <div className="mk-td mk-actions" key={`${k.id}-act`}>
                            {confirmDeleteId === k.id ? (
                              <>
                                <span className="mk-muted" style={{ margin: 0, fontSize: 12.5 }}>Sure?</span>
                                <button
                                  className="mk-danger"
                                  disabled={deletingId === k.id}
                                  onClick={() => doDelete(k)}
                                >
                                  {deletingId === k.id ? "Deleting…" : "Yes, delete"}
                                </button>
                                <button className="mk-mini-link" onClick={() => setConfirmDeleteId(null)}>
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button className="mk-danger" onClick={() => setConfirmDeleteId(k.id)}>
                                Delete
                              </button>
                            )}
                          </div>
                        </>
                      ))
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
                      <span className="mk-dodo"><i className="mk-dot" /> Powered by Dodo Payments</span>
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
                    <p className="mk-muted">
                      {!storedKey
                        ? "Create an API key first, then run the plugin from Get Started."
                        : "Run the plugin from Get Started, then come back here."}
                    </p>
                    <button
                      className="mk-btn-dark"
                      onClick={() => setView(!storedKey ? "keys" : "start")}
                    >
                      {!storedKey ? "Create API key →" : "Go to Get Started →"}
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
