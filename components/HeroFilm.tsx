"use client";

import { useRef, useState } from "react";

export default function HeroFilm({ src }: { src: string }) {
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
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
      <button type="button" className="film-sound" onClick={toggleSound}>
        {muted ? "Sound on" : "Sound off"}
      </button>
    </figure>
  );
}
