"use client";

import { useState } from "react";
import InViewVideo from "../../../components/InViewVideo";
import { PageHead } from "../../../components/dash/ui";
import { useDash } from "../../../lib/dashboard";
import { videoSrc } from "../../../lib/landing";
import { SHOWCASE, SHOWCASE_TABS } from "../../../lib/showcase";

export default function Showcase() {
  const { account, loaded } = useDash();
  const [tab, setTab] = useState<(typeof SHOWCASE_TABS)[number]["key"]>("all");
  const shown = SHOWCASE.filter((video) => tab === "all" || video.kind === tab);

  if (!loaded || !account?.is_admin) {
    return (
      <div className="cd-page cd-narrow">
        <PageHead title="Showcase" sub={loaded ? "This page is not available." : "Loading…"} />
      </div>
    );
  }

  return (
    <div className="cd-page">
      <PageHead title="Showcase" sub="Product demos Clep has made, and every effect it picks. Scroll, watch, then ask your agent for yours." />

      <div className="cd-toolbar">
        <div className="cd-tabs" role="tablist">
          {SHOWCASE_TABS.map((t) => (
            <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}>
              {t.label}
              <span>{SHOWCASE.filter((video) => t.key === "all" || video.kind === t.key).length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="cd-showcase">
        {shown.map((video) => (
          <a key={video.slug} href={videoSrc(video.slug)} target="_blank" rel="noreferrer" className="cd-showcase-tile">
            <InViewVideo slug={video.slug} className="cd-showcase-video" />
            <h3>{video.title}</h3>
            <p>{video.line}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
