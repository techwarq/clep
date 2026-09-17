export function ClepMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" role="img" aria-label="clep mark" style={{ flex: "none", borderRadius: size * 0.22 }}>
      <rect width="512" height="512" rx="104" fill="#000" />
      <path
        d="M296.9 181.7 A78 78 0 1 0 296.9 306.3"
        fill="none"
        stroke="#fff"
        strokeWidth="38"
      />
    </svg>
  );
}

export function ClepWordmark({ fontSize = 24, color = "#0a0a0a" }: { fontSize?: number; color?: string }) {
  return (
    <span
      className="wordmark"
      style={{ fontSize, color }}
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
    <span className="clep-logo" style={{ gap }}>
      <ClepMark size={markSize} />
      <ClepWordmark fontSize={fontSize} color={color} />
    </span>
  );
}
