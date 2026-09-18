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

export default function ClepLogo({
  markSize = 30,
  fontSize = 25,
  color = "#0a0a0a",
  gap = 9,
}: {
  markSize?: number;
  fontSize?: number;
  color?: string;
  gap?: number;
}) {
  return (
    <span className="clep-logo" style={{ gap, display: "inline-flex", alignItems: "center" }}>
      <ClepMark size={markSize} />
      <ClepWordmark fontSize={fontSize} color={color} />
    </span>
  );
}
