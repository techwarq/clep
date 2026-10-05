"use client";

import type { Job } from "../lib/platform";
import JobCard from "./JobCard";

/** Every job on this key, newest first: rendering, ready to play/download, or failed with retry. */
export default function VideosView({
  jobs,
  loaded,
  err,
  onJobs,
  onToast,
  onCreate,
}: {
  jobs: Job[];
  loaded: boolean;
  err: string | null;
  onJobs: () => void;
  onToast: (m: string) => void;
  onCreate: () => void;
}) {
  const done = jobs.filter((j) => j.status === "done").length;
  return (
    <div className="vl">
      <div className="mk-pagehead">
        <div>
          <h1>Videos</h1>
          <p>Everything you&apos;ve made. Play, download, or retry what failed.</p>
        </div>
        {jobs.length > 0 && <span className="ms-usage">{done} ready · {jobs.length} total</span>}
      </div>

      {err && <p className="mk-form-error">{err}</p>}

      {!loaded && !err && <p className="mk-muted">Loading…</p>}

      {loaded && jobs.length === 0 && (
        <div className="vl-empty">
          <span className="ico-sq">▶</span>
          <h2>No videos yet</h2>
          <p>Make a reel or a motion video in Create and it lands here.</p>
          <button className="mk-btn-dark" onClick={onCreate}>
            Make a video →
          </button>
        </div>
      )}

      {jobs.length > 0 && (
        <div className="jc-grid">
          {jobs.map((j) => (
            <JobCard key={j.id} job={j} onChange={onJobs} onToast={onToast} />
          ))}
        </div>
      )}
    </div>
  );
}
