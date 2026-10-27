"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Ico } from "../../components/dash/icons";
import { Empty, VideoRow, thisMonth } from "../../components/dash/ui";
import { useDash } from "../../lib/dashboard";
import { isBusy } from "../../lib/platform";

const HIDE_WELCOME = "clep_hide_welcome";
const WEEK = 7 * 24 * 3600 * 1000;

const STEPS = [
  { title: "Create your API key", text: "Generate a key and give it to your agent", href: "/dashboard/keys", icon: Ico.keys },
  { title: "Install the skill", text: "Paste one line into your coding agent", href: "/dashboard/keys", icon: Ico.integrations },
  { title: "Connect your project", text: "Your agent lists the app's features", href: "/dashboard/projects", icon: Ico.projects },
  { title: "Start shipping", text: "Push a feature and get a video", href: "/dashboard/videos", icon: Ico.videos },
];

/** Count per day for the last `days` days, oldest first. */
function perDay(dates: string[], days = 7) {
  const out = new Array(days).fill(0);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  for (const d of dates) {
    const i = days - 1 - Math.floor((start.getTime() - new Date(d).setHours(0, 0, 0, 0)) / 86400000);
    if (i >= 0 && i < days) out[i]++;
  }
  return out;
}

export default function Home() {
  const { clips, projects, account, loaded, err } = useDash();
  const [welcome, setWelcome] = useState(false);

  useEffect(() => {
    try {
      setWelcome(window.localStorage.getItem(HIDE_WELCOME) !== "1");
    } catch {
      setWelcome(true);
    }
  }, []);

  const hideWelcome = () => {
    setWelcome(false);
    try {
      window.localStorage.setItem(HIDE_WELCOME, "1");
    } catch {}
  };

  const ready = clips.filter((j) => j.status === "done");
  const week = ready.filter((j) => Date.now() - new Date(j.created_at).getTime() < WEEK).length;
  const month = thisMonth(clips);
  const live = clips.filter(isBusy);
  const features = projects.reduce((n, p) => n + p.features.length, 0);

  const agentSeen = !!account?.connected || projects.length > 0 || clips.length > 0;
  const setup = [
    { label: "Create an API key", done: (account?.keys ?? 0) > 0, href: "/dashboard/keys" },
    { label: "Install the Clep skill in your agent", done: agentSeen, href: "/dashboard/keys" },
    { label: "Connect your first project", done: projects.length > 0, href: "/dashboard/projects" },
    { label: "Record your first video", done: ready.length > 0, href: "/dashboard/keys" },
  ];
  const setupDone = setup.filter((s) => s.done).length;

  const byKind = [
    { label: "Feature demos", n: month.filter((j) => j.kind === "feature").length },
    { label: "Walkthroughs", n: month.filter((j) => j.kind === "tour" || j.kind === "launch").length },
    { label: "Local recordings", n: month.filter((j) => j.kind === "local").length },
    { label: "Other", n: month.filter((j) => !["feature", "tour", "launch", "local"].includes(j.kind ?? "")).length },
  ];

  return (
    <div className="cd-page">
      {welcome && (
        <section className="cd-hero">
          <button type="button" className="cd-hero-close" onClick={hideWelcome} aria-label="Hide welcome">{Ico.close}</button>
          <div className="cd-hero-copy">
            <p className="cd-hero-eyebrow">Welcome to Clep</p>
            <h1>Turn your code <span>into videos</span></h1>
            <p>Connect your coding agent once. Every time you ship a feature, Clep records, edits and delivers a ready-to-publish video.</p>
            <div className="cd-hero-cta">
              <Link href="/dashboard/keys" className="cd-btn cd-btn-pink cd-btn-lg">Get Started {Ico.arrow}</Link>
              <Link href="/#work" className="cd-btn cd-btn-glass cd-btn-lg">{Ico.play} See what it makes</Link>
            </div>
          </div>
          <ol className="cd-hero-steps">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <Link href={s.href}>
                  <span className="cd-step-n">{i + 1}</span>
                  <span className="cd-step-ico">{s.icon}</span>
                  <span>
                    <b>{s.title}</b>
                    <small>{s.text}</small>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      {err && <p className="cd-error">{err}</p>}

      <section className="cd-stats">
        <Stat icon={Ico.camera} label="Videos created" value={ready.length} note={week ? `+${week} this week` : "None this week yet"} good={week > 0} trend={perDay(ready.map((j) => j.created_at))} />
        <Stat icon={Ico.clock} label="Started this month" value={month.length} note="Every clip your agent asked for" trend={perDay(clips.map((j) => j.created_at))} green />
        <Stat icon={Ico.bolt} label="Rendering now" value={live.length} note={live.length ? `${live[0].stage ?? "queued"} · ${live[0].progress}%` : "Nothing in the queue"} />
        <Stat icon={Ico.folder} label="Projects" value={projects.length} note={`${features} feature${features === 1 ? "" : "s"} found`} />
      </section>

      <div className="cd-split">
        <section className="cd-card">
          <div className="cd-card-head">
            <div>
              <h2>Recent videos</h2>
              <p>Your latest demos, recorded by your agent and edited by Clep.</p>
            </div>
            <Link href="/dashboard/videos" className="cd-btn">View all {Ico.arrow}</Link>
          </div>
          {!loaded && <p className="cd-muted">Loading…</p>}
          {loaded && clips.length === 0 && (
            <Empty title="No videos yet" text="Ask your agent for a demo, e.g. “make a 20s demo of the signup flow”. It shows up here live.">
              <Link href="/dashboard/keys" className="cd-btn cd-btn-pink">Connect your agent {Ico.arrow}</Link>
            </Empty>
          )}
          <div className="cd-rows">
            {clips.slice(0, 5).map((j) => <VideoRow key={j.id} clip={j} />)}
          </div>
        </section>

        <div className="cd-stack">
          <section className="cd-card">
            <div className="cd-card-head">
              <h2>Finish setup</h2>
              <span className="cd-muted">{setupDone} / {setup.length}</span>
            </div>
            <div className="cd-bar cd-bar-lg"><i style={{ width: `${(setupDone / setup.length) * 100}%` }} /></div>
            <ul className="cd-checklist">
              {setup.map((s) => (
                <li key={s.label}>
                  <Link href={s.href} className={s.done ? "done" : ""}>
                    <span className="cd-check">{s.done && Ico.check}</span>
                    {s.label}
                    {!s.done && <span className="cd-chev">{Ico.chevron}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="cd-card">
            <div className="cd-card-head">
              <h2>This month</h2>
              <Link href="/dashboard/billing" className="cd-btn cd-btn-sm">View usage {Ico.arrow}</Link>
            </div>
            <p className="cd-label">Videos started</p>
            <p className="cd-big">{month.length}</p>
            <ul className="cd-legend">
              {byKind.map((k) => (
                <li key={k.label}><i />{k.label}<b>{k.n}</b></li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, note, good, trend, green }: { icon: React.ReactNode; label: string; value: number; note: string; good?: boolean; trend?: number[]; green?: boolean }) {
  return (
    <div className="cd-stat">
      <span className="cd-stat-ico">{icon}</span>
      <div className="cd-stat-text">
        <p className="cd-label">{label}</p>
        <p className="cd-big">{value}</p>
        <p className={`cd-stat-note ${good ? "good" : ""}`}>{note}</p>
      </div>
      {trend && trend.some(Boolean) && <Spark values={trend} green={green} />}
    </div>
  );
}

/** A tiny line of the last 7 days, filled underneath. */
function Spark({ values, green }: { values: number[]; green?: boolean }) {
  const W = 72, H = 30, max = Math.max(...values, 1);
  const pts = values.map((v, i) => [(i / (values.length - 1)) * W, H - 4 - (v / max) * (H - 8)]);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const id = green ? "spk-g" : "spk-p";
  return (
    <svg className={`cd-spark ${green ? "green" : ""}`} width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${W},${H} L0,${H} Z`} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
