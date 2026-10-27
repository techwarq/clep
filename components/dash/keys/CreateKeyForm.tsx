"use client";

import { useState } from "react";
import { useDash } from "../../../lib/dashboard";
import { createKey, type CreatedKey } from "../../../lib/platform";
import { Ico } from "../icons";

const EXPIRATIONS: [string, number | null][] = [
  ["No expiration", null],
  ["7 days", 7],
  ["30 days", 30],
  ["60 days", 60],
  ["90 days", 90],
  ["1 year", 365],
];

export default function CreateKeyForm({ full, suggestion, onCreated }: { full: boolean; suggestion: string; onCreated: (key: CreatedKey) => void }) {
  const { fail } = useDash();
  const [label, setLabel] = useState("");
  const [expiry, setExpiry] = useState(0);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      onCreated(await createKey({ label: label.trim() || suggestion, expires_in_days: EXPIRATIONS[expiry][1] }));
      setLabel("");
      setExpiry(0);
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="cd-keyform" onSubmit={submit}>
      <label>
        <span className="cd-label">Name</span>
        <input className="cd-input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder={`e.g. ${suggestion}`} maxLength={60} />
      </label>
      <label>
        <span className="cd-label">Expiration (optional)</span>
        <select className="cd-input cd-select" value={expiry} onChange={(e) => setExpiry(Number(e.target.value))}>
          {EXPIRATIONS.map(([name], i) => <option key={name} value={i}>{name}</option>)}
        </select>
      </label>
      <button type="submit" className="cd-btn cd-btn-pink" disabled={busy || full}>
        {full ? "Key limit reached" : busy ? "Creating…" : <>Create key {Ico.arrow}</>}
      </button>
    </form>
  );
}
