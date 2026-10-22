"use client";

import { useEffect, useRef } from "react";
import { posterSrc, videoSrc } from "../lib/landing";

export default function InViewVideo({ slug, className = "" }: { slug: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? video.play().catch(() => {}) : video.pause()),
      { threshold: 0.35 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      src={videoSrc(slug)}
      poster={posterSrc(slug)}
      muted
      loop
      playsInline
      preload="none"
    />
  );
}
