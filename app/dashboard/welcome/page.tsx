"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Ico } from "../../../components/dash/icons";
import CreateKeyForm from "../../../components/dash/keys/CreateKeyForm";
import NewKeyPanel from "../../../components/dash/keys/NewKeyPanel";
import { CopyField } from "../../../components/dash/ui";
import { useDash } from "../../../lib/dashboard";
import { API_BASE, type CreatedKey } from "../../../lib/platform";
import "../keys/keys.css";
import "./welcome.css";

const STEPS = ["Welcome", "API key", "Connect agent", "First call", "First video"];
const AGENTS: [string, string][] = [
  ["Claude Code", "Open Claude Code in your project folder and paste it."],
  ["Cursor", "Open Cursor's agent chat with the project and paste it."],
  ["Codex", "Start Codex in your project folder and paste it."],
  ["Windsurf", "Paste it into Cascade with the project open."],
  ["Other", "Any agent that can read a URL and run shell commands works."],
];
const FIRST_VIDEOS = [
  "Make a 15s walkthrough of our landing page with Clep",
  "Record a demo of the signup flow with Clep, cinematic look",
  "Make a vertical 9:16 clip of the dashboard for social",
];

export default function Welcome() {
  const { account, projects, clips, refresh } = useDash();
  const [step, setStep] = useState(0);
  const [created, setCreated] = useState<CreatedKey | null>(null);
  const [saved, setSaved] = useState(false);
  const [agent, setAgent] = useState(0);
  const name = account?.user.name?.split(" ")[0] || "there";
  const connected = !!account?.connected || projects.length > 0 || clips.length > 0;
  const hasKey = saved || (account?.keys ?? 0) > 0;

  useEffect(() => {
    if (step !== 3 || connected) return;
    const timer = window.setInterval(() => void refresh(), 4000);
    return () => window.clearInterval(timer);
  }, [step, connected, refresh]);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const paste = `Set up Clep for this project: read ${API_BASE}/skill.md and follow it`;

  return (
    <div className="cd-page cd-narrow cd-welcome">
      <ol className="cd-wizard-steps" aria-label="Setup progress">
        {STEPS.map((label, i) => (
          <li key={label} className={i < step ? "done" : i === step ? "now" : ""}>
            <button type="button" onClick={() => i <= step && setStep(i)} disabled={i > step}>
              <span>{i < step ? Ico.check : i + 1}</span>
              {label}
            </button>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <section className="cd-card cd-wizard-card">
          <p className="cd-hero-eyebrow">Welcome to Clep</p>
          <h1>Hi {name}, let&apos;s make your first video.</h1>
          <p className="cd-muted">Your coding agent records your app; Clep edits it into a polished clip. Setup takes about two minutes:</p>
          <ul className="cd-wizard-list">
            <li>{Ico.keys} Create an API key and add it to your environment</li>
            <li>{Ico.integrations} Paste one line into your agent to install Clep</li>
            <li>{Ico.videos} Ask for a video in plain words</li>
          </ul>
          <div className="cd-admin-actions cd-wizard-nav">
            <Link href="/dashboard" className="cd-btn">Skip for now</Link>
            <button type="button" className="cd-btn cd-btn-pink cd-btn-lg" onClick={next}>Let&apos;s go {Ico.arrow}</button>
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="cd-card cd-wizard-card">
          <h2>Create your API key</h2>
          <p className="cd-muted">It lives in your environment as CLEP_API_KEY, never in the agent's chat. Name it after where it runs, so you can tell keys apart later.</p>
          {created && !saved ? (
            <NewKeyPanel created={created} rotated={false} onDone={() => { setSaved(true); next(); }} />
          ) : (
            <>
              {hasKey && <p className="cd-connected"><i /> You have a key. Create another one or continue.</p>}
              <CreateKeyForm suggestion={`${AGENTS[agent][0]} on my laptop`} onCreated={(key) => { setCreated(key); void refresh(); }} />
              {hasKey && <div className="cd-wizard-nav"><button type="button" className="cd-btn cd-btn-pink" onClick={next}>Continue {Ico.arrow}</button></div>}
            </>
          )}
        </section>
      )}

      {step === 2 && (
        <section className="cd-card cd-wizard-card">
          <h2>Connect your coding agent</h2>
          <div className="cd-pills cd-pills-btn" role="tablist">
            {AGENTS.map(([agentName], i) => (
              <button key={agentName} type="button" role="tab" aria-selected={agent === i} className={agent === i ? "on" : ""} onClick={() => setAgent(i)}>{agentName}</button>
            ))}
          </div>
          <ol className="cd-onboard">
            <li>
              <span className="cd-step-n">1</span>
              <div>
                <h3>Add the key to your environment</h3>
                <CopyField value={created ? `export CLEP_API_KEY=${created.key}` : "export CLEP_API_KEY=clep_sk_…"} display={created ? `export CLEP_API_KEY=${created.key.slice(0, 12)}••••••••` : undefined} />
                <p className="cd-muted">{created ? "" : "Use the key you copied in the last step. "}Run it in the terminal you start the agent from, or add the line to <code>~/.zshrc</code> to keep it in every terminal. Clep's tools read it from there; never paste the key into the agent's chat.</p>
              </div>
            </li>
            <li>
              <span className="cd-step-n">2</span>
              <div>
                <h3>Paste this into {AGENTS[agent][0]}</h3>
                <CopyField value={paste} />
                <p className="cd-muted">{AGENTS[agent][1]} It installs Clep's recorder and lists your app's features.</p>
              </div>
            </li>
          </ol>
          <div className="cd-wizard-nav"><button type="button" className="cd-btn cd-btn-pink" onClick={next}>I pasted it {Ico.arrow}</button></div>
        </section>
      )}

      {step === 3 && (
        <section className="cd-card cd-wizard-card">
          <h2>{connected ? "Your agent is connected" : "Waiting for your agent…"}</h2>
          {connected ? (
            <p className="cd-connected"><i /> Connected{projects[0] && <> · {projects[0].name}{projects[0].framework && ` · ${projects[0].framework}`}</>}</p>
          ) : (
            <>
              <p className="cd-waiting"><i /> Listening for the first call with your key. This updates by itself.</p>
              <p className="cd-muted">Not turning green? Check the agent printed no 401, that <code>CLEP_API_KEY</code> is set in the same terminal, and that the key isn't paused.</p>
            </>
          )}
          <div className="cd-wizard-nav">
            {!connected && <button type="button" className="cd-btn" onClick={next}>Skip this check</button>}
            <button type="button" className="cd-btn cd-btn-pink" onClick={next} disabled={!connected}>Continue {Ico.arrow}</button>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="cd-card cd-wizard-card">
          <h2>Ask for your first video</h2>
          <p className="cd-muted">Say it to your agent in plain words. It records, Clep edits, and the clip shows up in Videos while it renders.</p>
          <div className="cd-stack">
            {FIRST_VIDEOS.map((prompt) => <CopyField key={prompt} value={prompt} mono={false} />)}
          </div>
          <p className="cd-muted">Want every clip on your colours and frame? Set up your <Link href="/dashboard/brand" className="cd-link">Brand kit</Link> first.</p>
          <div className="cd-wizard-nav"><Link href="/dashboard" className="cd-btn cd-btn-pink cd-btn-lg">Go to my dashboard {Ico.arrow}</Link></div>
        </section>
      )}
    </div>
  );
}
