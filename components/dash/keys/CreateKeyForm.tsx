"use client";

import { useState } from "react";
import { useDash } from "../../../lib/dashboard";
import { createKey, type CreatedKey } from "../../../lib/platform";
import { Ico } from "../icons";

export const parseMinutes = (text: string): number | null | "invalid" => {
  if (!text.trim()) return null;
  const minutes = Number(text);
  return Number.isInteger(minutes) && minutes >= 1 && minutes <= 100_000 ? minutes : "invalid";
};

export default function CreateKeyForm({ full, suggestion, onCreated }: { full: boolean; suggestion: string; onCreated: (key: CreatedKey) => void }) {
  const { fail } = useDash();
  const [label, setLabel] = useState("");
  const [limit, setLimit] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const minutes = parseMinutes(limit);
    if (minutes === "invalid") return setError("The monthly limit must be a whole number of minutes, or empty for your plan's limit");
    setError("");
    setBusy(true);
    try {
      onCreated(await createKey({ label: label.trim() || suggestion, minute_limit: minutes }));
      setLabel("");
      setLimit("");
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
        <span className="cd-label">Monthly minute limit</span>
        <input className="cd-input" value={limit} onChange={(e) => setLimit(e.target.value.replace(/[^\d]/g, ""))} placeholder="Plan limit" inputMode="numeric" />
      </label>
      <button type="submit" className="cd-btn cd-btn-pink" disabled={busy || full}>
        {full ? "Key limit reached" : busy ? "Creating…" : <>Create key {Ico.arrow}</>}
      </button>
      {error && <p className="cd-error">{error}</p>}
    </form>
  );
}
