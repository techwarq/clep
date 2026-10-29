"use client";

import { useEffect, useRef, useState } from "react";

const STEP_MS = 3200;

const STEPS = [
  {
    name: "Record",
    call: "clep record",
    text: "Clep's recorder drives your app in a real browser. Localhost, staging, behind a login.",
  },
  {
    name: "Edit",
    call: "clep edit",
    text: "Our engine cuts it: a camera that follows every click, cursor, speed ramps, your backdrop.",
  },
  {
    name: "Ship",
    call: "clip ready",
    text: "The MP4 lands in your repo. 16:9, 9:16, 1:1 or the exact size of your landing card.",
  },
];

// [mark, line, step it belongs to]
const RUN: [string, string, number][] = [
  ["›", "make a 10s demo of the signup flow", 0],
  ["›", "clep record --url localhost:3000 --name signup", 0],
  ["→", "recorded 11.0s · uploading 42 MB", 0],
  ["→", "editing · camera, cursor, pacing", 1],
  ["→", "rendering 16:9 · 1080p", 1],
  ["✓", "clip ready: clep/signup.mp4", 2],
];

export default function HowRun() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(2);
  const [playing, setPlaying] = useState(false);

  // Start cycling once the section is on screen; reduced motion keeps the full run visible.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setActive(0);
        setPlaying(true);
        io.disconnect();
      }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % STEPS.length), STEP_MS);
    return () => clearTimeout(t);
  }, [active, playing]);

  const lastShown = RUN.reduce((last, [, , step], i) => (step <= active ? i : last), 0);

  return (
    <div ref={ref} className={`how${playing ? " playing" : ""}`}>
      <ol className="how-steps">
        {STEPS.map((step, i) => (
          <li key={step.name} className={`how-step${i === active ? " on" : ""}`}>
            <button type="button" onClick={() => setActive(i)} aria-pressed={i === active}>
              <span className="how-num">0{i + 1}</span>
              <div>
                <h3>{step.name} <code>{step.call}</code></h3>
                <p>{step.text}</p>
              </div>
            </button>
          </li>
        ))}
      </ol>
      <div className="term" aria-label="An agent making a clip">
        <div className="term-bar"><i /><i /><i /><span>~/acme · agent</span></div>
        {RUN.map(([mark, line, step], i) => (
          <p
            key={line}
            className={`${mark === "✓" ? "term-ok" : ""}${step > active ? " term-wait" : ""}${step === active ? " term-now" : ""}`}
          >
            <span>{mark}</span> {line}
            {i === lastShown && <b className="term-caret" aria-hidden />}
          </p>
        ))}
      </div>
    </div>
  );
}
