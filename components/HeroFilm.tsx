"use client";

import { useRef, useState } from "react";
import { HERO_VIDEO, posterSrc, videoSrc } from "../lib/landing";

export default function HeroFilm() {
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
        src={videoSrc(HERO_VIDEO.slug)}
        poster={posterSrc(HERO_VIDEO.slug)}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
      <button type="button" className="film-sound" onClick={toggleSound}>
        {muted ? "Sound on" : "Sound off"}
      </button>
      <figcaption className="film-caption">
        <strong>{HERO_VIDEO.title}</strong> · {HERO_VIDEO.line}
      </figcaption>
    </figure>
  );
}
