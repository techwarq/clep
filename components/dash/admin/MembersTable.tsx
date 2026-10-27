"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ago, useDash } from "../../../lib/dashboard";
import { changePlan, listMembers, type Member, type Plan } from "../../../lib/platform";
import { minutesText } from "../ui";

const PLANS: Plan[] = ["free", "beta", "pro", "studio"];

export default function MembersTable() {
  const { toast, fail } = useDash();
  const [members, setMembers] = useState<Member[] | null>(null);
  const [minutesByPlan, setMinutesByPlan] = useState<Record<string, number>>({});
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    try {
      const listed = await listMembers();
      setMembers(listed.members);
      setMinutesByPlan(Object.fromEntries(Object.entries(listed.plans).map(([plan, limits]) => [plan, limits.exportMinutes])));
    } catch (err) {
      fail(err);
    }
  }, [fail]);
  useEffect(() => void load(), [load]);

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (members ?? []).filter((m) => !needle || `${m.name ?? ""} ${m.email}`.toLowerCase().includes(needle));
  }, [members, query]);

  const setPlan = async (member: Member, plan: Plan) => {
    try {
      await changePlan(member.id, plan);
      toast(`${member.email} is now on ${plan}`);
      await load();
    } catch (err) {
      fail(err);
    }
  };

  return (
    <section className="cd-card">
      <div className="cd-card-head">
        <div>
          <h2>Members</h2>
          <p>A plan sets each member's keys, requests per minute, videos at a time and export minutes. Changes apply on their next request.</p>
        </div>
        <input className="cd-input cd-admin-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or email" aria-label="Search members" />
      </div>
      {members === null && <p className="cd-muted">Loading…</p>}
      <div className="cd-admin-rows">
        {shown.map((m) => (
          <div key={m.id} className="cd-admin-row">
            <div>
              <b>{m.name || m.email.split("@")[0]}</b> {m.is_admin && <span className="cd-tag">Admin</span>}
              <p className="cd-muted">
                {m.email} · joined {ago(m.created_at)} · {m.last_active_at ? `active ${ago(m.last_active_at)}` : "no API calls yet"}
              </p>
              <p className="cd-muted">
                {m.keys} key{m.keys === 1 ? "" : "s"} · {m.clips} clip{m.clips === 1 ? "" : "s"} · {minutesText(m.used_seconds)} of {minutesText((minutesByPlan[m.plan] ?? 0) * 60)} this month
              </p>
            </div>
            <label className="cd-admin-actions">
              <span className="cd-label">Plan</span>
              <select className="cd-input cd-select" value={m.plan} onChange={(e) => void setPlan(m, e.target.value as Plan)} aria-label={`Plan for ${m.email}`}>
                {PLANS.map((plan) => <option key={plan} value={plan}>{plan}</option>)}
              </select>
            </label>
          </div>
        ))}
      </div>
    </section>
  );
}
