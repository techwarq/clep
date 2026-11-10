"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import CreateKeyForm from "../../../components/dash/keys/CreateKeyForm";
import KeyRow from "../../../components/dash/keys/KeyRow";
import NewKeyPanel from "../../../components/dash/keys/NewKeyPanel";
import { PageHead } from "../../../components/dash/ui";
import { useDash } from "../../../lib/dashboard";
import { listKeys, type AccessKey, type CreatedKey, type PlanLimits } from "../../../lib/platform";
import "./keys.css";

export default function Keys() {
  const { refresh, fail } = useDash();
  const [keys, setKeys] = useState<AccessKey[] | null>(null);
  const [plan, setPlan] = useState<PlanLimits | null>(null);
  const [fresh, setFresh] = useState<{ key: CreatedKey; rotated: boolean } | null>(null);

  const load = useCallback(async () => {
    try {
      const listed = await listKeys();
      setKeys(listed.keys);
      setPlan(listed.plan);
    } catch (err) {
      fail(err);
    }
  }, [fail]);
  useEffect(() => void load(), [load]);

  const changed = useCallback(async () => {
    await Promise.all([load(), refresh()]);
  }, [load, refresh]);

  const show = (key: CreatedKey, rotated: boolean) => {
    setFresh({ key, rotated });
    void changed();
  };

  return (
    <div className="cd-page cd-narrow">
      <PageHead title="API keys" sub="Your coding agent and CI authenticate with these. Each key is shown once; you can pause, regenerate or revoke it any time." />

      {plan && (
        <section className="cd-plan-strip" aria-label="Your plan's limits">
          <span className="cd-tag">{plan.name} plan</span>
          <span><b>{keys?.length ?? 0}</b> key{keys?.length === 1 ? "" : "s"}</span>
          <span><b>{plan.requests_per_minute}</b> requests/min per key</span>
          <span><b>{plan.active_jobs}</b> video{plan.active_jobs === 1 ? "" : "s"} at a time</span>
          <span><b>{plan.export_minutes}</b> export min/month</span>
        </section>
      )}

      {fresh ? (
        <NewKeyPanel created={fresh.key} rotated={fresh.rotated} onDone={() => setFresh(null)} />
      ) : (
        <section className="cd-card">
          <div className="cd-card-head">
            <div>
              <h2>Create a key</h2>
              <p>One per agent or CI, so you can revoke one without touching the others. Set an expiration for keys you hand to CI or teammates.</p>
            </div>
          </div>
          <CreateKeyForm suggestion="Claude Code on my laptop" onCreated={(key) => show(key, false)} />
        </section>
      )}

      <section className="cd-card">
        <div className="cd-card-head">
          <h2>Your keys</h2>
        </div>
        {keys === null && <p className="cd-muted">Loading…</p>}
        {keys?.length === 0 && <p className="cd-muted">No keys yet. Create one above, then follow <Link href="/dashboard/start">Getting started</Link> to connect your agent.</p>}
        <div className="cd-keylist">
          {keys?.map((entry) => (
            <KeyRow key={entry.id} entry={entry} planMinutes={plan?.export_minutes ?? 0} onChanged={changed} onRotated={(key) => show(key, true)} />
          ))}
        </div>
      </section>

    </div>
  );
}
