"use client";

import { useEffect, useState } from "react";
import { SHOWCASE, showcasePoster, showcaseSrc, type ShowcaseVideo, type VideoKind } from "../lib/gallery";

/** Pinterest-style masonry of showcase videos for the selected kind. Hover plays, click opens. */
export default function Gallery({ kind }: { kind: VideoKind }) {
  const [open, setOpen] = useState<ShowcaseVideo | null>(null);
  const items = SHOWCASE.filter((v) => v.kind === kind);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <div className={`gx gx-${kind}`}>
        {items.map((v) => (
          <figure key={v.slug} className="gx-pin">
            <button
              type="button"
              className="gx-frame"
              onClick={() => setOpen(v)}
              onMouseEnter={(e) => e.currentTarget.querySelector("video")?.play().catch(() => {})}
              onMouseLeave={(e) => {
                const el = e.currentTarget.querySelector("video");
                if (el) {
                  el.pause();
                  el.currentTime = 0;
                }
              }}
              aria-label={`Play ${v.title}`}
            >
              <video src={showcaseSrc(v)} poster={showcasePoster(v)} muted loop playsInline preload="none" />
              <span className="gx-dur">{v.duration}</span>
            </button>
            <figcaption>
              <b title={v.title}>{v.title}</b>
              <span>{v.line}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      {open && (
        <div className="gx-modal" onClick={() => setOpen(null)} role="dialog" aria-label={open.title}>
          <div className={`gx-modal-body gx-${open.kind}`} onClick={(e) => e.stopPropagation()}>
            <video src={showcaseSrc(open)} poster={showcasePoster(open)} controls autoPlay playsInline />
            <div className="gx-modal-cap">
              <b>{open.title}</b>
              <span>{open.tags}</span>
            </div>
          </div>
          <button type="button" className="gx-close" onClick={() => setOpen(null)} aria-label="Close">
            ✕
          </button>
        </div>
      )}
    </>
  );
}
