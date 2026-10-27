"use client";

import { useCallback, useEffect, useState } from "react";
import { Ico } from "../../../components/dash/icons";
import { CopyField, PageHead } from "../../../components/dash/ui";
import { ago, useDash } from "../../../lib/dashboard";
import { API_BASE, createKey, listKeys, revokeKey, type AccessKey, type CreatedKey } from "../../../lib/platform";

const AGENTS: [string, string][] = [
  ["Claude Code", "Paste it into Claude Code, opened in your project folder."],
  ["Cursor", "Paste it into Cursor's agent chat with the project open."],
  ["Codex", "Paste it into Codex, started in your project folder."],
  ["Windsurf", "Paste it into Cascade with the project open."],
  ["Other", "Any agent that can read a URL and run shell commands works."],
];

export default function Keys() {
  const { projects, clips, account, refresh, toast, fail } = useDash();
  const [keys, setKeys] = useState<AccessKey[] | null>(null);
  const [fresh, setFresh] = useState<CreatedKey | null>(null);
  const [label, setLabel] = useState("");
  const [agent, setAgent] = useState(0);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => listKeys().then(setKeys, fail), [fail]);
  useEffect(() => void load(), [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      setFresh(await createKey(label.trim() || AGENTS[agent][0]));
      setLabel("");
      await Promise.all([load(), refresh()]);
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (key: AccessKey) => {
    if (!window.confirm(`Revoke "${key.label ?? key.prefix}"? Agents using it stop working right away.`)) return;
    try {
      await revokeKey(key.id);
      if (fresh?.id === key.id) setFresh(null);
      toast("Key revoked");
      await Promise.all([load(), refresh()]);
    } catch (err) {
      fail(err);
    }
  };

  const paste = `Set up Clep for this project: read ${API_BASE}/skill.md and follow it`;
  const connected = projects[0];
  const agentSeen = !!account?.connected || !!connected || clips.length > 0;

  return (
    <div className="cd-page cd-narrow">
      <PageHead title="Connect your coding agent" sub="Four steps, once per project. This page turns green when your agent makes its first call." />

      <ol className="cd-onboard">
        <li>
          <span className={`cd-step-n ${fresh || keys?.length ? "ok" : ""}`}>1</span>
          <div>
            <h3>Create an API key</h3>
            {fresh ? (
              <>
                <CopyField value={`export CLEP_API_KEY=${fresh.key}`} />
                <p className="cd-note">Copy it now: this is the only time Clep shows the full key. Run it in the terminal you start your agent from, and never commit it.</p>
              </>
            ) : (
              <form className="cd-inline-form" onSubmit={create}>
                <input className="cd-input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder={`Label, e.g. ${AGENTS[agent][0]} on my laptop`} maxLength={60} />
                <button type="submit" className="cd-btn cd-btn-pink" disabled={busy}>{busy ? "Creating…" : <>Create key {Ico.arrow}</>}</button>
              </form>
            )}
          </div>
        </li>

        <li>
          <span className="cd-step-n">2</span>
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
          <span className="cd-step-n">3</span>
          <div>
            <h3>Paste this into your agent</h3>
            <CopyField value={paste} />
            <p className="cd-muted">{AGENTS[agent][1]} It installs Clep's recorder, lists your app's features and records a first walkthrough.</p>
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

      <section className="cd-card">
        <div className="cd-card-head">
          <div>
            <h2>Keys</h2>
            <p>One key per agent or CI, so you can revoke one without touching the others.</p>
          </div>
          {fresh && <button type="button" className="cd-btn" onClick={() => setFresh(null)}>New key</button>}
        </div>
        {keys === null && <p className="cd-muted">Loading…</p>}
        {keys?.length === 0 && <p className="cd-muted">No keys yet. Create one above.</p>}
        {keys?.map((key) => (
          <div key={key.id} className="cd-keyrow">
            <div>
              <b>{key.label ?? "Untitled key"}</b>
              <code>{key.prefix}••••••••</code>
              <small className="cd-muted">
                Created {ago(key.created_at)} · {key.last_used_at ? `last used ${ago(key.last_used_at)}` : "never used"}
              </small>
            </div>
            <button type="button" className="cd-btn cd-btn-danger cd-btn-sm" onClick={() => void revoke(key)}>Revoke</button>
          </div>
        ))}
      </section>
    </div>
  );
}
