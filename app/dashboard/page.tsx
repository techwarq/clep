"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  clearSession,
  createJob,
  downloadExport,
  getJobStatus,
  getMe,
  getToken,
  getUser,
  listJobs,
  sendChatMessage,
  startExtract,
  uploadToPresignedUrl,
  type ChatMessage,
  type JobDetail,
  type JobListItem,
  type PlanInfo,
  type StoredUser,
} from "../../lib/api";

type Status = "done" | "review" | "processing" | "failed" | "empty";

type Conv = {
  id: string; // real jobId
  name: string;
  type: string;
  out: "Excel" | "CSV" | "JSON";
  status: Status;
  flagged?: number;
  date: string;
  progress?: number;
  error?: string;
};

// documentType, as classified by the backend, only exists once a job has
// left "parsing" — the filename heuristic below covers it before that and
// for the lightweight GET /jobs list (which doesn't include it).
const DOC_TYPE_LABEL: Record<string, string> = {
  statement: "Bank Statement",
  invoice: "Invoice",
  receipt: "Receipt",
};

function detectType(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("invoice") || n.includes("inv_")) return "Invoice";
  if (n.includes("receipt") || n.includes("rcpt")) return "Receipt";
  return "Bank Statement";
}

function typeLabel(documentType: string | undefined, filename: string): string {
  if (documentType && DOC_TYPE_LABEL[documentType]) return DOC_TYPE_LABEL[documentType];
  return detectType(filename);
}

