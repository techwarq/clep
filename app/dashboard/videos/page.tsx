"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Ico } from "../../../components/dash/icons";
import { Empty, PageHead, VideoRow } from "../../../components/dash/ui";
import { useDash } from "../../../lib/dashboard";
import { clipTitle, type Clip } from "../../../lib/platform";

const FILTERS: { key: string; label: string; match: (j: Clip) => boolean }[] = [
  { key: "all", label: "All", match: () => true },
  { key: "ready", label: "Ready", match: (j) => j.status === "done" },
  { key: "processing", label: "Processing", match: (j) => j.status === "running" || j.status === "queued" },
  { key: "failed", label: "Failed", match: (j) => j.status === "failed" },
];

export default function Videos() {
  return (
    <Suspense fallback={null}>
      <VideosInner />
    </Suspense>
  );
}

function VideosInner() {
  const { clips, loaded, err } = useDash();
  const params = useSearchParams();
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState(params.get("q") ?? "");

  const shown = useMemo(() => {
    const f = FILTERS.find((x) => x.key === filter) ?? FILTERS[0];
    const needle = q.trim().toLowerCase();
    return clips.filter((j) => f.match(j) && (!needle || `${clipTitle(j)} ${j.url ?? ""}`.toLowerCase().includes(needle)));
  }, [clips, filter, q]);

  return (
    <div className="cd-page">
      <PageHead title="Videos" sub="Every clip your agent asked for: live while it renders, ready to download when done." />

      <div className="cd-toolbar">
        <div className="cd-tabs" role="tablist">
          {FILTERS.map((f) => (
            <button key={f.key} type="button" role="tab" aria-selected={filter === f.key} onClick={() => setFilter(f.key)}>
              {f.label}
              <span>{clips.filter(f.match).length}</span>
            </button>
          ))}
        </div>
        <label className="cd-search cd-search-inline">
          {Ico.search}
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by title or URL" aria-label="Filter videos" />
        </label>
      </div>

      {err && <p className="cd-error">{err}</p>}

      <section className="cd-card">
        {!loaded && <p className="cd-muted">Loading…</p>}
        {loaded && clips.length === 0 && (
          <Empty title="No videos yet" text="Ask your coding agent for a demo and it appears here, stage by stage.">
            <Link href="/dashboard/keys" className="cd-btn cd-btn-pink">Connect your agent {Ico.arrow}</Link>
          </Empty>
        )}
        {loaded && clips.length > 0 && shown.length === 0 && <Empty title="Nothing matches" text="Try another filter or search." />}
        <div className="cd-rows">
          {shown.map((j) => <VideoRow key={j.id} clip={j} />)}
        </div>
      </section>
    </div>
  );
}
