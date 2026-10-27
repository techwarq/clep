"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ago, useDash } from "../../../lib/dashboard";
import { approveRequest, listRequests, type AccessRequest, type Approval } from "../../../lib/platform";
import { Empty, safeHost } from "../ui";
import ApprovalCard from "./ApprovalCard";

const FILTERS = [
  { key: "pending", label: "Waiting" },
  { key: "approved", label: "Approved" },
  { key: "all", label: "All" },
] as const;

export default function RequestsTable() {
  const { fail } = useDash();
  const [requests, setRequests] = useState<AccessRequest[] | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("pending");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [approval, setApproval] = useState<Approval | null>(null);

  const load = useCallback(() => listRequests().then(setRequests, fail), [fail]);
  useEffect(() => void load(), [load]);

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (requests ?? []).filter((r) => (filter === "all" || r.status === filter) && (!needle || `${r.name} ${r.email} ${r.product_url ?? ""}`.toLowerCase().includes(needle)));
  }, [requests, filter, query]);
  const waiting = (requests ?? []).filter((r) => r.status === "pending").length;

  const approve = async (request: AccessRequest) => {
    setBusy(request.id);
    setConfirming(null);
    try {
      setApproval(await approveRequest(request.id));
      await load();
    } catch (err) {
      fail(err);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="cd-stack">
      {approval && <ApprovalCard approval={approval} onClose={() => setApproval(null)} />}
      <section className="cd-card">
        <div className="cd-card-head">
          <div>
            <h2>Access requests</h2>
            <p>{waiting ? `${waiting} waiting for a seat.` : "Nobody is waiting."} Approving creates their account and emails a 6-digit code.</p>
          </div>
          <input className="cd-input cd-admin-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email, product" aria-label="Search requests" />
        </div>
        <div className="cd-pills cd-pills-btn">
          {FILTERS.map((f) => (
            <button key={f.key} type="button" className={filter === f.key ? "on" : ""} onClick={() => setFilter(f.key)}>{f.label}</button>
          ))}
        </div>
        {requests === null && <p className="cd-muted">Loading…</p>}
        {requests && shown.length === 0 && <Empty title="Nothing here" text={query ? "No request matches that search." : "New requests from the reserve page show up here."} />}
        <div className="cd-admin-rows">
          {shown.map((r) => (
            <div key={r.id} className="cd-admin-row">
              <div>
                <b>{r.name}</b> <span className={`cd-status ${r.status === "approved" ? "done" : "queued"}`}>{r.status === "approved" ? "Approved" : "Waiting"}</span>
                <p className="cd-muted">
                  {r.email}
                  {r.product_url && <> · <a href={r.product_url} target="_blank" rel="noopener noreferrer nofollow">{safeHost(r.product_url)}</a></>}
                  {" · "}asked {ago(r.created_at)}{r.approved_at && <> · approved {ago(r.approved_at)}</>}
                </p>
              </div>
              <div className="cd-admin-actions">
                {r.status === "pending" && (
                  <button type="button" className="cd-btn cd-btn-pink cd-btn-sm" disabled={busy === r.id} onClick={() => void approve(r)}>
                    {busy === r.id ? "Approving…" : "Approve & send code"}
                  </button>
                )}
                {r.status === "approved" && confirming !== r.id && (
                  <button type="button" className="cd-btn cd-btn-sm" onClick={() => setConfirming(r.id)}>New code</button>
                )}
                {confirming === r.id && (
                  <>
                    <span className="cd-confirm">Their current code stops working.</span>
                    <button type="button" className="cd-btn cd-btn-pink cd-btn-sm" disabled={busy === r.id} onClick={() => void approve(r)}>Send new code</button>
                    <button type="button" className="cd-btn cd-btn-sm" onClick={() => setConfirming(null)}>Cancel</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
