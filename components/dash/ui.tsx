"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ago, useDash } from "../../lib/dashboard";
import { clipTitle, clipVideoUrl, kindLabel, retryClip, type Clip } from "../../lib/platform";
import { clock, useThumb } from "../../lib/thumbs";
import { Ico } from "./icons";

export function PageHead({ title, sub, children }: { title: React.ReactNode; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="cd-head">
      <div>
        <h1 className="cd-title-row">{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {children && <div className="cd-head-actions">{children}</div>}
    </div>
  );
}

export const Soon = () => <span className="cd-soon">Soon</span>;

export function Empty({ title, text, children }: { title: string; text: string; children?: React.ReactNode }) {
  return (
    <div className="cd-empty">
      <h3>{title}</h3>
      <p>{text}</p>
      {children}
    </div>
  );
}

export const titleOf = clipTitle;

export function StatusChip({ clip }: { clip: Clip }) {
  const label = clip.status === "done" ? "Ready" : clip.status === "failed" ? "Failed" : clip.status === "queued" ? "Queued" : "Processing";
  return <span className={`cd-status ${clip.status}`}>{label}</span>;
}

export const stageText = (j: Clip) =>
  j.status === "queued" ? "Waiting for a renderer…" : j.stage ? `${j.stage[0].toUpperCase()}${j.stage.slice(1)}…` : "Rendering…";

export const fileName = (j: Clip) => `${clipTitle(j).replace(/[^\w-]+/g, "-").toLowerCase().slice(0, 60) || "clep"}.mp4`;

export async function downloadClip(clip: Clip) {
  if (!clip.video) return;
  const url = await clipVideoUrl(clip.id);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName(clip);
  a.click();
}

export function Thumb({ clip }: { clip: Clip }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [seen, setSeen] = useState(false);
  const ready = clip.status === "done" && clip.video ? clip.id : undefined;
  const thumb = useThumb(ready, seen);

  useEffect(() => {
    const el = ref.current;
    if (!el || !ready) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, [ready]);

  return (
    <Link ref={ref} href={`/dashboard/videos/${clip.id}`} className={`cd-thumb ${thumb ? "has-img" : ""} ${ready && seen && thumb === undefined ? "loading" : ""}`} aria-label={`Open ${titleOf(clip)}`}>
      {thumb && <img src={thumb.src} alt="" />}
      {!thumb && <span className="cd-thumb-kind">{kindLabel(clip)}</span>}
      <span className="cd-thumb-play">{Ico.play}</span>
      {thumb && thumb.seconds > 0 && <span className="cd-thumb-time">{clock(thumb.seconds)}</span>}
    </Link>
  );
}

/** One row in a video list: thumb, title, chips, then Download / progress / Retry. */
export function VideoRow({ clip }: { clip: Clip }) {
  const { refresh, toast } = useDash();
  const [busy, setBusy] = useState(false);
  const project = clip.url ? safeHost(clip.url) : null;

  const download = async () => {
    setBusy(true);
    try {
      await downloadClip(clip);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Couldn't download");
    } finally {
      setBusy(false);
    }
  };

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
    <div className="cd-row">
      <Thumb clip={clip} />
      <div className="cd-row-text">
        <p className="cd-row-title">
          <Link href={`/dashboard/videos/${clip.id}`}>{titleOf(clip)}</Link>
          <span className="cd-tag">{kindLabel(clip)}</span>
          <StatusChip clip={clip} />
        </p>
        <p className="cd-row-meta">
          {clip.status === "done" ? "Created" : "Started"} {ago(clip.created_at)}
          {project && <> · {project}</>}
        </p>
        {clip.status === "failed" && clip.error && <p className="cd-row-err" title={clip.error}>{clip.error}</p>}
      </div>
      <div className="cd-row-actions">
        {(clip.status === "running" || clip.status === "queued") && (
          <div className="cd-progress">
            <span>{stageText(clip)}</span>
            <div className="cd-bar"><i style={{ width: `${Math.max(clip.progress, 3)}%` }} /></div>
            <b>{clip.progress}%</b>
          </div>
        )}
        {clip.status === "done" && clip.video && (
          <button type="button" className="cd-btn" onClick={() => void download()} disabled={busy}>
            {Ico.download} {busy ? "Preparing…" : "Download"}
          </button>
        )}
        {clip.status === "failed" && <button type="button" className="cd-btn" onClick={() => void retry()}>Retry</button>}
        <RowMenu clip={clip} onRetry={retry} />
      </div>
    </div>
  );
}

function RowMenu({ clip, onRetry }: { clip: Clip; onRetry: () => Promise<void> }) {
  const { toast } = useDash();
  const [open, setOpen] = useState(false);
  const copyId = async () => {
    setOpen(false);
    try {
      await navigator.clipboard.writeText(clip.id);
      toast("Video ID copied");
    } catch {
      toast(clip.id);
    }
  };
  return (
    <div className="cd-menu-wrap">
      <button type="button" className="cd-btn cd-btn-icon" onClick={() => setOpen(!open)} aria-label="More actions" aria-expanded={open}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden><circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" /></svg>
      </button>
      {open && (
        <>
          <div className="cd-menu-scrim" onClick={() => setOpen(false)} />
          <div className="cd-menu-pop" role="menu">
            <Link href={`/dashboard/videos/${clip.id}`} role="menuitem">Open video page</Link>
            {clip.status === "failed" && (
              <button type="button" role="menuitem" onClick={() => { setOpen(false); void onRetry(); }}>Retry render</button>
            )}
            <button type="button" role="menuitem" onClick={() => void copyId()}>Copy video ID</button>
          </div>
        </>
      )}
    </div>
  );
}

export function safeHost(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

export function CopyField({ value, mono = true, display }: { value: string; mono?: boolean; display?: string }) {
  const { toast } = useDash();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast("Couldn't copy, select the text instead");
    }
  };
  return (
    <div className={`cd-copy ${mono ? "mono" : ""}`}>
      <code>{display ?? value}</code>
      <button type="button" className="cd-btn cd-btn-sm" onClick={() => void copy()}>
        {Ico.copy} {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

/** Videos started this calendar month. */
export const thisMonth = (clips: Clip[]) => {
  const now = new Date();
  return clips.filter((j) => {
    const d = new Date(j.created_at);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
};

export const minutesText = (seconds: number) => {
  const m = seconds / 60;
  return `${m >= 10 || Number.isInteger(m) ? Math.round(m) : m.toFixed(1)} min`;
};
