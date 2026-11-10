"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ago, useDash } from "../../../lib/dashboard";
import { getActivity, type Activity, type ActivityStage } from "../../../lib/platform";

const STAGES: ActivityStage[] = ["approved", "signed in", "connected an agent", "made a video", "paying"];
const minutes = (value: number) => `${value.toFixed(value < 10 ? 2 : 1)} min`;
const when = (iso: string | null, never: string) => (iso ? ago(iso) : never);

export default function ActivityTable() {
  const { fail } = useDash();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [stage, setStage] = useState<ActivityStage | null>(null);

  const load = useCallback(() => getActivity().then(setActivity).catch(fail), [fail]);
  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 30000);
    return () => window.clearInterval(timer);
  }, [load]);

  const users = useMemo(() => (activity?.users ?? []).filter((u) => !stage || u.stage === stage), [activity, stage]);

  return (
    <>
      <section className="cd-card">
        <div className="cd-card-head">
          <div>
            <h2>Funnel</h2>
            <p>Where each approved person got to. Click a stage to see only them.</p>
          </div>
        </div>
        <div className="cd-activity-funnel">
          {STAGES.map((s) => (
            <button key={s} type="button" className={stage === s ? "on" : ""} onClick={() => setStage(stage === s ? null : s)}>
              <b>{activity?.stages[s] ?? 0}</b>
              <span>{s}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="cd-card">
        <div className="cd-card-head">
          <div>
            <h2>People{stage ? ` · ${stage}` : ""}</h2>
            <p>Most recently active first. Sign-ins, agent keys, synced projects, clips and minutes, refreshed every 30 s.</p>
          </div>
        </div>
        {activity === null && <p className="cd-muted">Loading…</p>}
        <div className="cd-admin-rows">
          {users.map((u) => (
            <div key={u.id} className="cd-admin-row">
              <div>
                <b>{u.name || u.email.split("@")[0]}</b> <span className="cd-tag">{u.stage}</span> {u.is_admin && <span className="cd-tag">Admin</span>}
                <p className="cd-muted">
                  {u.email} · {u.plan} · {u.approved_at ? `approved ${ago(u.approved_at)}` : "added by hand"} · active {when(u.last_active_at, "never")}
                </p>
                <p className="cd-muted">
                  {u.sign_ins} sign-in{u.sign_ins === 1 ? "" : "s"} (last {when(u.last_sign_in_at, "never")}) · {u.keys} key{u.keys === 1 ? "" : "s"}, agent used{" "}
                  {when(u.key_last_used_at, "never")} · {u.projects} project{u.projects === 1 ? "" : "s"} synced
                </p>
                <p className="cd-muted">
                  {u.clips_done} video{u.clips_done === 1 ? "" : "s"} made, {u.clips_failed} failed{u.clips_active ? `, ${u.clips_active} rendering` : ""} · last{" "}
                  {when(u.last_clip_at, "none yet")} · {minutes(u.minutes_this_month)} this month, {minutes(u.minutes_total)} in all · model spend ${u.model_spend_usd.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cd-card">
        <div className="cd-card-head">
          <div>
            <h2>Recent activity</h2>
            <p>The latest approvals, sign-ins, keys, project syncs and clips, newest first.</p>
          </div>
        </div>
        <div className="cd-activity-feed">
          {(activity?.recent ?? []).map((e, i) => (
            <p key={`${e.at}-${i}`}>
              <span className="cd-muted">{ago(e.at)}</span> <b>{e.email}</b> {e.what}{e.detail ? <span className="cd-muted"> · {e.detail}</span> : null}
            </p>
          ))}
        </div>
      </section>
    </>
  );
}
