type IconProps = { size?: number };

function Base({
  size = 14,
  filled = false,
  children,
}: IconProps & { filled?: boolean; children: React.ReactNode }) {
  return (
    <svg
      className="ic"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function Sparkle({ size = 13 }: IconProps) {
  return (
    <Base size={size} filled>
      <path d="M12 2.5c.65 4.6 2.8 6.75 7.4 7.4-4.6.65-6.75 2.8-7.4 7.4-.65-4.6-2.8-6.75-7.4-7.4 4.6-.65 6.75-2.8 7.4-7.4z" />
    </Base>
  );
}

export function Gear({ size = 14 }: IconProps) {
  return (
    <Base size={size}>
      <circle cx="12" cy="12" r="3.1" />
      <path d="M12 2.8v2.9M12 18.3v2.9M2.8 12h2.9M18.3 12h2.9M5.5 5.5l2 2M16.5 16.5l2 2M18.5 5.5l-2 2M7.5 16.5l-2 2" />
    </Base>
  );
}

export function Plus({ size = 14 }: IconProps) {
  return (
    <Base size={size}>
      <path d="M12 5v14M5 12h14" />
    </Base>
  );
}

export function ChevronDown({ size = 13 }: IconProps) {
  return (
    <Base size={size}>
      <path d="M6 9l6 6 6-6" />
    </Base>
  );
}

export function External({ size = 12 }: IconProps) {
  return (
    <Base size={size}>
      <path d="M7 17L17 7M9 7h8v8" />
    </Base>
  );
}

export function Eye({ size = 18 }: IconProps) {
  return (
    <Base size={size}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </Base>
  );
}

export function EyeOff({ size = 18 }: IconProps) {
  return (
    <Base size={size}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <path d="M1 1l22 22" />
    </Base>
  );
}

export function CursorPointer({ size = 22 }: IconProps) {
  return (
    <svg
      className="ic"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="#111"
      stroke="#fff"
      strokeWidth={1.6}
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5.5 3.5 19.5 12l-7.2 1.9-2.7 6.6z" />
    </svg>
  );
}

export function Clapper({ size = 15 }: IconProps) {
  return (
    <Base size={size}>
      <path d="M3 9.5h18V19a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19V9.5z" />
      <path d="M3.6 9.5 5 4.8l14.9 2.9-1 3.1M8.5 5.3 7.7 8.6M12.5 5.9l-.8 3.3M16.5 6.5l-.8 3.3" />
    </Base>
  );
}

export function Check({ size = 13 }: IconProps) {
  return (
    <Base size={size}>
      <path d="M4 12.5l5 5L20 6.5" />
    </Base>
  );
}

export function X({ size = 13 }: IconProps) {
  return (
    <Base size={size}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Base>
  );
}
