"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SegmentedTabs from "./SegmentedTabs";

type Row = {
  date: string;
  vendor: string;
  ref: string;
  total: string;
  flagged?: boolean;
  note?: string;
};

type Sample = {
  label: string;
  file: string;
  stats: { extracted: string; verified: string; review: string };
  rows: Row[];
};

const SAMPLES: Record<string, Sample> = {
  statement: {
    label: "Statement",
    file: "487-page-bank-statement.pdf • 487 pages",
    stats: { extracted: "8,241", verified: "8,103", review: "138" },
    rows: [
      { date: "02/09/26", vendor: "Acme Supplies", ref: "INV-1842", total: "$4,281.00" },
      { date: "03/09/26", vendor: "Northstar Ltd", ref: "INV-1843", total: "$1,920.00" },
      { date: "03/09/26", vendor: "Bluebird Co.", ref: "INV-1844", total: "$8,420.00", flagged: true, note: "Page 87 · Total does not reconcile with subtotal + tax." },
      { date: "04/09/26", vendor: "Acme Supplies", ref: "INV-1845", total: "$3,190.00" }
    ]
  },
  invoices: {
    label: "Invoices",
    file: "invoice-bundle.pdf • 34 pages",
    stats: { extracted: "312", verified: "305", review: "7" },
    rows: [
      { date: "05/09/26", vendor: "Fabrikam", ref: "INV-2201", total: "$940.00" },
      { date: "05/09/26", vendor: "Contoso", ref: "INV-2202", total: "$12,400.00" },
      { date: "06/09/26", vendor: "Fabrikam", ref: "INV-2203", total: "$940.00", flagged: true, note: "Duplicate of INV-2201 · amounts match exactly." },
      { date: "06/09/26", vendor: "Globex", ref: "INV-2204", total: "$2,310.50" }
    ]
  },
  receipts: {
    label: "Receipts",
    file: "receipts-january.zip • 28 photos",
    stats: { extracted: "96", verified: "91", review: "5" },
    rows: [
      { date: "04/01/26", vendor: "Whole Foods", ref: "—", total: "$132.54" },
      { date: "11/01/26", vendor: "Shell", ref: "—", total: "$48.20" },
      { date: "18/01/26", vendor: "Staples", ref: "—", total: "$214.99", flagged: true, note: "Faded print · total inferred from subtotal + tax." },
      { date: "25/01/26", vendor: "Uber", ref: "—", total: "$22.40" }
    ]
  },
  report: {
    label: "Report",
    file: "vendor-report-scan.jpg • 12 pages",
    stats: { extracted: "1,204", verified: "1,189", review: "15" },
    rows: [
      { date: "Q3", vendor: "Globex", ref: "PO-881", total: "$18,200.00" },
      { date: "Q3", vendor: "Initech", ref: "PO-882", total: "$4,975.00" },
      { date: "Q4", vendor: "Globex", ref: "PO-901", total: "$18,200.00", flagged: true, note: "Repeated header row · possible carry-over from Q3." },
      { date: "Q4", vendor: "Umbrella", ref: "PO-902", total: "$9,610.00" }
    ]
  }
};

const DEFAULT_PROMPT =
  "Extract date, vendor, invoice number, subtotal, tax, total, and payment status. Put each invoice on its own row. Normalize dates and amounts. Remove duplicates. Flag anything you can't verify.";

const STEPS = [
  "Finding the structure…",
  "Extracting the data…",
  "Normalizing fields…",
  "Checking totals & balances…",
  "Isolating exceptions…"
];

function SkeletonRow() {
  return (
    <tr className="skel-row" aria-hidden>
      <td><span className="skel" style={{ width: 56 }} /></td>
      <td><span className="skel" style={{ width: "78%" }} /></td>
      <td><span className="skel" style={{ width: 70 }} /></td>
      <td><span className="skel" style={{ width: 70 }} /></td>
      <td><span className="skel" style={{ width: 64 }} /></td>
    </tr>
  );
}

function CountUp({ value }: { value: string }) {
  const target = parseInt(value.replace(/[^0-9]/g, ""), 10) || 0;
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const dur = 900;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return <>{n.toLocaleString("en-US")}</>;
}

