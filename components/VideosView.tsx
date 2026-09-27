"use client";

import { useEffect, useState } from "react";
import { hideVideo, listVideos, motionFile, type Video } from "../lib/motion";

function ago(epochSeconds: number): string {
  const mins = Math.floor((Date.now() - epochSeconds * 1000) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(epochSeconds * 1000).toLocaleDateString();
}

const mb = (b: number | null) => (b ? `${(b / 1e6).toFixed(1)} MB` : null);
const secs = (d: number | null) => (d ? `${Math.round(d)}s` : null);

function fileName(v: Video) {
  return `${(v.title || "clep").replace(/[^\w-]+/g, "-").toLowerCase()}-${v.format.replace(":", "x")}.mp4`;
}

export default function VideosView({ onToast, onCreate }: { onToast: (m: string) => void; onCreate: () => void }) {
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState<Video | null>(null);

  useEffect(() => {
    listVideos()
      .then((r) => setVideos(r.videos))
      .catch((e) => setErr(e instanceof Error ? e.message : "Couldn't load videos"));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const remove = async (v: Video) => {
    if (!window.confirm(`Remove “${v.title || "Untitled"}” from your library?`)) return;
    try {
      await hideVideo(v.id);
      setVideos((vs) => (vs ?? []).filter((x) => x.id !== v.id));
      if (open?.id === v.id) setOpen(null);
      onToast("Video removed");
    } catch (e) {
      onToast(e instanceof Error ? e.message : "Couldn't remove video");
    }
  };

  return (
    <div className="vl">
      <div className="mk-pagehead">
        <div>
          <h1>Videos</h1>
          <p>Everything you&apos;ve rendered. Play, download, or clean up.</p>
        </div>
        {videos && videos.length > 0 && <span className="ms-usage">{videos.length} videos</span>}
      </div>

      {err && <p className="mk-form-error">{err}</p>}

      {!videos && !err && (
        <div className="vl-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="vl-card vl-skel">
              <span className="vl-media" />
              <span className="vl-line" />
              <span className="vl-line short" />
            </div>
          ))}
        </div>
      )}

      {videos && videos.length === 0 && (
        <div className="vl-empty">
          <span className="ico-sq">▶</span>
          <h2>No videos yet</h2>
          <p>Render a video in Create and it lands here.</p>
          <button className="mk-btn-dark" onClick={onCreate}>
            Make a video →
          </button>
        </div>
      )}

      {videos && videos.length > 0 && (
        <div className="vl-grid">
          {videos.map((v) => {
            const src = motionFile(v.url);
            const meta = [v.format, secs(v.duration), mb(v.bytes)].filter(Boolean).join(" · ");
            return (
              <div key={v.id} className="vl-card">
                <button
                  type="button"
                  className="vl-media"
                  onClick={() => setOpen(v)}
                  onMouseEnter={(e) => e.currentTarget.querySelector("video")?.play().catch(() => {})}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget.querySelector("video");
                    if (el) {
                      el.pause();
                      el.currentTime = 0;
                    }
                  }}
                  aria-label={`Play ${v.title || "video"}`}
                >
                  <video src={src ? `${src}#t=0.5` : undefined} muted loop playsInline preload="metadata" />
                  <span className="vl-play" aria-hidden>
                    ▶
                  </span>
                  <span className="vl-fmt">{v.format}</span>
                </button>
                <div className="vl-info">
                  <b title={v.title}>{v.title || "Untitled"}</b>
                  <span>
                    {v.template ? `${v.template.replace(/-/g, " ")} · ` : ""}
                    {ago(v.created)}
                  </span>
                  {meta && <span className="vl-meta">{meta}</span>}
                </div>
                <div className="vl-actions">
                  <a className="mk-btn-light" href={src ? `${src}?dl=${encodeURIComponent(fileName(v))}` : undefined}>
                    Download
                  </a>
                  <button className="vl-del" onClick={() => void remove(v)} aria-label="Remove video" title="Remove">
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {open && (
        <div className="vl-modal" onClick={() => setOpen(null)} role="dialog" aria-modal="true" aria-label={open.title}>
          <div className="vl-modal-in" onClick={(e) => e.stopPropagation()}>
            <video src={motionFile(open.url)} controls autoPlay playsInline />
            <div className="vl-modal-bar">
              <b>{open.title || "Untitled"}</b>
              <span>
                {open.format} · {ago(open.created)}
              </span>
              <a className="mk-btn-dark" href={`${motionFile(open.url)}?dl=${encodeURIComponent(fileName(open))}`}>
                Download
              </a>
              <button className="mk-btn-light" onClick={() => setOpen(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
