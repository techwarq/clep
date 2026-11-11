/**
 * The page backdrop: a curtain of vertical light whose brightness traces wavy mountains, tallest
 * behind the headline, under a fine reeded-glass texture and grain, with a pink glow rising from
 * the base. Static SVG rendered on the server
 * (seeded, so it's identical every load), so it costs nothing per frame.
 */

const BARS = 360;
const W = 1000;
const H = 1000;

// small seeded PRNG so the server render is stable
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

const peak = (x: number, c: number, w: number, h: number) => h * Math.exp(-(((x - c) / w) ** 2));

// height of the range at x (0..1), as a fraction of the viewport
function ridge(x: number) {
  const base = 0.2 + 0.05 * Math.sin(x * 31 + 1) + 0.04 * Math.sin(x * 13);
  return Math.max(
    base,
    peak(x, 0.5, 0.08, 0.95),
    peak(x, 0.5, 0.22, 0.62),
    peak(x, 0.41, 0.045, 0.72),
    peak(x, 0.6, 0.055, 0.74),
    peak(x, 0.19, 0.05, 0.5),
    peak(x, 0.11, 0.11, 0.36),
    peak(x, 0.83, 0.06, 0.56),
    peak(x, 0.91, 0.1, 0.4)
  );
}

const bars = (() => {
  const rand = rng(7);
  const step = W / BARS;
  return Array.from({ length: BARS }, (_, i) => {
    const x = (i + 0.5) / BARS;
    const h = Math.min(0.98, ridge(x) * (0.82 + 0.32 * rand()));
    const center = 1 - Math.min(1, Math.abs(x - 0.5) * 2);
    return {
      x: i * step,
      w: step * 1.05, // touching bars: streaks come from brightness, not gaps
      y: H * (1 - h),
      h: H * h,
      o: (0.35 + 0.65 * rand()) * (0.6 + 0.4 * center),
      lit: rand() < 0.14,
    };
  });
})();

export default function Aurora() {
  return (
    <div className="hero-aurora" aria-hidden>
      <svg className="aurora-bars" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          {/* blur only vertically: the ridge melts into the sky, the streaks stay crisp side to side */}
          <filter id="aurora-soft" x="-5%" y="-20%" width="110%" height="140%">
            <feGaussianBlur stdDeviation="0.5 22" />
          </filter>
          {/* each bar fades out toward its own top, so the ridge line stays soft */}
          <linearGradient id="aurora-bar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6ec8fa" stopOpacity="0" />
            <stop offset="0.22" stopColor="#3cb0f0" stopOpacity="0.55" />
            <stop offset="0.65" stopColor="#0297de" stopOpacity="0.85" />
            <stop offset="1" stopColor="#0261b4" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="aurora-lit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#dff3ff" stopOpacity="0" />
            <stop offset="0.35" stopColor="#bfe6ff" stopOpacity="0.7" />
            <stop offset="1" stopColor="#7cc8f0" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <g filter="url(#aurora-soft)">
        {bars.map((b, i) => (
          <rect
            key={i}
            x={b.x.toFixed(1)}
            y={b.y.toFixed(1)}
            width={(b.lit ? b.w * 0.5 : b.w).toFixed(2)}
            height={b.h.toFixed(1)}
            fill={b.lit ? "url(#aurora-lit)" : "url(#aurora-bar)"}
            opacity={b.o.toFixed(2)}
          />
        ))}
        </g>
      </svg>
      <div className="aurora-ribs" />
      <div className="aurora-grain" />
    </div>
  );
}
