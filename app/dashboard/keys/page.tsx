"use client";

import { useCallback, useEffect, useState } from "react";
import CreateKeyForm from "../../../components/dash/keys/CreateKeyForm";
import KeyRow from "../../../components/dash/keys/KeyRow";
import NewKeyPanel from "../../../components/dash/keys/NewKeyPanel";
import { CopyField, PageHead } from "../../../components/dash/ui";
import { useDash } from "../../../lib/dashboard";
import { API_BASE, listKeys, type AccessKey, type CreatedKey, type PlanLimits } from "../../../lib/platform";
import "./keys.css";

const AGENTS: [string, string][] = [
  ["Claude Code", "Paste it into Claude Code, opened in your project folder."],
  ["Cursor", "Paste it into Cursor's agent chat with the project open."],
  ["Codex", "Paste it into Codex, started in your project folder."],
  ["Windsurf", "Paste it into Cascade with the project open."],
  ["Other", "Any agent that can read a URL and run shell commands works."],
];

export default function Keys() {
  const { projects, clips, account, refresh, fail } = useDash();
  const [keys, setKeys] = useState<AccessKey[] | null>(null);
  const [plan, setPlan] = useState<PlanLimits | null>(null);
  const [fresh, setFresh] = useState<{ key: CreatedKey; rotated: boolean } | null>(null);
  const [agent, setAgent] = useState(0);

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

  const paste = `Set up Clep for this project: read ${API_BASE}/skill.md and follow it`;
  const connected = projects[0];
  const agentSeen = !!account?.connected || !!connected || clips.length > 0;

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
          <CreateKeyForm suggestion={`${AGENTS[agent][0]} on my laptop`} onCreated={(key) => show(key, false)} />
        </section>
      )}

      <section className="cd-card">
        <div className="cd-card-head">
          <h2>Your keys</h2>
        </div>
        {keys === null && <p className="cd-muted">Loading…</p>}
        {keys?.length === 0 && <p className="cd-muted">No keys yet. Create one above, then add it to your environment as CLEP_API_KEY.</p>}
        <div className="cd-keylist">
          {keys?.map((entry) => (
            <KeyRow key={entry.id} entry={entry} planMinutes={plan?.export_minutes ?? 0} onChanged={changed} onRotated={(key) => show(key, true)} />
          ))}
        </div>
      </section>

      <section className="cd-card">
        <div className="cd-card-head">
          <div>
            <h2>Connect your agent</h2>
            <p>Once per project. This turns green when your agent makes its first call.</p>
          </div>
        </div>
        <ol className="cd-onboard">
          <li>
            <span className="cd-step-n">1</span>
            <div>
              <h3>Pick your agent</h3>
              <div className="cd-pills cd-pills-btn" role="tablist">
                {AGENTS.map(([name], i) => (
                  <button key={name} type="button" role="tab" aria-selected={agent === i} className={agent === i ? "on" : ""} onClick={() => setAgent(i)}>
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </li>
          <li>
            <span className="cd-step-n">2</span>
            <div>
              <h3>In your terminal: add the key to your environment</h3>
              <CopyField value="export CLEP_API_KEY=clep_sk_…" display="export CLEP_API_KEY=<your key>" />
              <p className="cd-muted">Use the key you copied when you created it. Add the line to <code>~/.zshrc</code> to keep it in every terminal.</p>
            </div>
          </li>
          <li>
            <span className="cd-step-n">3</span>
            <div>
              <h3>In your agent: paste this setup line</h3>
              <CopyField value={paste} />
              <p className="cd-muted">{AGENTS[agent][1]} It has no key in it: Clep&apos;s tools read CLEP_API_KEY from your environment, so the key never goes into the chat.</p>
            </div>
          </li>
          <li>
            <span className={`cd-step-n ${agentSeen ? "ok" : ""}`}>4</span>
            <div>
              {agentSeen ? (
                <p className="cd-connected">
                  <i /> Connected
                  {connected && <> · {connected.name}{connected.framework && ` · ${connected.framework}`}{connected.app_url && ` · ${connected.app_url}`}</>}
                </p>
              ) : (
                <p className="cd-waiting"><i /> Waiting for your agent…</p>
              )}
            </div>
          </li>
        </ol>
      </section>
    </div>
  );
}
