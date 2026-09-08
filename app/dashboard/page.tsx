"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SegmentedTabs from "../../components/SegmentedTabs";

type Status = "done" | "review" | "processing";

type Conv = {
  id: number;
  name: string;
  type: string;
  out: string;
  status: Status;
  flagged?: number;
  date: string;
  progress?: number;
};

const SEED: Conv[] = [
  { id: 1, name: "statement_march.pdf", type: "Bank Statement", out: "Excel", status: "done", date: "2m ago" },
  { id: 2, name: "invoice_042.pdf", type: "Invoice", out: "QuickBooks", status: "review", flagged: 2, date: "1h ago" }
];

const GHOSTS = [
  "Describe your sheet: “Columns: Date, Merchant, Amount”",
  "Describe your sheet: “Add a Category column”",
  "Describe your sheet: “One tab per month”",
  "Describe your sheet: “Match my QuickBooks columns”"
];

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
  const [convs, setConvs] = useState<Conv[]>(SEED);
  const [forceEmpty, setForceEmpty] = useState(false);
  const [presets, setPresets] = useState<string[]>(PRESETS);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [format, setFormat] = useState("Excel");
  const [attached, setAttached] = useState<string | null>(null);
  const [sampleName, setSampleName] = useState<string | null>(null);
  const sampleRef = useRef<HTMLInputElement>(null);
  const [gi, setGi] = useState(0);
  const [drag, setDrag] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const used = 23;
  const limit = 50;
  const left = limit - used;

  const showToast = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2600);
  };

  useEffect(() => {
    const t = window.setInterval(() => setGi((i) => (i + 1) % GHOSTS.length), 2600);
    // hidden design-review hook, never shown in UI: /dashboard?empty
    if (new URLSearchParams(window.location.search).get("empty") !== null) setForceEmpty(true);
    return () => window.clearInterval(t);
  }, []);

  const attachNote = () => {
    const v = note.trim();
    if (!v) return;
    setAttached(v);
    setNote("");
    showToast("Format note saved — applies to your next upload");
  };

  const addUpload = (f: File | null) => {
    const id = Date.now();
    const name = f?.name ?? "pasted-document.pdf";
    setConvs((cs) => [
      { id, name, type: "Detecting…", out: format, status: "processing", date: "just now", progress: 4 },
      ...cs
    ]);
    const tick = window.setInterval(() => {
      setConvs((cs) =>
        cs.map((r) => (r.id === id ? { ...r, progress: Math.min(96, (r.progress ?? 0) + 8 + Math.random() * 18) } : r))
      );
    }, 320);
    window.setTimeout(() => {
      window.clearInterval(tick);
      const flagged = Math.random() > 0.55;
      setConvs((cs) =>
        cs.map((r) =>
          r.id === id
            ? {
                ...r,
                status: flagged ? "review" : "done",
                flagged: flagged ? 1 + Math.floor(Math.random() * 3) : undefined,
                type: detectType(name),
                progress: 100
              }
            : r
        )
      );
      showToast(
        flagged
          ? `Done as ${format}${sampleName ? ` (matched to ${short(sampleName)})` : ""} — a few rows need your eyes`
          : `${format} ready — math checks out${attached ? " · custom format applied" : ""}${sampleName ? ` · matched to ${short(sampleName)}` : ""}`
      );
    }, 3400);
  };

  const downloadRow = (c: Conv) => {
    const csv = `Date,Description,Amount,Balance\n03/01,Opening Balance,,12480.20\n03/03,Sample row from ${c.name},10630.80,23111.00\n`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = c.name.replace(/\.[^.]+$/, "") + ".csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("CSV downloaded");
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
          <div className="nav-actions">
            <span className="status-pill compact" title={`${left} conversions left this month`}>
              ⚡{left}
            </span>
            <div className="avatar-wrap">
              <button className="avatar" onClick={() => setMenuOpen(!menuOpen)} aria-label="Account menu">
                S
              </button>
              {menuOpen && (
                <>
                  <div className="menu-scrim" onClick={() => setMenuOpen(false)} />
                  <div className="avatar-menu">
                    <div className="avatar-head">
                      <strong>sonali@clep.io</strong>
                      <span>Starter plan</span>
                    </div>
                    <button onClick={() => { setMenuOpen(false); showToast("Settings open at launch"); }}>Settings</button>
                    <button onClick={() => { setMenuOpen(false); showToast("Billing opens at launch"); }}>Billing</button>
                    <button onClick={() => { setMenuOpen(false); window.location.href = "/login"; }}>Logout</button>
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
            <h1 className="dash-title">Convert a document</h1>

            {/* DROPZONE */}
            <div className="upload-card">
              <div
                className={`dash-drop ${drag ? "drag" : ""}`}
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => { e.preventDefault(); setDrag(false); addUpload(e.dataTransfer.files?.[0] ?? null); }}
              >
                <div className="dash-drop-icon">⇪</div>
                <div className="dash-drop-text">Drop a file, or <u>click to browse</u></div>
                <div className="dash-drop-sub">PDF, JPG, PNG — bank statements, invoices, receipts</div>
              </div>
              <div className="note-row">
                <span className="note-icon" aria-hidden>✎</span>
                <input
                  className="ghost-input"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && attachNote()}
                  placeholder={GHOSTS[gi]}
                  aria-label="Describe how you want your spreadsheet formatted."
                />
                <button
                  className="attach-btn"
                  onClick={() => sampleRef.current?.click()}
                  title="Upload a sample sheet — we'll copy its format"
                  aria-label="Upload a sample sheet to copy its format"
                >
                  📎
                </button>
                <input
                  ref={sampleRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden-input"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (!f) return;
                    setSampleName(f.name);
                    showToast(`“${f.name}” saved — next uploads will copy its format`);
                  }}
                />
                {note.trim() && (
                  <button className="note-send" onClick={attachNote}>Attach</button>
                )}
              </div>
              <div className="format-block">
                <div className="format-head">
                  <span>Output format</span>
                  {attached && <span className="format-on">✎ custom note on</span>}
                </div>
                <SegmentedTabs
                  options={[
                    { key: "Excel", label: "Excel" },
                    { key: "CSV", label: "CSV" },
                    { key: "QuickBooks", label: "QuickBooks" }
                  ]}
                  value={format}
                  onChange={setFormat}
                />
                <div className="sugg-row">
                  {SUGGEST.map((s) => (
                    <button key={s} onClick={() => setNote(s)}>+ {s}</button>
                  ))}
                </div>
                {(attached || sampleName) && (
                  <div className="attached-col">
                    {attached && (
                      <div className="format-attached">
                        <span>✎ “{attached}”</span>
                        <button onClick={() => { setAttached(null); showToast("Format note removed"); }} aria-label="Remove format note">×</button>
                      </div>
                    )}
                    {sampleName && (
                      <div className="format-attached">
                        <span>📎 {sampleName}</span>
                        <button onClick={() => { setSampleName(null); showToast("Sample format removed"); }} aria-label="Remove sample format">×</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <input
              ref={inputRef}
              className="hidden-input"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.heic"
              onChange={(e) => { addUpload(e.target.files?.[0] ?? null); e.target.value = ""; }}
            />

            {/* RECENT */}
            <div className="recent-head">
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
                    <div className="recent-actions">
                      {c.status === "review" ? (
                        <button className="mini-btn solid" onClick={() => showToast(`Opening review for ${c.name}…`)}>Review →</button>
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
                <strong>Starter plan</strong>
                <span>{used} / {limit} used</span>
              </div>
              <div className="progress"><div style={{ width: `${(used / limit) * 100}%` }} /></div>
              <p className="usage-note">{left} conversions left this month.</p>
              <button className="btn btn-lime btn-sm" style={{ width: "100%", justifyContent: "center" }} onClick={() => showToast("Upgrade opens at launch")}>
                Upgrade
              </button>
              <button className="link-btn" onClick={() => showToast("Billing opens at launch")}>Manage billing</button>
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
          </aside>
        </div>
      </main>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
