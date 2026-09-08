"use client";

import { useEffect, useRef, useState } from "react";

export type SegOption = { key: string; label: string };

export default function SegmentedTabs({
  options,
  value,
  onChange
}: {
  options: SegOption[];
  value: string;
  onChange: (key: string) => void;
}) {
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [ind, setInd] = useState({ left: 0, width: 0, ready: false });

  useEffect(() => {
    const measure = () => {
      const el = btnRefs.current[value];
      if (el) setInd({ left: el.offsetLeft, width: el.offsetWidth, ready: true });
    };
    measure();
    window.addEventListener("resize", measure);
    // re-measure after fonts settle so the pill lands exactly
    const t = window.setTimeout(measure, 300);
    return () => {
      window.removeEventListener("resize", measure);
      window.clearTimeout(t);
    };
  }, [value, options]);

  return (
    <div className="seg-track" role="tablist" aria-label="Sample documents">
      <div
        className="seg-pill"
        aria-hidden
        style={{
          transform: `translateX(${ind.left}px)`,
          width: ind.width,
          opacity: ind.ready ? 1 : 0
        }}
      />
      {options.map((o) => (
        <button
          key={o.key}
          ref={(el) => {
            btnRefs.current[o.key] = el;
          }}
          role="tab"
          aria-selected={value === o.key}
          className={`seg-btn ${value === o.key ? "active" : ""}`}
          onClick={() => onChange(o.key)}
        >
          <span>{o.label}</span>
          <span className="seg-dot" />
        </button>
      ))}
    </div>
  );
}
