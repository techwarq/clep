"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Ico } from "../../../../components/dash/icons";
import { Soon, StatusChip, downloadClip, safeHost, titleOf } from "../../../../components/dash/ui";
import { ago, useDash } from "../../../../lib/dashboard";
import { clipVideoUrl, kindLabel, retryClip } from "../../../../lib/platform";

const STAGES = ["Queued", "Recording", "Editing", "Rendering", "Sound", "Ready"];
const stageIndex = (stage: string | null, status: string) => {
  if (status === "done") return STAGES.length - 1;
  if (!stage || status === "queued") return 0;
  const words: [string, number][] = [["record", 1], ["download", 1], ["start", 1], ["edit", 2], ["render", 3], ["sound", 4]];
  return words.find(([word]) => stage.toLowerCase().includes(word))?.[1] ?? 3;
};

const FORMATS = ["16:9", "9:16", "1:1", "Custom"];
const LOOKS = ["Minimal", "SaaS", "Cinematic", "Apple"];

export default function VideoPage() {
  const { id } = useParams<{ id: string }>();
  const { clips, loaded, refresh, toast } = useDash();
  const clip = clips.find((j) => j.id === id);
  const [src, setSrc] = useState<string | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  const videoId = clip?.status === "done" && clip.video ? clip.id : undefined;
  useEffect(() => {
    if (!videoId) return;
    clipVideoUrl(videoId).then(setSrc, (e) => setLoadErr(e instanceof Error ? e.message : "Couldn't load the video"));
  }, [videoId]);

  if (!clip) {
    return (
      <div className="cd-page">
        <Link href="/dashboard/videos" className="cd-back">← Videos</Link>
        <p className="cd-muted">{loaded ? "This video isn't in your account." : "Loading…"}</p>
      </div>
    );
  }

  const at = stageIndex(clip.stage, clip.status);
  const retry = async () => {
    try {
      await retryClip(clip.id);
      toast("Running it again");
      void refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Couldn't retry");
    }
  };

  return (
    <div className="cd-page">
      <Link href="/dashboard/videos" className="cd-back">← Videos</Link>
      <div className="cd-head">
        <div>
          <h1 className="cd-title-row">{titleOf(clip)} <StatusChip clip={clip} /></h1>
          <p>
            {kindLabel(clip)} · {ago(clip.created_at)}
            {clip.url && <> · {safeHost(clip.url)}</>}
          </p>
        </div>
      </div>

      <div className="cd-video-layout">
        <div className="cd-stack">
          <div className="cd-player">
            {src ? (
              <video src={src} controls autoPlay playsInline />
            ) : clip.status === "failed" ? (
              <div className="cd-player-msg">
                <p>This render failed.</p>
                {clip.error && <small>{clip.error}</small>}
                <button type="button" className="cd-btn cd-btn-pink" onClick={() => void retry()}>Retry</button>
              </div>
            ) : clip.status === "done" ? (
              <div className="cd-player-msg"><p>{loadErr ?? "Loading video…"}</p></div>
            ) : (
              <div className="cd-player-msg">
                <p>{STAGES[at]}…</p>
                <div className="cd-bar cd-bar-lg"><i style={{ width: `${Math.max(clip.progress, 3)}%` }} /></div>
                <small>{clip.progress}% · updates every few seconds</small>
              </div>
            )}
          </div>

          <ol className="cd-stages">
            {STAGES.map((s, i) => (
              <li key={s} className={clip.status === "failed" ? "" : i < at || clip.status === "done" ? "done" : i === at ? "now" : ""}>
                <span />{s}
              </li>
            ))}
          </ol>

          <div className="cd-share">
            <button type="button" className="cd-btn cd-btn-pink" disabled={!clip.video || clip.status !== "done"} onClick={() => void downloadClip(clip).catch(() => toast("Couldn't download"))}>
              {Ico.download} Download MP4
            </button>
            <button type="button" className="cd-btn" disabled>Copy link <Soon /></button>
            <button type="button" className="cd-btn" disabled>&lt;/&gt; Embed <Soon /></button>
            <button type="button" className="cd-btn" disabled>Try it (interactive) <Soon /></button>
          </div>

          <section className="cd-card">
            <div className="cd-card-head"><h2>Speed timeline <Soon /></h2></div>
            <div className="cd-timeline" aria-hidden>
              {[["1x", 18], ["1.7x", 20], ["1x", 14], ["2x", 18], ["5x", 10], ["1x", 20]].map(([s, w], i) => (
                <span key={i} style={{ flexGrow: w as number }} className={`sp-${String(s).replace(".", "")}`}>{s}</span>
              ))}
            </div>
            <p className="cd-muted">Each section gets its own speed and zoom, then re-renders from the same edit, with no new recording.</p>
          </section>
        </div>

        <aside className="cd-stack">
          <section className="cd-card">
            <h3 className="cd-side-h">Formats <Soon /></h3>
            <div className="cd-pills">{FORMATS.map((f, i) => <span key={f} className={i === 0 ? "on" : ""}>{f}</span>)}</div>
          </section>
          <section className="cd-card">
            <h3 className="cd-side-h">Change with words <Soon /></h3>
            <textarea className="cd-input" rows={3} placeholder="hold longer on the downloaded file" disabled />
            <p className="cd-muted">Clep updates the edit and re-renders.</p>
          </section>
          <section className="cd-card">
            <h3 className="cd-side-h">Captions <Soon /></h3>
            <p className="cd-muted">Word-by-word captions, a voice and an editable script. Clep writes the first draft.</p>
          </section>
          <section className="cd-card">
            <h3 className="cd-side-h">Look <Soon /></h3>
            <div className="cd-pills">{LOOKS.map((l, i) => <span key={l} className={i === 1 ? "on" : ""}>{l}</span>)}</div>
          </section>
        </aside>
      </div>
    </div>
  );
}