function relativeTime(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// A job can legitimately finish with zero extracted rows (e.g. a document
// that got classified wrong, or genuinely has no matching data) — that's
// not the same as a successful conversion, so it gets its own status rather
// than rendering identically to "done" with an active Download button that
// would just 400.
function statusFromJob(job: { status: JobDetail["status"]; summary: { total: number; needsReview: number } }): Status {
  if (job.status === "complete") return job.summary.total === 0 ? "empty" : "done";
  if (job.status === "reviewing") {
    if (job.summary.needsReview > 0) return "review";
    return job.summary.total === 0 ? "empty" : "done";
  }
  if (job.status === "failed") return "failed";
  return "processing"; // uploaded, parsing, extracting, validating
}

// Rough combined progress across both async phases (parsing then
// extracting) — parsedPages/filesParsed only exist while status is
// "parsing" (see the backend's live GET /jobs/:id response), totalPages is
// only known once parsing finishes. Good enough for a progress bar, not
// meant to be exact.
function progressFromJob(job: JobDetail): number {
  if (job.status === "parsing") {
    if (job.totalFiles) return Math.round(((job.filesParsed ?? 0) / job.totalFiles) * 40);
    return 8;
  }
  if (job.status === "extracting" && job.totalPages) {
    return Math.round(40 + (job.processedPages / job.totalPages) * 55);
  }
  if (job.status === "validating") return 96;
  return 10;
}

function convFromListItem(j: JobListItem): Conv {
  const name = j.files[0] ?? "document";
  return {
    id: j.id,
    name,
    type: detectType(name),
    out: "Excel",
    status: statusFromJob(j),
    flagged: j.summary.needsReview > 0 ? j.summary.needsReview : undefined,
    date: relativeTime(j.updatedAt),
    progress: 10,
  };
}

function mergeJobIntoConv(row: Conv, job: JobDetail): Conv {
  return {
    ...row,
    type: typeLabel(job.files[0]?.documentType, row.name),
    status: statusFromJob(job),
    progress: progressFromJob(job),
    flagged: job.summary.needsReview > 0 ? job.summary.needsReview : undefined,
    error: job.status === "failed" ? job.error : undefined,
    date: relativeTime(job.updatedAt),
  };
}

const EXAMPLES = [
  "Extract columns: Date, Merchant, Amount, Category",
  "One row per invoice with line-item breakdown",
  "Normalize dates to DD/MM/YYYY and remove duplicates",
  "Flag any total that doesn't reconcile",
];

const FILE_ICON: Record<string, string> = {
  "Bank Statement": "🏦",
  Invoice: "🧾",
  Receipt: "🧷",
};
const FILE_TINT: Record<string, string> = {
  "Bank Statement": "t-bank",
  Invoice: "t-inv",
  Receipt: "t-rcpt",
};

// Saved formats are a client-side convenience only — the backend has no
// endpoint for them (custom output schemas are driven by the chat below,
// not a named preset), so this is local state, not a fetched resource.
// Starts empty: a new user hasn't saved anything, so there's nothing real
// to seed this with.
const DEFAULT_FORMATS: Array<{ name: string; cols: string }> = [];

export default function Dashboard() {
  const router = useRouter();
  const [view, setView] = useState<"convert" | "history" | "formats" | "api">("convert");

  const [user, setUser] = useState<StoredUser | null>(null);
  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const [convs, setConvs] = useState<Conv[]>([]);
  const convsRef = useRef<Conv[]>([]);
  const [formats, setFormats] = useState(DEFAULT_FORMATS);

  const [staged, setStaged] = useState<{ file: File; name: string; size: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);
  const [describe, setDescribe] = useState("");
  const [showEx, setShowEx] = useState(false);
  const [outFormat, setOutFormat] = useState<"Excel" | "CSV" | "JSON">("Excel");
  const [advOpen, setAdvOpen] = useState(false);
  const [opts, setOpts] = useState({ dedupe: true, normalize: true, strict: false });
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [fmtMenu, setFmtMenu] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Staging: the file is picked/dropped without hitting the backend at all.
  // The job (and its R2 upload) is only created lazily — the first time
  // either "send" is hit on the describe box or "Convert" is clicked (see
  // ensureStagedJob) — because a chat customization needs the file's
  // content already uploaded to sample against. Once a job exists the file
  // choice is locked: the backend has no "swap file on an existing job"
  // endpoint.
  const [stagedJobId, setStagedJobId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatBusy, setChatBusy] = useState(false);

  const showToast = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2600);
  };

  useEffect(() => {
    convsRef.current = convs;
  }, [convs]);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    setUser(getUser());
    getMe()
      .then(setPlan)
      .catch((err) => showToast(err instanceof Error ? err.message : "Couldn't load your plan"));
    listJobs()
      .then((jobs) => setConvs(jobs.map(convFromListItem)))
      .catch((err) => showToast(err instanceof Error ? err.message : "Couldn't load your jobs"));
  }, [router]);

  // Polls every in-flight job every 3s until it reaches a terminal status.
  // Reads convsRef (not convs directly) so this effect subscribes once for
  // the component's lifetime instead of re-subscribing on every update.
  useEffect(() => {
    const t = window.setInterval(async () => {
      const inFlight = convsRef.current.filter((c) => c.status === "processing");
      await Promise.all(
        inFlight.map(async (row) => {
          try {
            const job = await getJobStatus(row.id);
            setConvs((cs) => cs.map((r) => (r.id === row.id ? mergeJobIntoConv(r, job) : r)));
          } catch {
            // transient poll failure — leave the row as-is, retry next tick
          }
        }),
      );
    }, 3000);
    return () => window.clearInterval(t);
  }, []);

  const pagesLeft = plan?.pagesRemaining ?? null;

  const resetStaging = () => {
    setStaged(null);
    setStagedJobId(null);
    setChatMessages([]);
    setDescribe("");
  };

  const stageFile = (f: File | null) => {
    if (!f || stagedJobId) return;
    setStaged({ file: f, name: f.name, size: `${Math.max(1, Math.round(f.size / 1024))} KB` });
    showToast(`"${f.name}" ready — hit Convert Document`);
  };

  // Creates the job and uploads the staged file exactly once — both
  // "send" on the describe box and "Convert" need the job to exist first,
  // so both call this and it no-ops (returns the existing id) after the
  // first successful call.
  const ensureStagedJob = async (): Promise<string> => {
    if (stagedJobId) return stagedJobId;
    if (!staged) throw new Error("no file staged");
    const created = await createJob([{ name: staged.name, contentType: staged.file.type || "application/pdf" }]);
    await uploadToPresignedUrl(created.uploads[0].uploadUrl, staged.file);
    setStagedJobId(created.jobId);
    return created.jobId;
  };

  const sendDescribe = async () => {
    const message = describe.trim();
    if (!message || chatBusy) {
      if (!message) showToast("Describe what you need first");
      return;
    }
    if (!staged) {
      showToast("Drop a file first — then describe what you need");
      return;
    }
    setChatBusy(true);
    setChatMessages((m) => [...m, { role: "user", content: message }]);
    setDescribe("");
    try {
      const jobId = await ensureStagedJob();
      const job = await sendChatMessage(jobId, message);
      setChatMessages(job.chat ?? []);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Couldn't send that — try again");
    } finally {
      setChatBusy(false);
    }
  };

  const convert = async () => {
    if (!staged) {
      showToast("Drop a file first — then hit Convert Document");
      return;
    }
    setUploading(true);
    try {
      const jobId = await ensureStagedJob();
      await startExtract(jobId);
      const name = staged.name;
      const chosenFormat = outFormat;
      setConvs((cs) => [
        {
          id: jobId,
          name,
          type: "Detecting…",
          out: chosenFormat,
          status: "processing",
          date: "just now",
          progress: 5,
        },
        ...cs,
      ]);
      showToast(`${name} — processing started`);
      resetStaging();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Couldn't start processing");
    } finally {
      setUploading(false);
    }
  };

  const downloadConv = async (c: Conv) => {
    const fmt = c.out === "CSV" ? "csv" : c.out === "JSON" ? "json" : "xlsx";
    const ext = fmt === "csv" ? ".csv" : fmt === "json" ? ".json" : ".xlsx";
    try {
      const blob = await downloadExport(c.id, fmt);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = c.name.replace(/\.[^.]+$/, "") + ext;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`${fmt.toUpperCase()} downloaded`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Download failed");
    }
  };

  const addPreset = () => {
    const v = describe.trim();
    if (!v) {
      showToast("Describe a format above first — then save it");
      return;
    }
    setFormats((fs) => [...fs, { name: v.length > 30 ? v.slice(0, 29) + "…" : v, cols: "Custom columns" }]);
    setDescribe("");
    showToast("Format saved");
  };

  const logout = () => {
    clearSession();
    window.location.href = "/login";
  };

  const tabs: { key: "convert" | "history" | "formats" | "api"; label: string }[] = [
    { key: "convert", label: "Convert" },
    { key: "history", label: "History" },
    { key: "formats", label: "Formats" },
    { key: "api", label: "API" },
  ];

  return (
    <>
      {/* TOP NAV */}
      <div className="nav">
        <div className="nav-inner dash-nav">
          <Link className="brand" href="/" aria-label="clep — home">
            <Image src="/logo.png" alt="clep" width={760} height={413} className="brand-logo" priority />
          </Link>
          <nav className="dash-tabs">
            {tabs.map((t) => (
              <button key={t.key} className={`dash-tab ${view === t.key ? "active" : ""}`} onClick={() => setView(t.key)}>
                {t.label}
              </button>
            ))}
            <Link className="dash-tab" href="/#pricing">Pricing</Link>
          </nav>
          <div className="nav-actions">
            <span className="status-pill compact" title="Pages left this month">
              {pagesLeft === null ? "⚡—" : `⚡${pagesLeft.toLocaleString()}`}
            </span>
            <div className="avatar-wrap">
              <button className="avatar" onClick={() => setMenuOpen(!menuOpen)} aria-label="Account menu">
                {user?.name?.[0]?.toUpperCase() ?? "?"}
              </button>
              {menuOpen && (
                <>
                  <div className="menu-scrim" onClick={() => setMenuOpen(false)} />
                  <div className="avatar-menu">
                    <div className="avatar-head">
                      <strong>{user?.email ?? "Account"}</strong>
                      <span>{plan ? `${plan.planName} plan` : "—"}</span>
                    </div>
                    <button onClick={() => { setMenuOpen(false); showToast("Settings open at launch"); }}>Settings</button>
                    <button onClick={() => { setMenuOpen(false); router.push("/dashboard/upgrade"); }}>Billing</button>
                    <button onClick={() => { setMenuOpen(false); logout(); }}>Logout</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="wrap dash">
        {view === "convert" && (
          <div className="dash-grid">
            <div className="dash-main">
              <div className="eyebrow">Turn documents into data</div>
              <h1 className="dash-title">Convert a document<br />into a structured spreadsheet</h1>
              <p className="dash-sub">Upload your document, describe what you need, and get clean, structured data in seconds.</p>

              <div className="scribble" aria-hidden>
                <span>PDFs, invoices, bank statements,<br />receipts, and more…</span>
                <svg viewBox="0 0 60 50" width="46" height="40">
                  <path d="M52 6 C 34 10, 22 20, 14 42 M14 42 l-4 -9 M14 42 l8 -5" fill="none" stroke="#7a9a3a" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>

              {/* DROPZONE */}
              <div
                className={`dz-card ${drag ? "drag" : ""} ${staged ? "ready" : ""}`}
                role="button"
                tabIndex={0}
                onClick={() => !stagedJobId && inputRef.current?.click()}
                onKeyDown={(e) => e.key === "Enter" && !stagedJobId && inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); if (!stagedJobId) setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => { e.preventDefault(); setDrag(false); stageFile(e.dataTransfer.files?.[0] ?? null); }}
              >
                <div className="dz-icon">🗎</div>
                {staged ? (
                  <>
                    <div className="dz-title">File ready — hit Convert below</div>
                    <div className="dz-file">
                      📄 {staged.name} • {staged.size}
                      {!stagedJobId && (
                        <button
                          aria-label="Remove file"
                          onClick={(e) => { e.stopPropagation(); setStaged(null); }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="dz-title">Drag &amp; drop your file here</div>
                    <div className="dz-browse">or <u>click to browse</u></div>
                    <div className="dz-sub">PDF, JPG, PNG — bank statements, invoices, receipts, etc.</div>
                  </>
                )}
                <input
                  ref={inputRef}
                  className="hidden-input"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.heic"
                  onChange={(e) => { stageFile(e.target.files?.[0] ?? null); e.target.value = ""; }}
                />
                <div className="dz-trust">
                  <div><i>🔒</i><div><b>Secure &amp; private</b><span>Your files are encrypted</span></div></div>
                  <div><i>⚡</i><div><b>Fast processing</b><span>Get results in seconds</span></div></div>
                  <div><i>🗂</i><div><b>Supports messy docs</b><span>Scans, handwritten, multi-page</span></div></div>
                  <div><i>🛡</i><div><b>No setup needed</b><span>Just upload and go</span></div></div>
                </div>
              </div>

              {/* DESCRIBE + FORMAT */}
              <div className="desc-card">
                <div className="desc-head">
                  <span>✨ Describe what you want to extract <em>(optional)</em></span>
                  <div className="ex-wrap">
                    <button className="link-btn" onClick={() => setShowEx(!showEx)}>Try examples ⌄</button>
                    {showEx && (
                      <>
                        <div className="menu-scrim" onClick={() => setShowEx(false)} />
                        <div className="ex-menu">
                          {EXAMPLES.map((x) => (
                            <button key={x} onClick={() => { setDescribe(x); setShowEx(false); }}>{x}</button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="desc-row">
                  <input
                    value={describe}
                    onChange={(e) => setDescribe(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendDescribe()}
                    placeholder="e.g. Extract columns: Date, Merchant, Amount, Category"
                    aria-label="Describe what you want to extract"
                    disabled={chatBusy}
                  />
                  <button className="desc-send" aria-label="Send description" onClick={sendDescribe} disabled={chatBusy}>→</button>
                </div>

                {chatMessages.length > 0 && (
                  <div className="chat-log">
                    {chatMessages.map((m, i) => (
                      <div className={`chat-bubble ${m.role}`} key={i}>{m.content}</div>
                    ))}
                    {chatBusy && <div className="chat-bubble assistant chat-typing">…</div>}
                  </div>
                )}

                <div className="fmt-head">
                  <span>Output format</span>
                  <button className="link-btn" onClick={() => showToast("Custom formats — tell us what you need")}>
                    Need a different format? Let us know →
                  </button>
                </div>
                <div className="fmt-grid">
                  {[
                    { k: "Excel", icon: "📊", sub: "Best for analysis", soon: false },
                    { k: "CSV", icon: "📄", sub: "Universal format", soon: false },
                    { k: "JSON", icon: "{ }", sub: "For developers", soon: false },
                    { k: "Sheets", icon: "📗", sub: "Export directly", soon: true },
                  ].map((f) => (
                    <button
                      key={f.k}
                      disabled={f.soon}
                      className={`fmt-card ${outFormat === f.k ? "active" : ""} ${f.soon ? "soon" : ""}`}
                      onClick={() => setOutFormat(f.k as "Excel" | "CSV" | "JSON")}
                    >
                      <span className="fmt-icon">{f.icon}</span>
                      <span className="fmt-text"><b>{f.k}{f.k === "Excel" ? " (.xlsx)" : f.k === "CSV" ? " (.csv)" : f.k === "JSON" ? " (.json)" : ""}</b><i>{f.sub}</i></span>
                      {f.soon && <span className="soon-badge">Soon</span>}
                    </button>
                  ))}
                </div>

                <div className="adv-row">
                  <button className="adv-toggle" onClick={() => setAdvOpen(!advOpen)}>
                    ⚙ Advanced options {advOpen ? "▴" : "▾"}
                  </button>
                  <button className="convert-btn" onClick={convert} disabled={uploading}>
                    {uploading ? "Starting…" : "Convert Document →"}
                  </button>
                </div>
                {advOpen && (
                  <div className="adv-body">
                    {([
                      ["dedupe", "Remove duplicate rows"],
                      ["normalize", "Normalize dates & amounts"],
                      ["strict", "Strict verification — flag more"],
                    ] as const).map(([k, label]) => (
                      <label key={k} className="adv-check">
                        <input type="checkbox" checked={opts[k]} onChange={() => setOpts((o) => ({ ...o, [k]: !o[k] }))} />
                        {label}
                      </label>
                    ))}
                    {activePreset && <span className="format-on">✎ {activePreset} will apply</span>}
                  </div>
                )}
              </div>
            </div>

            {/* SIDEBAR */}
            <aside className="dash-side">
              <div className="usage-card">
                {plan === null ? (
                  <div className="api-loading">
                    <span className="skel" style={{ width: "55%" }} />
                    <span className="skel" style={{ width: "100%" }} />
                    <span className="skel" style={{ width: "70%" }} />
                  </div>
                ) : (
                  <>
                    <div className="usage-top"><strong>{plan.planName} plan</strong><button className="link-btn" onClick={() => router.push("/dashboard/upgrade")}>Manage</button></div>
                    <div className="progress"><div style={{ width: `${plan.pageQuota ? ((plan.pageQuota - plan.pagesRemaining) / plan.pageQuota) * 100 : 0}%` }} /></div>
                    <p className="usage-note">{(plan.pageQuota - plan.pagesRemaining).toLocaleString()} / {plan.pageQuota.toLocaleString()} pages used<br />{plan.pagesRemaining.toLocaleString()} pages left this month</p>
                    <button className="btn btn-lime btn-sm" style={{ width: "100%", justifyContent: "center" }} onClick={() => router.push("/dashboard/upgrade")}>
                      Upgrade plan
                    </button>
                  </>
                )}
              </div>

              <div className="preset-card">
                <div className="usage-top"><strong style={{ fontSize: 15 }}>Your saved formats</strong><button className="link-btn" onClick={() => setView("formats")}>See all</button></div>
                {formats.length === 0 ? (
                  <button className="chip ghost-chip" onClick={addPreset}>+ Save your first format</button>
                ) : (
                  formats.map((p) => (
                    <div className={`fmt-row ${activePreset === p.name ? "on" : ""}`} key={p.name}>
                      <span className="fmt-row-icon">🗎</span>
                      <div className="fmt-row-meta"><b>{p.name}</b><span>{p.cols}</span></div>
                      <div className="fmt-kebab">
                        <button aria-label={`Options for ${p.name}`} onClick={() => setFmtMenu(fmtMenu === p.name ? null : p.name)}>•••</button>
                        {fmtMenu === p.name && (
                          <>
                            <div className="menu-scrim" onClick={() => setFmtMenu(null)} />
                            <div className="avatar-menu fmt-menu">
                              <button onClick={() => { setActivePreset(p.name); setFmtMenu(null); showToast(`"${p.name}" will apply to your next upload`); }}>Apply</button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {formats.length > 0 && (
                  <button className="add-fmt" onClick={addPreset}>+&nbsp;&nbsp;Add new format</button>
                )}
              </div>

              <div className="preset-card">
                <div className="usage-top"><strong style={{ fontSize: 15 }}>Recent documents</strong><button className="link-btn" onClick={() => setView("history")}>See all</button></div>
                {convs.length === 0 ? (
                  <p className="preset-note">Your converted files will show up here.</p>
                ) : (
                  convs.slice(0, 4).map((c) => (
                    <div className="mini-doc" key={c.id}>
                      <span className={`file-icon sm ${FILE_TINT[c.type] ?? ""}`}>{FILE_ICON[c.type] ?? "📄"}</span>
                      <div className="recent-meta">
                        <strong>{c.name}</strong>
                        <span>{c.type} · {c.out}</span>
                      </div>
                      <span className="mini-time">
                        {c.status === "processing" ? (
                          <span className="proc">{Math.round(c.progress ?? 0)}%</span>
                        ) : (
                          <><i className={`sdot ${c.status}`} />{c.date}</>
                        )}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </aside>
          </div>
        )}

        {view === "history" && (
          <div className="dash-narrow">
            <div className="eyebrow">History</div>
            <h1 className="dash-title">All documents</h1>
            {convs.length === 0 ? (
              <div className="empty"><div className="empty-icon">⧉</div><p><strong>Nothing here yet.</strong><br />Your converted files will show up here.</p></div>
            ) : (
              <div className="recent-list hist">
                {convs.map((c) => (
                  <div className={`recent-row ${c.status === "review" ? "needs-review" : ""}`} key={c.id}>
                    <span className={`file-icon ${FILE_TINT[c.type] ?? ""}`}>{FILE_ICON[c.type] ?? "📄"}</span>
                    <div className="recent-meta"><strong>{c.name}</strong><span>{c.type} • {c.out} • {c.date}</span></div>
                    {c.status === "done" && <span className="badge badge-done">✓ Done</span>}
                    {c.status === "review" && <span className="badge badge-review">⚠ {c.flagged} flagged</span>}
                    {c.status === "processing" && <span className="badge badge-processing"><span className="mini-spin" /> {Math.round(c.progress ?? 0)}%</span>}
                    {c.status === "failed" && <span className="badge badge-failed" title={c.error}>✕ Failed</span>}
                    {c.status === "empty" && (
                      <span className="badge badge-processing" title="No rows matched this document — it may be the wrong file, or not the type it looks like">
                        No data found
                      </span>
                    )}
                    <div className="recent-actions">
                      {c.status === "review" ? (
                        <button className="mini-btn solid" onClick={() => { showToast("Flagged rows are marked in the download — inline review view isn't built yet"); downloadConv(c); }}>Review →</button>
                      ) : c.status === "done" ? (
                        <>
                          <button className="mini-btn" onClick={() => downloadConv(c)}>Download</button>
                          <button className="mini-btn ghost" onClick={() => showToast("Sharing isn't available yet")}>Share</button>
                        </>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === "formats" && (
          <div className="dash-narrow">
            <div className="eyebrow">Formats</div>
            <h1 className="dash-title">Saved formats</h1>
            <p className="dash-sub">Click Apply to use a format on your next upload — skips the customize step.</p>
            {formats.length === 0 ? (
              <div className="empty"><div className="empty-icon">✎</div><p><strong>No saved formats yet.</strong><br />Describe a format above, then save it here.</p></div>
            ) : (
              <div className="fmt-grid big">
                {formats.map((p) => (
                  <div className={`fmt-row ${activePreset === p.name ? "on" : ""}`} key={p.name}>
                    <span className="fmt-row-icon">🗎</span>
                    <div className="fmt-row-meta"><b>{p.name}</b><span>{p.cols}</span></div>
                    <div className="recent-actions">
                      <button className="mini-btn" onClick={() => { setActivePreset(p.name); showToast(`"${p.name}" will apply to your next upload`); }}>Apply</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="desc-row standalone">
              <input value={describe} onChange={(e) => setDescribe(e.target.value)} placeholder="Name a new format, e.g. “Monthly P&L columns”" aria-label="New format name" />
              <button className="mini-btn solid" onClick={addPreset}>Save format</button>
            </div>
          </div>
        )}

        {view === "api" && (
          <div className="dash-narrow">
            <div className="eyebrow">API</div>
            <h1 className="dash-title">Extract via API</h1>
            <p className="dash-sub">Send documents programmatically. Same extraction + verification engine.</p>
            <div className="api-card">
              {/* No public API-key endpoint exists on the backend yet (auth
                  is JWT-based, scoped to this dashboard) — showing a
                  realistic-looking fake endpoint/key here would be
                  fabricated data, so this states plainly that it's not
                  live yet instead. */}
              <p className="usage-note">Programmatic access isn't available yet — keys and docs ship at launch.</p>
              <button className="link-btn" onClick={() => showToast("We'll email you when API access is ready")}>Notify me →</button>
            </div>
          </div>
        )}
      </main>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
