"use client";

import { useRef, useState } from "react";

/** Phones get a lighter 720p cut of the same film (a 14MB 1080p60 file stalls on mobile data). */
export default function HeroFilm({ src, mobileSrc, poster }: { src: string; mobileSrc?: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  const toggleSound = () => {
    const video = ref.current;
    if (!video) return;
    video.muted = !muted;
    if (muted) video.play().catch(() => {});
    setMuted(!muted);
  };

  return (
    <figure className="film">
      <video
        ref={ref}
        className="film-video"
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        {mobileSrc && <source src={mobileSrc} type="video/mp4" media="(max-width: 760px)" />}
        <source src={src} type="video/mp4" />
      </video>
      <button type="button" className="film-sound" onClick={toggleSound}>
        {muted ? "Sound on" : "Sound off"}
      </button>
    </figure>
  );
}
