"use client";

import { useState } from "react";
import { ago, useDash } from "../../../lib/dashboard";
import { maskedKey, revokeKey, rotateKey, updateKey, type AccessKey, type CreatedKey } from "../../../lib/platform";
import { minutesText } from "../ui";
import { parseMinutes } from "./CreateKeyForm";

type Mode = "view" | "edit" | "rotate" | "revoke";

export default function KeyRow({ entry, planMinutes, onChanged, onRotated }: { entry: AccessKey; planMinutes: number; onChanged: () => Promise<void>; onRotated: (key: CreatedKey) => void }) {
  const { toast, fail } = useDash();
  const [mode, setMode] = useState<Mode>("view");
  const [label, setLabel] = useState(entry.label);
  const [limit, setLimit] = useState(entry.minute_limit ? String(entry.minute_limit) : "");
  const [busy, setBusy] = useState(false);
  const capMinutes = entry.minute_limit ?? planMinutes;
  const share = Math.min(entry.used_seconds / Math.max(capMinutes * 60, 1), 1);

  const run = async (action: () => Promise<void>, done?: string) => {
    setBusy(true);
    try {
      await action();
      if (done) toast(done);
      setMode("view");
      await onChanged();
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const save = () => {
    const minutes = parseMinutes(limit);
    if (minutes === "invalid") return toast("The monthly limit must be a whole number of minutes, or empty");
    void run(() => updateKey(entry.id, { label: label.trim() || entry.label, minute_limit: minutes }).then(() => undefined), "Key updated");
  };

  return (
    <div className={`cd-keyrow ${entry.disabled ? "paused" : ""}`}>
      <div className="cd-keyrow-main">
        {mode === "edit" ? (
          <div className="cd-keyform cd-keyform-inline">
            <input className="cd-input" value={label} onChange={(e) => setLabel(e.target.value)} maxLength={60} aria-label="Key name" />
            <input className="cd-input" value={limit} onChange={(e) => setLimit(e.target.value.replace(/[^\d]/g, ""))} placeholder={`Plan limit (${planMinutes} min)`} inputMode="numeric" aria-label="Monthly minute limit" />
          </div>
        ) : (
          <b>{entry.label} {entry.disabled && <span className="cd-tag">Paused</span>}</b>
        )}
        <code>{maskedKey(entry)}</code>
        <small className="cd-muted">
          Created {ago(entry.created_at)} · {entry.last_used_at ? `last used ${ago(entry.last_used_at)}` : "never used"}
        </small>
        <div className="cd-keyrow-usage">
          <div className="cd-bar"><i style={{ width: `${share * 100}%` }} /></div>
          <small>{minutesText(entry.used_seconds)} of {minutesText(capMinutes * 60)} this month{entry.minute_limit ? " (key limit)" : ""}</small>
        </div>
      </div>

      <div className="cd-keyrow-actions">
        {mode === "view" && (
          <>
            <button type="button" className="cd-btn cd-btn-sm" onClick={() => setMode("edit")}>Edit</button>
            <button type="button" className="cd-btn cd-btn-sm" disabled={busy} onClick={() => void run(() => updateKey(entry.id, { disabled: !entry.disabled }).then(() => undefined), entry.disabled ? "Key resumed" : "Key paused")}>
              {entry.disabled ? "Resume" : "Pause"}
            </button>
            <button type="button" className="cd-btn cd-btn-sm" onClick={() => setMode("rotate")}>Regenerate</button>
            <button type="button" className="cd-btn cd-btn-sm cd-btn-danger" onClick={() => setMode("revoke")}>Revoke</button>
          </>
        )}
        {mode === "edit" && (
          <>
            <button type="button" className="cd-btn cd-btn-sm cd-btn-pink" disabled={busy} onClick={save}>Save</button>
            <button type="button" className="cd-btn cd-btn-sm" onClick={() => setMode("view")}>Cancel</button>
          </>
        )}
        {mode === "rotate" && (
          <>
            <span className="cd-confirm">A new key replaces this one; the old key stops working right away.</span>
            <button type="button" className="cd-btn cd-btn-sm cd-btn-pink" disabled={busy} onClick={() => void run(async () => onRotated(await rotateKey(entry.id)))}>Regenerate</button>
            <button type="button" className="cd-btn cd-btn-sm" onClick={() => setMode("view")}>Cancel</button>
          </>
        )}
        {mode === "revoke" && (
          <>
            <span className="cd-confirm">Agents using this key stop working right away. This can't be undone.</span>
            <button type="button" className="cd-btn cd-btn-sm cd-btn-danger" disabled={busy} onClick={() => void run(() => revokeKey(entry.id).then(() => undefined), "Key revoked")}>Revoke</button>
            <button type="button" className="cd-btn cd-btn-sm" onClick={() => setMode("view")}>Cancel</button>
          </>
        )}
      </div>
    </div>
  );
}
