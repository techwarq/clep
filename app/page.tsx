"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import DemoWidget from "../components/DemoWidget";
import Reveal from "../components/Reveal";
import { getToken, startCheckout } from "../lib/api";

const DOES_REST = [
  "Finds the structure",
  "Extracts the data",
  "Normalizes fields",
  "Deduplicates records",
  "Checks totals and relationships",
  "Flags exceptions",
  "Links data back to the source"
];

const VERIFY_CHECKS = [
  ["Totals and subtotals", "Line items must add up to the stated total."],
  ["Running balances", "Each balance must follow from the last."],
  ["Debit / credit consistency", "Money in and money out must agree."],
  ["Dates and numeric formats", "Normalized, no ambiguous 02/03/04."],
  ["Duplicate rows", "Same invoice twice gets caught."],
  ["Missing fields", "Empty cells are reported, not hidden."],
  ["Cross-page consistency", "Headers, footers and splits tracked across pages."],
  ["Source evidence", "Every value links back to its page."]
];

const UGLY_DOCS = [
  "Scanned statements",
  "Phone photos",
  "Faded receipts",
  "Multi-page reports",
  "Changing bank formats",
  "Tables split across pages",
  "Repeated headers",
  "Messy exports"
];

const WHY_ROWS: [string, string][] = [
  ["Build a template for every layout", "No templates"],
  ["Extract everything and check it yourself", "Only review exceptions"],
  ["Confidence scores you still have to trust", "Verification + evidence"],
  ["Split huge documents manually", "Built for long documents"],
  ["Spreadsheet-only output", "Structured data in any format"],
  ["Enterprise setup", "Upload and go"]
];

