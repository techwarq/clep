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
  out: string;
  status: Status;
  flagged?: number;
  date: string;
  progress?: number;
  error?: string;
};

// documentType, as classified by the backend, only exists once a job has
// left "parsing" — the filename heuristic below is what covers it before
// that and for the lightweight GET /jobs list (which doesn't include it).
const DOC_TYPE_LABEL: Record<string, string> = {
  statement: "Bank Statement",
  invoice: "Invoice",
  receipt: "Receipt",
};

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
// not the same as a successful conversion, so it gets its own status
// rather than rendering identically to "done" with an active Download
// button that'd just 400.
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
// "parsing" (see routes/jobs.ts's live GET /jobs/:id response), totalPages
// is only known once parsing finishes. Good enough for a progress bar, not
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

const SUGGEST = ["Date · Merchant · Amount", "+ Category column", "Monthly tabs"];

const PRESETS = ["QuickBooks Format", "Tax Prep"];

const TYPE_ICON: Record<string, string> = {
  "Bank Statement": "🏦",
  Invoice: "🧾",
  Receipt: "🧷"
};

const TYPE_TINT: Record<string, string> = {
  "Bank Statement": "t-bank",
  Invoice: "t-inv",
  Receipt: "t-rcpt"
};

function detectType(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("invoice") || n.includes("inv_")) return "Invoice";
  if (n.includes("receipt") || n.includes("rcpt")) return "Receipt";
  return "Bank Statement";
}

