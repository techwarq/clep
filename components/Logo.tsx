export function ClepMark({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      role="img"
      aria-label="clep mark"
      style={{ flex: "none", display: "block", borderRadius: size * 0.24 }}
    >
      <rect width="512" height="512" rx="116" fill="#0a0a0a" />
      <path
        d="M375.5 155.7 A156 156 0 1 0 375.5 356.3"
        fill="none"
        stroke="#fff"
        strokeWidth="88"
      />
    </svg>
  );
}

export function ClepWordmark({ fontSize = 24, color = "#0a0a0a" }: { fontSize?: number; color?: string }) {
  return (
    <span
      className="wordmark"
      style={{
        fontSize,
        color,
        fontFamily: "var(--font-logo, Poppins, sans-serif)",
        fontWeight: 600,
        letterSpacing: "-0.03em",
        lineHeight: 1,
      }}
    >
      clep
    </span>
  );
}

const WORDMARK_RATIO = 800 / 388;

/** The clep wordmark (public/clep-wordmark.png), tinted via mask so it works on any background. */
export default function ClepLogo({
  fontSize = 25,
  height,
  color = "#0a0a0a",
  mark = true,
  markSize,
  gap,
}: {
  markSize?: number;
  fontSize?: number;
  height?: number;
  color?: string;
  gap?: number;
  /** Show the square C icon before the wordmark. */
  mark?: boolean;
}) {
  const h = height ?? Math.round(fontSize * 1.05);
  const word = (
    <span
      className="clep-wordmark"
      role="img"
      aria-label="clep"
      style={{
        display: "inline-block",
        width: Math.round(h * WORDMARK_RATIO),
        height: h,
        backgroundColor: color,
        WebkitMaskImage: "url(/clep-wordmark.png)",
        maskImage: "url(/clep-wordmark.png)",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "left center",
        maskPosition: "left center",
      }}
    />
  );
  if (!mark) return <span className="clep-logo">{word}</span>;
  return (
    <span className="clep-logo" style={{ display: "inline-flex", alignItems: "center", gap: gap ?? Math.round(h * 0.38) }}>
      <ClepMark size={markSize ?? Math.round(h * 1.2)} />
      {word}
    </span>
  );
}
