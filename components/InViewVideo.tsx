"use client";

import { useEffect, useRef, useState } from "react";
import { posterSrc, videoSrc } from "../lib/landing";

export default function InViewVideo({ slug, className = "" }: { slug: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  // Posters load eagerly even with preload="none", so a page of clips cost ~1MB up front.
  const [near, setNear] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const nearby = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setNear(true); nearby.disconnect(); }
    }, { rootMargin: "600px 0px" });
    nearby.observe(video);
    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? video.play().catch(() => {}) : video.pause()),
      { threshold: 0.35 }
    );
    observer.observe(video);
    return () => { nearby.disconnect(); observer.disconnect(); };
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      src={near ? videoSrc(slug) : undefined}
      poster={near ? posterSrc(slug) : undefined}
      muted
      loop
      playsInline
      preload="none"
    />
  );
}