function short(name: string): string {
  return name.length > 22 ? name.slice(0, 21) + "…" : name;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [convs, setConvs] = useState<Conv[]>([]);
  const convsRef = useRef<Conv[]>([]);
  const [forceEmpty, setForceEmpty] = useState(false);
  const [presets, setPresets] = useState<string[]>(PRESETS);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [format, setFormat] = useState("Excel");
  const [drag, setDrag] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Staging: files are selected/uploaded first, extraction only starts once
  // the user hits "Start" — lets multiple files go into one batch, and
  // makes the /chat customization step (see lib/api.ts's sendChatMessage)
  // an actual back-and-forth instead of a single note fired silently right
  // before extract.
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [stagedJobId, setStagedJobId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [startBusy, setStartBusy] = useState(false);

  const limit = plan?.pageQuota ?? 0;
  const left = plan?.pagesRemaining ?? 0;
  const used = limit - left;

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

    // hidden design-review hook, never shown in UI: /dashboard?empty
    if (new URLSearchParams(window.location.search).get("empty") !== null) setForceEmpty(true);
  }, [router]);

  // Polls every in-flight job every 3s until it reaches a terminal status.
  // Reads convsRef (not convs directly) so this effect runs once for the
  // component's lifetime instead of re-subscribing on every state update.
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

  const resetStaging = () => {
    setPendingFiles([]);
    setStagedJobId(null);
    setChatMessages([]);
    setChatInput("");
  };

  // Files are picked/dropped without hitting the backend at all — just
  // collected locally so more can be added before anything is created.
  // Locked once a job exists (stagedJobId set): the backend has no "add a
  // file to an existing job" endpoint, so a job's file list is fixed at
  // creation.
  const addFiles = (incoming: FileList | File[]) => {
    if (stagedJobId) return;
    const files = Array.from(incoming);
    if (files.length === 0) return;
    setPendingFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    if (stagedJobId) return;
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Creates the job and uploads every staged file exactly once — both
  // "send a chat message" and "click Start" need the job to exist first
  // (chat samples the uploaded file's content), so both call this and it
  // no-ops after the first successful call.
  const ensureStagedJob = async (): Promise<string> => {
    if (stagedJobId) return stagedJobId;
    const created = await createJob(
      pendingFiles.map((f) => ({ name: f.name, contentType: f.type || "application/pdf" })),
    );
    await Promise.all(
      created.uploads.map((u) => uploadToPresignedUrl(u.uploadUrl, pendingFiles[u.fileIndex])),
    );
    setStagedJobId(created.jobId);
    return created.jobId;
  };

  const sendChat = async () => {
    const message = chatInput.trim();
    if (!message || chatBusy) return;
    setChatBusy(true);
    setChatMessages((m) => [...m, { role: "user", content: message }]);
    setChatInput("");
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

  const handleStart = async () => {
    if (pendingFiles.length === 0 || startBusy) return;
    const names = pendingFiles.map((f) => f.name);
    const chosenFormat = format;
    setStartBusy(true);
    try {
      const jobId = await ensureStagedJob();
      await startExtract(jobId);
      setConvs((cs) => [
        {
          id: jobId,
          name: names[0] + (names.length > 1 ? ` +${names.length - 1} more` : ""),
          type: "Detecting…",
          out: chosenFormat,
          status: "processing",
          date: "just now",
          progress: 5,
        },
        ...cs,
      ]);
      showToast(`${names.length > 1 ? `${names.length} files` : short(names[0])} — processing started`);
      resetStaging();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Couldn't start processing");
    } finally {
      setStartBusy(false);
    }
  };

  const downloadRow = async (c: Conv) => {
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

  const visible = forceEmpty ? [] : convs;

  return (
    <>
      {/* TOP BAR */}
      <div className="nav">
        <div className="nav-inner">
          <Link className="brand" href="/" aria-label="clep — home">
            <Image src="/logo.png" alt="clep" width={760} height={413} className="brand-logo" priority />
          </Link>
          <nav className="nav-links">
            <span className="nav-link-active">Convert</span>
            <Link href="/dashboard/upgrade">Pricing</Link>
          </nav>
          <div className="nav-actions">
            <span className="status-pill compact" title={`${left} conversions left this month`}>
              ⚡{left}
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
                      <span>{plan ? `${plan.planName} plan` : "Loading…"}</span>
                    </div>
                    <button onClick={() => { setMenuOpen(false); showToast("Settings open at launch"); }}>Settings</button>
                    <button onClick={() => { setMenuOpen(false); showToast("Billing opens at launch"); }}>Billing</button>
                    <button onClick={() => { setMenuOpen(false); clearSession(); window.location.href = "/login"; }}>Logout</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="wrap dash">
        <div className="dash-grid">
          {/* MAIN */}
          <div className="dash-main">
            <div className="dash-eyebrow">Turn documents into data</div>
            <h1 className="dash-title">Convert a document into a structured spreadsheet</h1>
            <p className="dash-sub">Upload your document, describe what you need, and get clean, structured data back.</p>

            {/* DROPZONE */}
            <div className="upload-card">
              {pendingFiles.length === 0 ? (
                <>
                  <div
                    className={`dash-drop ${drag ? "drag" : ""}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => inputRef.current?.click()}
                    onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
                  >
                    <div className="dash-drop-icon">📄</div>
                    <div className="dash-drop-text">Drag &amp; drop files here, or <u>click to browse</u></div>
                    <div className="dash-drop-sub">PDF, JPG, PNG — bank statements, invoices, receipts. Multiple files go into one batch.</div>
                  </div>
                  <div className="feature-row">
                    <div className="feature-item">
                      <span className="feature-icon">🔒</span>
                      <div><strong>Secure &amp; private</strong><span>Your files are encrypted</span></div>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">⚡</span>
                      <div><strong>Fast processing</strong><span>Get results in seconds</span></div>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">📑</span>
                      <div><strong>Supports messy docs</strong><span>Scans, photos, multi-page</span></div>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">✓</span>
                      <div><strong>No setup needed</strong><span>Just upload and go</span></div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="pending-files">
                  {pendingFiles.map((f, i) => (
                    <div className="pending-file-row" key={`${f.name}-${i}`}>
                      <span className="file-icon">📄</span>
                      <span className="pending-file-name">{f.name}</span>
                      {!stagedJobId && (
                        <button className="mini-btn ghost" onClick={() => removeFile(i)} aria-label={`Remove ${f.name}`}>×</button>
                      )}
                    </div>
                  ))}
                  {!stagedJobId && (
                    <button className="mini-btn ghost" onClick={() => inputRef.current?.click()}>
                      + Add another file
                    </button>
                  )}
                </div>
              )}

              {pendingFiles.length > 0 && (
                <>
                  {/* CHAT — describe a custom output schema before starting.
                      First message lazily creates the job (see
                      ensureStagedJob) so the backend has file content to
                      sample against. */}
                  <div className="chat-box">
                    {chatMessages.length > 0 && (
                      <div className="chat-log">
                        {chatMessages.map((m, i) => (
                          <div className={`chat-bubble ${m.role}`} key={i}>{m.content}</div>
                        ))}
                        {chatBusy && <div className="chat-bubble assistant chat-typing">…</div>}
                      </div>
                    )}
                    <div className="chat-input-row">
                      <span className="chat-input-icon" aria-hidden>✨</span>
                      <input
                        className="chat-input"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendChat()}
                        placeholder={chatMessages.length > 0 ? "Ask for another change…" : "Describe what you want to extract (optional)"}
                        aria-label="Describe how you want your spreadsheet formatted."
                        disabled={chatBusy}
                      />
                      <button
                        className="chat-send-btn"
                        onClick={sendChat}
                        disabled={chatBusy || !chatInput.trim()}
                        aria-label="Send"
                      >
                        →
                      </button>
                    </div>
                    <div className="sugg-row">
                      {SUGGEST.map((s) => (
                        <button key={s} onClick={() => setChatInput(s)}>+ {s}</button>
                      ))}
                    </div>
                  </div>

                  <div className="format-block">
                    <div className="format-head">
                      <span>Output format</span>
                    </div>
                    <div className="format-cards">
                      <button className={`format-card ${format === "Excel" ? "active" : ""}`} onClick={() => setFormat("Excel")}>
                        <span className="format-card-icon">📗</span>
                        <strong>Excel (.xlsx)</strong>
                        <span>Best for analysis</span>
                      </button>
                      <button className={`format-card ${format === "CSV" ? "active" : ""}`} onClick={() => setFormat("CSV")}>
                        <span className="format-card-icon">📄</span>
                        <strong>CSV (.csv)</strong>
                        <span>Universal format</span>
                      </button>
                      <button className={`format-card ${format === "JSON" ? "active" : ""}`} onClick={() => setFormat("JSON")}>
                        <span className="format-card-icon">{"{ }"}</span>
                        <strong>JSON (.json)</strong>
                        <span>For developers</span>
                      </button>
                      <button className="format-card disabled" disabled title="Coming soon">
                        <span className="format-card-icon">📊</span>
                        <strong>Google Sheets</strong>
                        <span className="format-card-soon">Soon</span>
                      </button>
                    </div>
                  </div>

                  <div className="stage-actions">
                    <button className="link-btn" onClick={resetStaging} disabled={startBusy}>
                      Cancel
                    </button>
                    <button className="convert-btn" onClick={handleStart} disabled={startBusy}>
                      {startBusy
                        ? "Starting…"
                        : `Convert Document${pendingFiles.length > 1 ? ` (${pendingFiles.length} files)` : ""} →`}
                    </button>
                  </div>
                </>
              )}
            </div>
            <input
              ref={inputRef}
              className="hidden-input"
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.heic"
              onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }}
            />

            {/* RECENT */}
            <div className="recent-head" id="recent-list">
              <h2>Recent</h2>
            </div>

            {visible.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">⧉</div>
                <p><strong>Nothing here yet.</strong><br />Your converted files will show up here.</p>
              </div>
            ) : (
              <div className="recent-list">
                {visible.map((c) => (
                  <div className={`recent-row ${c.status === "review" ? "needs-review" : ""}`} key={c.id}>
                    <span className={`file-icon ${TYPE_TINT[c.type] ?? ""}`}>{TYPE_ICON[c.type] ?? "📄"}</span>
                    <div className="recent-meta">
                      <strong>{c.name}</strong>
                      <span>{c.type} • {c.out} • {c.date}</span>
                    </div>
                    {c.status === "done" && <span className="badge badge-done">✓ Done</span>}
                    {c.status === "review" && (
                      <span className="badge badge-review">⚠ {c.flagged} flagged row{c.flagged === 1 ? "" : "s"}</span>
                    )}
                    {c.status === "processing" && (
                      <span className="badge badge-processing">
                        <span className="mini-spin" /> {Math.round(c.progress ?? 0)}%
                      </span>
                    )}
                    {c.status === "failed" && (
                      <span className="badge badge-failed" title={c.error}>✕ Failed</span>
                    )}
                    {c.status === "empty" && (
                      <span className="badge badge-processing" title="No rows matched this document — it may be the wrong file, or not the type it looks like">
                        No data found
                      </span>
                    )}
                    <div className="recent-actions">
                      {c.status === "review" ? (
                        <button
                          className="mini-btn solid"
                          onClick={() => {
                            showToast("Flagged rows are marked in the download — inline review view isn't built yet");
                            downloadRow(c);
                          }}
                        >
                          Review →
                        </button>
                      ) : c.status === "done" ? (
                        <>
                          <button className="mini-btn" onClick={() => downloadRow(c)}>Download</button>
                          <button
                            className="mini-btn ghost"
                            onClick={() => {
                              navigator.clipboard?.writeText(`https://clep.io/s/${c.id}`).catch(() => {});
                              showToast("Share link copied");
                            }}
                          >
                            Share
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="dash-side">
            <div className="usage-card">
              <div className="usage-top">
                <strong>{plan ? `${plan.planName} plan` : "Loading…"}</strong>
                <button className="link-btn" onClick={() => showToast("Billing management ships soon")}>Manage</button>
              </div>
              <div className="progress"><div style={{ width: `${limit > 0 ? (used / limit) * 100 : 0}%` }} /></div>
              <p className="usage-note">{used} / {limit} pages used · {left} left this month.</p>
              <button
                className="btn btn-lime btn-sm"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={() => router.push("/dashboard/upgrade")}
              >
                Upgrade plan
              </button>
            </div>

            <div className="preset-card">
              <h3>Your saved formats</h3>
              {presets.length === 0 ? (
                <button className="chip ghost-chip" onClick={() => showToast("Formatting presets ship at launch")}>
                  + Save your first format
                </button>
              ) : (
                <div className="chip-row">
                  {presets.map((p) => (
                    <button
                      key={p}
                      className={`chip ${activePreset === p ? "active" : ""}`}
                      onClick={() => {
                        setActivePreset(activePreset === p ? null : p);
                        showToast(activePreset === p ? "Preset cleared" : `“${p}” will apply to your next upload`);
                      }}
                    >
                      {p}
                    </button>
                  ))}
                  <button className="chip ghost-chip" onClick={() => showToast("Custom formats ship at launch")}>+</button>
                </div>
              )}
              <p className="preset-note">Click a format to apply it to your next upload — skips the customize step.</p>
            </div>

            <div className="preset-card">
              <div className="sidebar-card-head">
                <h3>Recent documents</h3>
                {convs.length > 3 && <a className="link-btn" href="#recent-list">See all</a>}
              </div>
              {convs.length === 0 ? (
                <p className="preset-note">Nothing yet — your converted files will show up here.</p>
              ) : (
                <div className="recent-mini-list">
                  {convs.slice(0, 3).map((c) => (
                    <a className="recent-mini-item" href="#recent-list" key={c.id}>
                      <span className={`file-icon ${TYPE_TINT[c.type] ?? ""}`}>{TYPE_ICON[c.type] ?? "📄"}</span>
                      <div className="recent-mini-meta">
                        <strong>{short(c.name)}</strong>
                        <span>{c.type} • {c.out} • {c.date}</span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