export default function Page() {
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [checkoutBusy, setCheckoutBusy] = useState<string | null>(null);

  const showToast = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2600);
  };

  const scrollToDemo = () => {
    setMenuOpen(false);
    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const navGo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  // Logged-out visitors go create an account first — /signup carries the
  // plan through and fires checkout right after (see AuthCard.tsx) rather
  // than dropping them on the dashboard mid-upgrade.
  const upgrade = async (planName: string) => {
    if (!getToken()) {
      router.push(`/signup?plan=${encodeURIComponent(planName)}`);
      return;
    }
    setCheckoutBusy(planName);
    try {
      const { checkoutUrl } = await startCheckout(planName);
      window.location.href = checkoutUrl;
    } catch (err) {
      setCheckoutBusy(null);
      showToast(err instanceof Error ? err.message : "Couldn't start checkout");
    }
  };

  return (
    <>
      {/* NAV */}
      <div className="nav">
        <div className="nav-inner">
          <a className="brand" href="#top" aria-label="clep — home">
            <Image src="/logo.png" alt="clep" width={760} height={413} className="brand-logo" priority />
          </a>
          <nav className="nav-links">
            <a href="#features">Features</a>
            <a href="#how">How it Works</a>
            <a href="#compare">Why Clep</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQs</a>
          </nav>
          <div className="nav-actions">
            <a href="/login" className="login-link">Log in</a>
            <button className="btn btn-lime btn-sm" onClick={scrollToDemo}>
              Try free
            </button>
            <button
              className="hamburger"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="mobile-menu">
            <a onClick={() => navGo("features")}>Features</a>
            <a onClick={() => navGo("how")}>How it Works</a>
            <a onClick={() => navGo("compare")}>Why Clep</a>
            <a onClick={() => navGo("pricing")}>Pricing</a>
            <a onClick={() => navGo("faq")}>FAQs</a>
            <a href="/dashboard">Dashboard</a>
            <a href="/login">Log in</a>
            <button className="btn btn-lime" onClick={scrollToDemo}>
              Try it free — no signup
            </button>
          </div>
        )}
      </div>

      <main id="top" className="wrap">
        {/* HERO */}
        <section className="hero">
          <span className="pill hero-anim d1">
            <span className="dot" /> Turn messy documents into structured data
          </span>
          <h1 className="hero-anim d2">
            Give Clep anything messy. Get <em>clean, verified data</em> back.
          </h1>
          <p className="sub hero-anim d3">
            Upload PDFs, scans, screenshots, receipts, invoices, statements, reports, or photos.
            Tell Clep what you need. It extracts the data, checks it, and flags only what needs
            your attention.
          </p>
          <div className="hero-cta hero-anim d4">
            <button className="btn btn-lime btn-lg" onClick={scrollToDemo}>
              Try it free — no signup needed
            </button>
            <a className="btn btn-ghost btn-lg" href="#how">
              ▶ See how it works
            </a>
          </div>
          <div className="trust hero-anim d5">Your first conversion is free. No email. No credit card.</div>
        </section>

        <div className="logos hero-anim d6">
          WORKS ON THE UGLY STUFF
          <div className="marquee">
            <div className="marquee-track">
              {[0, 1].map((k) => (
                <div className="marquee-group" key={k}>
                  {["PDF", "SCANS", "PHOTOS", "SCREENSHOTS", "INVOICES", "STATEMENTS", "RECEIPTS", "REPORTS"].map((f) => (
                    <span key={f}>{f}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hero-anim d6">
          <DemoWidget onToast={showToast} />
        </div>

        {/* CLEP DOES THE REST */}
        <Reveal className="section">
          <div className="problem">
            <div className="problem-quote">
              <div className="eyebrow">Tell Clep what you want</div>
              <blockquote style={{ fontStyle: "italic", marginTop: 12 }}>
                “Extract date, vendor, invoice number, subtotal, tax, total, and payment status.
                Put each invoice on its own row. Normalize dates and amounts. Remove duplicates.
                Flag anything you can&apos;t verify.”
              </blockquote>
            </div>
            <div className="card" style={{ borderColor: "rgba(101,163,13,.35)" }}>
              <div className="eyebrow">Clep does the rest</div>
              <ul className="check-list">
                {DOES_REST.map((d) => (
                  <li key={d}>✓ {d}</li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        {/* VERIFY */}
        <Reveal className="section" id="features">
          <div className="eyebrow">Extraction isn&apos;t enough</div>
          <h2 className="h2">Clep checks its work.</h2>
          <p className="lead">
            Most AI extraction tools give you a spreadsheet and a confidence score. Clep tries to{" "}
            <strong>verify the data before you trust it.</strong>
          </p>
          <div className="grid4">
            {VERIFY_CHECKS.map(([t, d]) => (
              <div className="card" key={t} style={{ padding: 20 }}>
                <div className="icon" style={{ width: 36, height: 36, fontSize: 17 }}>✓</div>
                <h3 style={{ fontSize: 21 }}>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
          <div className="flag-banner">
            When Clep can&apos;t prove something, <strong>it flags it instead of pretending it&apos;s correct.</strong>
          </div>
        </Reveal>

        {/* UGLY DOCS */}
        <Reveal className="section">
          <div className="eyebrow">No templates. No training.</div>
          <h2 className="h2">Built for ugly documents.</h2>
          <div className="ugly-cloud">
            {UGLY_DOCS.map((u) => (
              <span key={u} className="ugly-chip">{u}</span>
            ))}
          </div>
            <p className="lead" style={{ marginTop: 22, fontSize: 19 }}>
              <strong>No templates. No training. No cleanup marathon.</strong>
            </p>
        </Reveal>

        {/* HOW */}
        <Reveal className="section" id="how">
          <div className="eyebrow">How it works</div>
          <h2 className="h2">From messy file to usable data.</h2>
          <div className="steps4">
            <div className="step">
              <span className="step-num">01</span>
              <h3>Upload</h3>
              <p>Drop in one document or a batch.</p>
            </div>
            <div className="step">
              <span className="step-num">02</span>
              <h3>Describe the output</h3>
              <p>Tell Clep which fields, columns, or structure you need.</p>
            </div>
            <div className="step">
              <span className="step-num">03</span>
              <h3>Extract + verify</h3>
              <p>Clep identifies the layout, extracts the data, checks what it can, and isolates exceptions.</p>
            </div>
            <div className="step">
              <span className="step-num">04</span>
              <h3>Export anywhere</h3>
              <p>Excel, CSV, JSON, Google Sheets, APIs, and more.</p>
            </div>
          </div>
        </Reveal>

        {/* WHY */}
        <Reveal className="section" id="compare">
          <div className="eyebrow">Why switch?</div>
          <h2 className="h2">Why Clep?</h2>
          <div className="compare">
            <div className="compare-row compare-head compare-duo">
              <div>Old approach</div>
              <div>clep ✓</div>
            </div>
            {WHY_ROWS.map(([a, b]) => (
              <div className="compare-row compare-duo" key={a}>
                <div style={{ color: "#55605b" }}>{a}</div>
                <div style={{ fontWeight: 700 }}>{b}</div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* MID CTA */}
        <Reveal className="cta">
          <div>
            <h2>Stop checking every row. Let Clep find the rows that matter.</h2>
            <p>Upload a messy document. Get structured data back. Review only what couldn&apos;t be verified.</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn btn-lime btn-lg" onClick={scrollToDemo}>
                Try Clep free
              </button>
            </div>
            <div className="trust" style={{ textAlign: "left" }}>No signup • No credit card</div>
          </div>
          <div className="cta-mock">
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>Last 30 days on Clep</div>
            <div style={{ fontSize: 12, color: "#55605b" }}>Rows verified automatically</div>
            <div className="mini-bar"><div style={{ width: "98%" }} /></div>
            <div style={{ fontSize: 12, color: "#55605b", marginTop: 10 }}>Rows needing review</div>
            <div className="mini-bar"><div style={{ width: "2%" }} /></div>
            <div style={{ fontSize: 12, color: "#55605b", marginTop: 10 }}>Avg. time saved per document</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#4d7c0f" }}>2h 13m</div>
          </div>
        </Reveal>

        {/* PRICING */}
        <Reveal className="section" id="pricing">
          <div className="eyebrow">Pricing</div>
          <h2 className="h2">Simple pricing. No surprise credits.</h2>
          <div className="pricing4">
            <div className="price">
              <h3>Free</h3>
              <div className="amount">$0<span>/mo</span></div>
              <ul>
                <li>50 pages / month</li>
                <li>Up to 50 pages / document</li>
                <li>Structured data extraction</li>
                <li>Verification</li>
                <li>CSV export</li>
              </ul>
              <button className="btn btn-ghost" onClick={scrollToDemo}>Try free</button>
            </div>
            <div className="price">
              <h3>Starter</h3>
              <div className="amount">$19<span>/mo</span></div>
              <ul>
                <li>500 pages / month</li>
                <li>Up to 250 pages / document</li>
                <li>Verification</li>
                <li>Excel + CSV</li>
                <li>Batch uploads</li>
                <li>Priority processing</li>
              </ul>
              <button className="btn btn-ghost" disabled={checkoutBusy === "Starter"} onClick={() => upgrade("Starter")}>
                {checkoutBusy === "Starter" ? "Redirecting…" : "Subscribe"}
              </button>
            </div>
            <div className="price featured">
              <h3>Pro ⭐</h3>
              <div className="amount">$49<span>/mo</span></div>
              <ul>
                <li>2,000 pages / month</li>
                <li>Up to 500 pages / document</li>
                <li>Advanced verification</li>
                <li>Batch processing</li>
                <li>Excel + CSV + JSON</li>
                <li>Google Sheets</li>
                <li>Shareable results</li>
              </ul>
              <button className="btn btn-lime" disabled={checkoutBusy === "Pro"} onClick={() => upgrade("Pro")}>
                {checkoutBusy === "Pro" ? "Redirecting…" : "Subscribe"}
              </button>
            </div>
            <div className="price">
              <h3>Business</h3>
              <div className="amount">$149<span>/mo</span></div>
              <ul>
                <li>10,000 pages / month</li>
                <li>Up to 500 pages / document</li>
                <li>API access</li>
                <li>Webhooks</li>
                <li>Team workspace</li>
                <li>Advanced exports</li>
                <li>Priority processing</li>
              </ul>
              <button className="btn btn-ghost" onClick={() => showToast("Sales will reach out at launch")}>
                Contact us
              </button>
            </div>
            {/* TEMP: live-payment/webhook smoke test — remove once verified, see billing setup */}
            <div className="price">
              <h3>Test</h3>
              <div className="amount">$0.60<span>/mo</span></div>
              <ul>
                <li>10 pages / month</li>
                <li>Up to 10 pages / document</li>
                <li>For verifying checkout end-to-end</li>
              </ul>
              <button className="btn btn-ghost" disabled={checkoutBusy === "Test"} onClick={() => upgrade("Test")}>
                {checkoutBusy === "Test" ? "Redirecting…" : "Subscribe"}
              </button>
            </div>
          </div>
        </Reveal>

        {/* FAQ */}
        <Reveal className="section" id="faq">
          <div className="eyebrow">FAQ</div>
          <h2 className="h2">Frequently asked questions.</h2>
          <div className="faq">
            <details open>
              <summary>What can Clep process?</summary>
              <p>
                PDFs, scanned PDFs, photos, screenshots, invoices, receipts, bank statements,
                reports, exports, and other messy business documents.
              </p>
            </details>
            <details>
              <summary>Do I need to create a template?</summary>
              <p>
                No. Describe the data you want and Clep infers the structure from the document —
                even when layouts change.
              </p>
            </details>
            <details>
              <summary>What happens when Clep isn&apos;t sure?</summary>
              <p>
                Clep flags the specific field or row and explains why it needs review. Where
                possible, you can open the source page and inspect the original value.
              </p>
            </details>
            <details>
              <summary>Can Clep handle large documents?</summary>
              <p>
                Yes. Paid plans support large documents, with plan-level page and file-size limits —
                up to 500 pages per document on Pro and Business.
              </p>
            </details>
            <details>
              <summary>Where does my data go?</summary>
              <p>
                Your files are processed securely and are only used to provide the service.
                Final retention, encryption, and deletion policy will be published before launch.
              </p>
            </details>
          </div>
        </Reveal>

        {/* FINAL CTA */}
        <Reveal className="cta">
          <div>
            <h2>Your documents are messy. Your data doesn&apos;t have to be.</h2>
            <p>Upload the first one free.</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn btn-lime btn-lg" onClick={scrollToDemo}>
                Try Clep
              </button>
            </div>
            <div className="trust" style={{ textAlign: "left" }}>No signup • No credit card</div>
          </div>
          <div className="cta-mock">
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>Try it now — no signup</div>
            <div style={{ fontSize: 12, color: "#55605b" }}>Drop a file above and watch extraction + verification happen live.</div>
            <div style={{ marginTop: 14 }}>
              <button className="btn btn-lime" onClick={scrollToDemo}>Convert a document free</button>
            </div>
          </div>
        </Reveal>

        <footer>
          <div className="foot">
            <span><strong>clep</strong> — Turn messy documents into structured data.</span>
          </div>
          <div className="foot" style={{ marginTop: 8 }}>
            <span>© 2026 Clep</span>
            <nav>
              <a href="/dashboard">Dashboard</a>
              <a href="#faq">Privacy</a>
              <a href="#faq">Security</a>
              <a href="#faq">Terms</a>
            </nav>
          </div>
        </footer>
      </main>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
