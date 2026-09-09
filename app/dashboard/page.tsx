"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

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
  { id: 1, name: "Text_to_PDF_Onlinenotpad.pdf", type: "Bank Statement", out: "Excel", status: "done", date: "31m ago" },
  { id: 2, name: "PhonePe_Statement_Jun2026.pdf", type: "Bank Statement", out: "Excel", status: "done", date: "1h ago" },
  { id: 3, name: "Invoice_9876.pdf", type: "Invoice", out: "CSV", status: "review", flagged: 2, date: "3h ago" }
];

const EXAMPLES = [
  "Extract columns: Date, Merchant, Amount, Category",
  "One row per invoice with line-item breakdown",
  "Normalize dates to DD/MM/YYYY and remove duplicates",
  "Flag any total that doesn't reconcile"
];

const FILE_ICON: Record<string, string> = {
  "Bank Statement": "🏦",
  Invoice: "🧾",
  Receipt: "🧷"
};
const FILE_TINT: Record<string, string> = {
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

export default function Dashboard() {
  const [view, setView] = useState<"convert" | "history" | "formats" | "api">("convert");
  const [convs, setConvs] = useState<Conv[]>(SEED);
  const [forceEmpty, setForceEmpty] = useState(false);
  const [staged, setStaged] = useState<{ name: string; size: string } | null>(null);
  const [drag, setDrag] = useState(false);
  const [describe, setDescribe] = useState("");
  const [showEx, setShowEx] = useState(false);
  const [outFormat, setOutFormat] = useState<"Excel" | "CSV" | "JSON">("Excel");
  const [advOpen, setAdvOpen] = useState(false);
  const [opts, setOpts] = useState({ dedupe: true, normalize: true, strict: false });
  const [presets, setPresets] = useState([
    { name: "QuickBooks Format", cols: "Date, Merchant, Amount, Category" },
    { name: "Tax Prep", cols: "Date, Description, Amount, Type" }
  ]);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [fmtMenu, setFmtMenu] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pagesLeft, setPagesLeft] = useState(9991);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const showToast = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2600);
  };

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("empty") !== null) setForceEmpty(true);
  }, []);

  const stageFile = (f: File | null) => {
    if (!f) return;
    setStaged({ name: f.name, size: `${Math.max(1, Math.round(f.size / 1024))} KB` });
    showToast(`“${f.name}” ready — hit Convert Document`);
  };

  const convert = () => {
    if (!staged) {
      showToast("Drop a file first — then hit Convert Document");
      return;
    }
    const id = Date.now();
    const name = staged.name;
    setStaged(null);
    setPagesLeft((p) => Math.max(0, p - (1 + Math.floor(Math.random() * 30))));
    setConvs((cs) => [
      { id, name, type: "Detecting…", out: outFormat, status: "processing", date: "just now", progress: 4 },
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
      showToast(flagged ? `Done as ${outFormat} — a few rows need your eyes` : `${outFormat} ready — math checks out`);
    }, 3400);
  };

  const downloadRow = (c: Conv) => {
    const csv = `Date,Vendor,Ref,Total,Status\n02/09/26,Acme Supplies,INV-1842,4281.00,verified\n03/09/26,Bluebird Co.,INV-1844,8420.00,review\n`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = c.name.replace(/\.[^.]+$/, "") + ".csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("CSV downloaded");
  };

  const addPreset = () => {
    const v = describe.trim();
    if (!v) {
      showToast("Describe a format above first — then save it");
      return;
    }
    const name = v.length > 30 ? v.slice(0, 29) + "…" : v;
    setPresets((p) => [...p, { name, cols: "Custom columns" }]);
    setDescribe("");
    showToast(`Saved “${name}” to your formats`);
  };

  const visible = forceEmpty ? [] : convs;
  const tabs: { key: "convert" | "history" | "formats" | "api"; label: string }[] = [
    { key: "convert", label: "Convert" },
    { key: "history", label: "History" },
    { key: "formats", label: "Formats" },
    { key: "api", label: "API" }
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
            <span className="status-pill compact" title="Pages left this month">⚡{pagesLeft.toLocaleString()}</span>
            <div className="avatar-wrap">
              <button className="avatar" onClick={() => setMenuOpen(!menuOpen)} aria-label="Account menu">S</button>
              {menuOpen && (
                <>
                  <div className="menu-scrim" onClick={() => setMenuOpen(false)} />
                  <div className="avatar-menu">
                    <div className="avatar-head">
                      <strong>sonali@clep.io</strong>
                      <span>Business plan</span>
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
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => { e.preventDefault(); setDrag(false); stageFile(e.dataTransfer.files?.[0] ?? null); }}
              >
                <div className="dz-icon">🗎</div>
                {staged ? (
                  <>
                    <div className="dz-title">File ready — hit Convert below</div>
                    <div className="dz-file">
                      📄 {staged.name} • {staged.size}
                      <button
                        aria-label="Remove file"
                        onClick={(e) => { e.stopPropagation(); setStaged(null); }}
                      >
                        ×
                      </button>
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
                  accept=".pdf,.png,.jpg,.jpeg,.heic,.csv,.zip"
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
                    placeholder="e.g. Extract columns: Date, Merchant, Amount, Category"
                    aria-label="Describe what you want to extract"
                  />
                  <button className="desc-send" aria-label="Use this description" onClick={() => describe.trim() ? showToast("Description attached — applies on Convert") : showToast("Describe what you need first")}>→</button>
                </div>

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
                    { k: "Sheets", icon: "📗", sub: "Export directly", soon: true }
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
                  <button className="convert-btn" onClick={convert}>Convert Document →</button>
                </div>
                {advOpen && (
                  <div className="adv-body">
                    {([
                      ["dedupe", "Remove duplicate rows"],
                      ["normalize", "Normalize dates & amounts"],
                      ["strict", "Strict verification — flag more"]
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
                <div className="usage-top"><strong>Business plan</strong><button className="link-btn" onClick={() => showToast("Billing opens at launch")}>Manage</button></div>
                <div className="progress"><div style={{ width: "0.09%" }} /></div>
                <p className="usage-note">9 / 10,000 pages used<br />{pagesLeft.toLocaleString()} pages left this month</p>
                <button className="btn btn-lime btn-sm" style={{ width: "100%", justifyContent: "center" }} onClick={() => showToast("Upgrade opens at launch")}>
                  Upgrade plan
                </button>
              </div>

              <div className="preset-card">
                <div className="usage-top"><strong style={{ fontSize: 15 }}>Your saved formats</strong><button className="link-btn" onClick={() => setView("formats")}>See all</button></div>
                {presets.map((p) => (
                  <div className={`fmt-row ${activePreset === p.name ? "on" : ""}`} key={p.name}>
                    <span className="fmt-row-icon">🗎</span>
                    <div className="fmt-row-meta"><b>{p.name}</b><span>{p.cols}</span></div>
                    <div className="fmt-kebab">
                      <button aria-label={`Options for ${p.name}`} onClick={() => setFmtMenu(fmtMenu === p.name ? null : p.name)}>•••</button>
                      {fmtMenu === p.name && (
                        <>
                          <div className="menu-scrim" onClick={() => setFmtMenu(null)} />
                          <div className="avatar-menu fmt-menu">
                            <button onClick={() => { setActivePreset(p.name); setFmtMenu(null); showToast(`“${p.name}” will apply to your next upload`); }}>Apply</button>
                            <button onClick={() => { setPresets((ps) => ps.filter((x) => x.name !== p.name)); if (activePreset === p.name) setActivePreset(null); setFmtMenu(null); showToast("Format deleted"); }}>Delete</button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                <button className="add-fmt" onClick={addPreset}>+&nbsp;&nbsp;Add new format</button>
              </div>

              <div className="preset-card">
                <div className="usage-top"><strong style={{ fontSize: 15 }}>Recent documents</strong><button className="link-btn" onClick={() => setView("history")}>See all</button></div>
                {visible.slice(0, 4).map((c) => (
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
                ))}
                {visible.length === 0 && <p className="preset-note">Your converted files will show up here.</p>}
              </div>
            </aside>
          </div>
        )}

        {view === "history" && (
          <div className="dash-narrow">
            <div className="eyebrow">History</div>
            <h1 className="dash-title">All documents</h1>
            {visible.length === 0 ? (
              <div className="empty"><div className="empty-icon">⧉</div><p><strong>Nothing here yet.</strong><br />Your converted files will show up here.</p></div>
            ) : (
              <div className="recent-list hist">
                {visible.map((c) => (
                  <div className={`recent-row ${c.status === "review" ? "needs-review" : ""}`} key={c.id}>
                    <span className={`file-icon ${FILE_TINT[c.type] ?? ""}`}>{FILE_ICON[c.type] ?? "📄"}</span>
                    <div className="recent-meta"><strong>{c.name}</strong><span>{c.type} • {c.out} • {c.date}</span></div>
                    {c.status === "done" && <span className="badge badge-done">✓ Done</span>}
                    {c.status === "review" && <span className="badge badge-review">⚠ {c.flagged} flagged</span>}
                    {c.status === "processing" && <span className="badge badge-processing"><span className="mini-spin" /> {Math.round(c.progress ?? 0)}%</span>}
                    <div className="recent-actions">
                      {c.status === "review" ? (
                        <button className="mini-btn solid" onClick={() => showToast(`Opening review for ${c.name}…`)}>Review →</button>
                      ) : c.status === "done" ? (
                        <>
                          <button className="mini-btn" onClick={() => downloadRow(c)}>Download</button>
                          <button className="mini-btn ghost" onClick={() => { navigator.clipboard?.writeText(`https://clep.io/s/${c.id}`).catch(() => {}); showToast("Share link copied"); }}>Share</button>
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
            <div className="fmt-grid big">
              {presets.map((p) => (
                <div className={`fmt-row ${activePreset === p.name ? "on" : ""}`} key={p.name}>
                  <span className="fmt-row-icon">🗎</span>
                  <div className="fmt-row-meta"><b>{p.name}</b><span>{p.cols}</span></div>
                  <div className="recent-actions">
                    <button className="mini-btn" onClick={() => { setActivePreset(p.name); showToast(`“${p.name}” will apply to your next upload`); }}>Apply</button>
                    <button className="mini-btn ghost" onClick={() => { setPresets((ps) => ps.filter((x) => x.name !== p.name)); showToast("Format deleted"); }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
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
              <div className="api-row"><span>Endpoint</span><code>POST https://api.clep.io/v1/extract</code>
                <button className="mini-btn" onClick={() => { navigator.clipboard?.writeText("https://api.clep.io/v1/extract").catch(() => {}); showToast("Endpoint copied"); }}>Copy</button>
              </div>
              <div className="api-row"><span>Test key</span><code>ck_live_••••••••3f9a</code>
                <button className="mini-btn" onClick={() => showToast("Test key copied — keep it secret")}>Copy</button>
              </div>
              <button className="link-btn" onClick={() => showToast("API docs ship at launch")}>Read the docs →</button>
            </div>
          </div>
        )}
      </main>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
