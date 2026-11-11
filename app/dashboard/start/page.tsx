"use client";

import { useState } from "react";
import Link from "next/link";
import "./start.css";
import { Ico } from "../../../components/dash/icons";
import { CopyField, PageHead } from "../../../components/dash/ui";
import { useDash } from "../../../lib/dashboard";
import { API_BASE, createKey } from "../../../lib/platform";

const AGENTS: [string, string][] = [
  ["Claude Code", "Open Claude Code in your project folder and paste it."],
  ["Cursor", "Paste it into Cursor's agent chat with the project open."],
  ["Codex", "Start Codex in your project folder and paste it."],
  ["Windsurf", "Paste it into Cascade with the project open."],
  ["Other", "Any agent that can read a URL and run shell commands works."],
];

const FIRST_ASKS = [
  "Make a 30 second demo video of the signup flow",
  "Record a 45 second walkthrough of the dashboard",
  "Make a launch clip of the new export feature",
];

type Status = "done" | "current" | "next";

export default function Start() {
  const { projects, clips, account, refresh, fail } = useDash();
  const [agent, setAgent] = useState(0);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  const keyCount = account?.keys ?? 0;
  const connected = projects[0];
  const steps = [newKey ? keySaved : keyCount > 0, !!account?.connected || !!connected || clips.length > 0,
    clips.some((clip) => clip.status === "done")];
  const current = steps.findIndex((done) => !done);
  const status = (index: number): Status => (steps[index] ? "done" : index === current ? "current" : "next");
  const doneCount = steps.filter(Boolean).length;

  const makeKey = async () => {
    setCreating(true);
    try {
      setNewKey((await createKey({ label: AGENTS[agent][0], expires_in_days: null })).key);
      await refresh();
    } catch (e) {
      fail(e);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="cd-page cd-start">
      <PageHead title="Getting started" sub="Three steps, about two minutes. After that you just ask your coding agent for a demo." />

      <div className="cd-start-progress" aria-label={`${doneCount} of 3 steps done`}>
        <div><span style={{ width: `${(doneCount / 3) * 100}%` }} /></div>
        <b>{doneCount === 3 ? "All set" : `${doneCount} of 3 done`}</b>
      </div>

      <div className="cd-start-layout">
        <ol className="cd-start-steps">
          <Step n={1} status={status(0)} title="Create your API key" summary={keyCount ? `${keyCount} key${keyCount === 1 ? "" : "s"} ready` : undefined}>
            {newKey ? (
              <>
                <p>Add this line to your shell profile (<code>~/.zshrc</code>) or your project&apos;s <code>.env</code>. It is shown only once.</p>
                <CopyField value={`export CLEP_API_KEY=${newKey}`} />
                <div className="cd-start-actions">
                  <button type="button" className="cd-btn cd-btn-pink" onClick={() => setKeySaved(true)}>I saved it, next step {Ico.arrow}</button>
                </div>
              </>
            ) : (
              <>
                <p>Your agent&apos;s tools read the key from your environment, so it never goes into the chat.</p>
                <div className="cd-start-actions">
                  <button type="button" className="cd-btn cd-btn-pink" disabled={creating} onClick={() => void makeKey()}>
                    {creating ? "Creating…" : keyCount ? "Create another key" : "Create my key"}
                  </button>
                  {keyCount > 0 && <Link href="/dashboard/keys" className="cd-btn">Manage keys {Ico.arrow}</Link>}
                </div>
              </>
            )}
          </Step>

          <Step n={2} status={status(1)} title="Connect your coding agent"
            summary={connected ? `${connected.name}${connected.framework ? ` · ${connected.framework}` : ""}` : "Connected"}>
            <div className="cd-pills cd-pills-btn" role="tablist">
              {AGENTS.map(([name], index) => (
                <button key={name} type="button" role="tab" aria-selected={agent === index} className={agent === index ? "on" : ""} onClick={() => setAgent(index)}>
                  {name}
                </button>
              ))}
            </div>
            <p>{AGENTS[agent][1]}</p>
            <CopyField value={`Set up Clep for this project: read ${API_BASE}/skill.md and follow it`} mono={false} />
            {status(1) !== "done" && <p className="cd-start-waiting"><i /> Waiting for your agent to call Clep…</p>}
          </Step>

          <Step n={3} status={status(2)} title="Ask for your first video" summary="Your first video is ready">
            <p>Ask in your own words. Your agent plans the shoot, checks it for free, then renders it here.</p>
            <div className="cd-start-asks">
              {FIRST_ASKS.map((ask) => <CopyField key={ask} value={ask} mono={false} />)}
            </div>
          </Step>
        </ol>

        <aside className="cd-card cd-start-aside">
          {doneCount === 3 ? (
            <>
              <h3>You&apos;re all set</h3>
              <p>Ask your agent for a demo any time. Every video lands in Videos.</p>
              <Link href="/dashboard/videos" className="cd-btn cd-btn-pink">Open videos {Ico.arrow}</Link>
            </>
          ) : (
            <>
              <h3>Good to know</h3>
              <ul>
                <li>{Ico.check}<span>Works with apps on <b>localhost</b>: recording happens on your machine.</span></li>
                <li>{Ico.check}<span>Every video gets a <b>free check</b> before any export minutes are used.</span></li>
                <li>{Ico.check}<span>Private fields like emails and keys are <b>blurred</b> before upload.</span></li>
                <li>{Ico.check}<span>Make every video look like you in <Link href="/dashboard/brand">Brand kit</Link>.</span></li>
              </ul>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

function Step({ n, status, title, summary, children }: { n: number; status: Status; title: string; summary?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const showing = status === "current" || open;
  return (
    <li className={`cd-start-step ${status}`}>
      <span className="cd-start-n">{status === "done" ? Ico.check : n}</span>
      <div>
        <div className="cd-start-head">
          <h3>{title}</h3>
          {status === "done" && (
            <button type="button" className="cd-start-toggle" onClick={() => setOpen(!open)}>{open ? "Hide" : "Show"}</button>
          )}
        </div>
        {status === "done" && summary && !open && <p className="cd-start-summary"><i /> {summary}</p>}
        {status === "next" && <p className="cd-start-later">Unlocks after step {n - 1}</p>}
        {showing && <div className="cd-start-body">{children}</div>}
      </div>
    </li>
  );
}
