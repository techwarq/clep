"use client";

import { useState } from "react";
import Link from "next/link";
import { Ico } from "../../../components/dash/icons";
import { Empty, PageHead } from "../../../components/dash/ui";
import { ago, isLocal, useDash } from "../../../lib/dashboard";
import { startClip, type Feature, type Project } from "../../../lib/platform";

function featureUrl(p: Project, f: Feature) {
  if (!p.app_url || !f.route) return p.app_url;
  try {
    return new URL(f.route, p.app_url).toString();
  } catch {
    return p.app_url;
  }
}
const agentPrompt = (f: Feature) => `make a 20s demo of the ${f.name.toLowerCase()} feature with Clep`;

/** One per repo, synced by the agent from .clep/features.json (Platform Plan §2). */
export default function Projects() {
  const { projects, clips, loaded, err } = useDash();

  return (
    <div className="cd-page">
      <PageHead title="Projects" sub="Each app your agent set up, with the features it found in the code." />
      {err && <p className="cd-error">{err}</p>}
      {!loaded && <p className="cd-muted">Loading…</p>}

      {loaded && projects.length === 0 && (
        <section className="cd-card">
          <Empty title="No projects yet" text="Paste the setup line into your coding agent. It reads your repo, writes .clep/features.json and the project appears here.">
            <Link href="/dashboard/keys" className="cd-btn cd-btn-pink">Connect your agent {Ico.arrow}</Link>
          </Empty>
        </section>
      )}

      {projects.map((p) => {
        const clipCount = clips.filter((j) => p.app_url && j.url?.startsWith(p.app_url)).length;
        return (
          <section key={p.id} className="cd-card">
            <div className="cd-card-head">
              <div>
                <h2>{p.name}</h2>
                <p>Synced from clep/features.json · {ago(p.synced_at)} · {clipCount} clip{clipCount === 1 ? "" : "s"}</p>
              </div>
              <div className="cd-chips">
                {p.framework && <span className="cd-tag">{p.framework}</span>}
                {p.app_url && <span className="cd-tag mono">{p.app_url}</span>}
              </div>
            </div>
            {p.features.length === 0 ? (
              <p className="cd-muted">No features listed yet.</p>
            ) : (
              <ul className="cd-features">
                {p.features.map((f) => <FeatureRow key={f.slug} project={p} feature={f} />)}
              </ul>
            )}
          </section>
        );
      })}

      {projects.length > 0 && (
        <p className="cd-muted cd-foot-note">
          “Make video” records on our servers for public and preview URLs. For localhost it copies a prompt for your agent, because recording needs your machine.
        </p>
      )}
    </div>
  );
}

function FeatureRow({ project, feature }: { project: Project; feature: Feature }) {
  const { refresh, toast } = useDash();
  const [busy, setBusy] = useState(false);
  const url = featureUrl(project, feature);
  const local = !url || isLocal(url);

  const make = async () => {
    if (local) {
      try {
        await navigator.clipboard.writeText(agentPrompt(feature));
        toast("Prompt copied. Paste it to your agent");
      } catch {
        toast(agentPrompt(feature));
      }
      return;
    }
    setBusy(true);
    try {
      await startClip({ url: url!, name: feature.slug, prompt: feature.description ?? undefined });
      toast(`Recording ${feature.name}. Follow it in Videos`);
      void refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Couldn't start the recording");
    } finally {
      setBusy(false);
    }
  };

  return (
    <li>
      <div>
        <p className="cd-feature-name">
          {feature.name} {feature.route && <code>{feature.route}</code>}
        </p>
        {feature.description && <p className="cd-muted">{feature.description}</p>}
        {local && <p className="cd-feature-hint">localhost only: paste the prompt to your agent</p>}
      </div>
      <button type="button" className={`cd-btn ${local ? "" : "cd-btn-pink"}`} onClick={() => void make()} disabled={busy}>
        {local ? <>{Ico.copy} Copy prompt</> : busy ? "Starting…" : <>Make video {Ico.arrow}</>}
      </button>
    </li>
  );
}
