"use client";

import { useState } from "react";
import { jobTitle, retryJob, videoObjectUrl, type Job } from "../lib/platform";

const STATUS: Record<Job["status"], string> = { queued: "Queued…", running: "Rendering…", done: "Ready", failed: "Failed" };

function fileName(j: Job) {
  return `${jobTitle(j).replace(/[^\w-]+/g, "-").toLowerCase().slice(0, 60) || "clep"}.mp4`;
}

/** One job: a status tile while it renders, the video once it's done, retry when it failed. */
export default function JobCard({ job, onChange, onToast }: { job: Job; onChange: () => void; onToast: (m: string) => void }) {
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const vertical = job.engine === "reels";

  const load = async () => {
    if (!job.video || src) return src;
    setLoading(true);
    try {
      const u = await videoObjectUrl(job.video.id);
      setSrc(u);
      return u;
    } catch (e) {
      onToast(e instanceof Error ? e.message : "Couldn't load the video");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const download = async () => {
    const u = await load();
    if (!u) return;
    const a = document.createElement("a");
    a.href = u;
    a.download = fileName(job);
    a.click();
  };

  const retry = async () => {
    try {
      const r = await retryJob(job.id);
      onToast(r.from_draft ? "Re-rendering from the saved draft" : "Running it again");
      onChange();
    } catch (e) {
      onToast(e instanceof Error ? e.message : "Couldn't retry");
    }
  };

  return (
    <figure className={`jc ${vertical ? "jc-reel" : "jc-motion"}`}>
      <div className="jc-frame">
        {src ? (
          <video src={src} controls autoPlay playsInline />
        ) : job.status === "done" && job.video ? (
          <button type="button" className="jc-play" onClick={() => void load()} aria-label={`Play ${jobTitle(job)}`}>
            {loading ? <i className="mk-spin" /> : "▶"}
          </button>
        ) : (
          <span className={`jc-wait ${job.status === "failed" ? "failed" : ""}`}>
            {job.status !== "failed" && <i className="mk-spin" />} {STATUS[job.status]}
          </span>
        )}
        <span className="jc-kind">{vertical ? "Reel" : "Motion"}</span>
      </div>
      <figcaption>
        <b title={jobTitle(job)}>{jobTitle(job)}</b>
        {job.status === "failed" && job.error && <span className="jc-err" title={job.error}>{job.error}</span>}
        <span className="jc-actions">
          <span>{new Date(job.created_at).toLocaleDateString()}</span>
          {job.status === "done" && job.video && (
            <button type="button" className="mk-mini-link" onClick={() => void download()}>
              Download
            </button>
          )}
          {job.status === "failed" && (
            <button type="button" className="mk-mini-link" onClick={() => void retry()}>
              Retry
            </button>
          )}
        </span>
      </figcaption>
    </figure>
  );
}
