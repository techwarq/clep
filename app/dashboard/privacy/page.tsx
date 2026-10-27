"use client";

import { useState } from "react";
import { PageHead, Soon } from "../../../components/dash/ui";

const BUILT_IN = [
  { key: "emails", label: "Email addresses", sample: "ana@acme.com" },
  { key: "keys", label: "API keys and tokens", sample: "sk_live_51H…" },
  { key: "cards", label: "Card numbers", sample: "4242 4242 4242 4242" },
  { key: "phones", label: "Phone numbers", sample: "+1 415 555 0101" },
];

/** Privacy rules (Platform Plan §4–5), synced to the recorder so blurring happens before upload. */
export default function Privacy() {
  const [on, setOn] = useState<Record<string, boolean>>({ emails: true, keys: true, cards: true, phones: false });
  const [selectors, setSelectors] = useState<string[]>([".secret"]);
  const [draft, setDraft] = useState("");

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const s = draft.trim();
    if (s && !selectors.includes(s)) setSelectors([...selectors, s]);
    setDraft("");
  };

  return (
    <div className="cd-page cd-narrow">
      <PageHead title={<>Privacy <Soon /></>} sub="Blur rules your recorder applies on your machine, before anything is uploaded." />
      <p className="cd-note">Today the engine only blurs boxes you mark by hand. Syncing these rules to the recorder is being built.</p>

      <section className="cd-card">
        <h3 className="cd-side-h">Blur automatically</h3>
        <ul className="cd-toggles">
          {BUILT_IN.map((r) => (
            <li key={r.key}>
              <div>
                <b>{r.label}</b>
                <span className={on[r.key] ? "cd-blurred" : ""}>{r.sample}</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={on[r.key]}
                aria-label={r.label}
                className="cd-switch"
                onClick={() => setOn({ ...on, [r.key]: !on[r.key] })}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="cd-card">
        <h3 className="cd-side-h">Also blur these elements</h3>
        <div className="cd-chips">
          {selectors.map((s) => (
            <span key={s} className="cd-tag mono">
              {s}
              <button type="button" onClick={() => setSelectors(selectors.filter((x) => x !== s))} aria-label={`Remove ${s}`}>×</button>
            </span>
          ))}
        </div>
        <form className="cd-inline-form" onSubmit={add}>
          <input className="cd-input" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="CSS selector, e.g. [data-private]" />
          <button type="submit" className="cd-btn">+ Rule</button>
        </form>
      </section>
    </div>
  );
}