export default function DemoWidget({ onToast }: { onToast: (m: string) => void }) {
  const [sampleKey, setSampleKey] = useState<keyof typeof SAMPLES>("statement");
  const [fileName, setFileName] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "scanning" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [scanIdx, setScanIdx] = useState(-1);
  const [rows, setRows] = useState<Row[]>(SAMPLES.statement.rows);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [drag, setDrag] = useState(false);
  const timers = useRef<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const runConversion = useCallback(
    (key: keyof typeof SAMPLES, customName?: string) => {
      clear();
      const data = SAMPLES[key];
      setSampleKey(key);
      setRows(data.rows);
      setFileName(customName ?? data.file);
      setPhase("scanning");
      setProgress(4);
      setStepIdx(0);
      setScanIdx(0);

      STEPS.forEach((_, i) => {
        timers.current.push(
          window.setTimeout(() => {
            setStepIdx(i);
            setProgress(8 + Math.round(((i + 1) / STEPS.length) * 88));
            setScanIdx(Math.min(i + 1, data.rows.length - 1));
          }, 450 * (i + 1))
        );
      });
      timers.current.push(
        window.setTimeout(() => {
          setPhase("done");
          setProgress(100);
          setScanIdx(-1);
        }, 450 * (STEPS.length + 1))
      );
    },
    []
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    runConversion(sampleKey, f ? `${f.name} • ${(f.size / 1024).toFixed(0)} KB` : undefined);
    onToast("File received — extracting in your browser…");
  };

  const download = (fmt: "csv" | "json") => {
    const mapped = rows.map((r) => ({
      date: r.date,
      vendor: r.vendor,
      ref: r.ref,
      total: r.total,
      status: r.flagged ? "review" : "verified",
      note: r.flagged ? r.note ?? "" : ""
    }));
    const content =
      fmt === "csv"
        ? "Date,Vendor,Ref,Total,Status,Note\n" +
          mapped.map((r) => [r.date, `"${r.vendor}"`, r.ref, r.total, r.status, `"${r.note}"`].join(",")).join("\n")
        : JSON.stringify(mapped, null, 2);
    const blob = new Blob([content], { type: fmt === "csv" ? "text/csv" : "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clep-export.${fmt}`;
    a.click();
    URL.revokeObjectURL(url);
    onToast(`${fmt.toUpperCase()} downloaded`);
  };

  const editCell = (ri: number, key: keyof Row, val: string) => {
    setRows((prev) => prev.map((r, i) => (i === ri ? { ...r, [key]: val } : r)));
  };

  const active = SAMPLES[sampleKey];
  const flagged = rows.find((r) => r.flagged);

  return (
    <div className="demo-shell" id="demo">
      <div className="demo-topbar">
        <div className="traffic">
          <i style={{ background: "#FF5F57" }} />
          <i style={{ background: "#FEBC2E" }} />
          <i style={{ background: "#28C840" }} />
          <span className="topbar-url" style={{ marginLeft: 10 }}>app.clep.io — live conversion</span>
        </div>
        <span className="live">
          <b /> {phase === "scanning" ? "EXTRACTING" : phase === "done" ? "VERIFIED" : "LIVE DEMO"}
        </span>
      </div>

      <div className="demo-grid">
        {/* LEFT */}
        <div className="drop-pane">
          <div
            className={`dropzone ${drag ? "drag" : ""}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          >
            <div className="drop-icon">⇪</div>
            <div style={{ fontWeight: 800 }}>Drag a document here or click to browse</div>
            <div style={{ fontSize: 13, color: "#55605b", marginTop: 6 }}>
              PDF, scanned PDF, image, photo, screenshot
            </div>
            <div style={{ marginTop: 10 }}>
              <span className="kbd">no signup needed</span>
            </div>
          </div>
          <input
            ref={inputRef}
            className="hidden-input"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.heic,.csv,.zip"
            onChange={(e) => {
              const f = e.target.files?.[0];
              runConversion(sampleKey, f ? `${f.name} • ${(f.size / 1024).toFixed(0)} KB` : undefined);
            }}
          />

          <SegmentedTabs
            options={(Object.keys(SAMPLES) as (keyof typeof SAMPLES)[]).map((k) => ({
              key: k,
              label: SAMPLES[k].label
            }))}
            value={sampleKey}
            onChange={(k) => runConversion(k as keyof typeof SAMPLES)}
          />

          <div className="prompt-box">
            <div className="prompt-head">Tell Clep what you want</div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              aria-label="Describe the data you want extracted"
            />
          </div>

          <div className="doc-preview">
            {phase === "scanning" && <div className="scan-laser" />}
            <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 12 }}>
              {fileName ?? active.file}
            </div>
            <div className="doc-paper">
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800 }}>
                <span>SOURCE</span>
                <span>··· pg 1</span>
              </div>
              {rows.map((r, i) => (
                <div
                  key={i}
                  className={`scan-row ${phase === "scanning" && i <= scanIdx ? "scanning" : ""} ${
                    phase === "done" ? "done" : ""
                  }`}
                  style={{ display: "flex", justifyContent: "space-between", gap: 8 }}
                >
                  <span style={{ color: "#5a6660" }}>{r.date}</span>
                  <span style={{ flex: 1, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {r.vendor}
                  </span>
                  <span style={{ fontFamily: "var(--mono)" }}>{r.total}</span>
                </div>
              ))}
              <div className="doc-line" style={{ width: "60%" }} />
              <div className="doc-line" style={{ width: "40%" }} />
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="sheet-pane">
          <div className="conv-head">
            <strong>Structured data</strong>
            <span className="conv-meta">
              {phase === "done"
                ? `${active.stats.extracted} rows`
                : phase === "scanning"
                  ? `${progress}%`
                  : "waiting for file…"}
            </span>
          </div>
          <div className={`progress ${phase === "scanning" ? "loading" : ""}`}>
            <div style={{ width: `${progress}%` }} />
          </div>

          {phase === "done" ? (
            <div className="stat-row" key={sampleKey}>
              <div><b><CountUp value={active.stats.extracted} /></b><span>extracted</span></div>
              <div><b className="good"><CountUp value={active.stats.verified} /></b><span>verified</span></div>
              <div><b className="warn"><CountUp value={active.stats.review} /></b><span>need review</span></div>
            </div>
          ) : (
            <ol className="conv-steps">
              {STEPS.map((s, i) => {
                const done = phase === "scanning" && i < stepIdx;
                const act = phase === "scanning" && i === stepIdx;
                return (
                  <li key={s} className={done ? "done" : act ? "active" : ""}>
                    {done ? <span className="tick">✓</span> : act ? <span className="spin" /> : <span className="tick" />}
                    {s}
                  </li>
                );
              })}
            </ol>
          )}

          <div className="table-wrap">
            <table className="sheet">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Vendor</th>
                  <th>Invoice #</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {phase === "idle"
                  ? [0, 1, 2, 3].map((i) => <SkeletonRow key={i} />)
                  : rows.map((r, i) =>
                      phase === "done" || i <= scanIdx ? (
                        <tr key={`${sampleKey}-${i}`} className="row-in">
                          <td>
                            <input value={r.date} onChange={(e) => editCell(i, "date", e.target.value)} />
                          </td>
                          <td>
                            <input
                              value={r.vendor}
                              style={{ minWidth: 130 }}
                              onChange={(e) => editCell(i, "vendor", e.target.value)}
                            />
                          </td>
                          <td>
                            <input value={r.ref} onChange={(e) => editCell(i, "ref", e.target.value)} />
                          </td>
                          <td>
                            <input value={r.total} onChange={(e) => editCell(i, "total", e.target.value)} />
                          </td>
                          <td>
                            {phase === "done" ? (
                              r.flagged ? (
                                <span className="flag" title={r.note}>⚠ review</span>
                              ) : (
                                <span className="ok">✓ verified</span>
                              )
                            ) : (
                              <span className="skel" style={{ width: 52 }} />
                            )}
                          </td>
                        </tr>
                      ) : (
                        <SkeletonRow key={`${sampleKey}-${i}`} />
                      )
                    )}
              </tbody>
            </table>
          </div>

          {phase === "done" && flagged?.note && (
            <div className="review-callout">
              <strong>Review</strong>
              <span>{flagged.note}</span>
            </div>
          )}

          <div className="sheet-actions">
            <button className="btn btn-lime btn-sm" onClick={() => download("csv")}>
              ⤓ Excel
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => download("csv")}>
              CSV
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => download("json")}>
              JSON
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => onToast("Google Sheets export ships at launch")}
            >
              Sheets
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                navigator.clipboard?.writeText("https://clep.io/api/demo-extract").catch(() => {});
                onToast("API endpoint copied");
              }}
            >
              API
            </button>
          </div>
          <div style={{ fontSize: 12, color: "#55605b", marginTop: 10 }}>
            Verified against the math. Flagged rows link back to the source page.
          </div>
        </div>
      </div>
    </div>
  );
}
