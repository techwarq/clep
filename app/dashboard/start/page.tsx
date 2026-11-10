"use client";

import { useState } from "react";
import Link from "next/link";
import { Ico } from "../../../components/dash/icons";
import { CopyField, PageHead } from "../../../components/dash/ui";
import { useDash } from "../../../lib/dashboard";
import { API_BASE } from "../../../lib/platform";

const AGENTS: [string, string][] = [
  ["Claude Code", "Paste it into Claude Code, opened in your project folder."],
  ["Cursor", "Paste it into Cursor's agent chat with the project open."],
  ["Codex", "Paste it into Codex, started in your project folder."],
  ["Windsurf", "Paste it into Cascade with the project open."],
  ["Other", "Any agent that can read a URL and run shell commands works."],
];

export default function Start() {
  const { projects, clips, account } = useDash();
  const [agent, setAgent] = useState(0);

  const paste = `Set up Clep for this project: read ${API_BASE}/skill.md and follow it`;
  const connected = projects[0];
  const agentSeen = !!account?.connected || !!connected || clips.length > 0;

  return (
    <div className="cd-page cd-narrow">
      <PageHead title="Getting started" sub="Connect your coding agent once per project. Then ask it for a demo and the video shows up here." />

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
            <span className={`cd-step-n ${account && account.keys > 0 ? "ok" : ""}`}>2</span>
            <div>
              <h3>Create an API key</h3>
              <p className="cd-muted">One per agent or CI, so you can revoke one without touching the others.</p>
              <Link href="/dashboard/keys" className="cd-btn">Go to API keys {Ico.arrow}</Link>
            </div>
          </li>
          <li>
            <span className="cd-step-n">3</span>
            <div>
              <h3>Add it to your env</h3>
              <CopyField value="CLEP_API_KEY=clep_sk_…" />
            </div>
          </li>
          <li>
            <span className="cd-step-n">4</span>
            <div>
              <h3>In your agent: paste this setup line</h3>
              <CopyField value={paste} />
              <p className="cd-muted">{AGENTS[agent][1]} It has no key in it: Clep&apos;s tools read CLEP_API_KEY from your environment, so the key never goes into the chat.</p>
            </div>
          </li>
          <li>
            <span className={`cd-step-n ${agentSeen ? "ok" : ""}`}>5</span>
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
