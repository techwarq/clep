export type Backdrop = { name: string; value: string; group: "Light" | "Bold" | "Dark" | "Solid" };

const PRESET_STOPS: Record<string, string[]> = {
  saas: ["#c4b5fd", "#fbcfe8", "#bfdbfe"],
  minimal: ["#e8e8ee", "#f8f8fa", "#e0e4ec"],
  cinematic: ["#341c60", "#100c26", "#602478"],
  apple: ["#c7d2fe", "#f3f4f6", "#bae6fd"],
  blush: ["#fae2ee", "#fdf5fa", "#f0d6e6"],
};

export const BACKDROPS: Backdrop[] = [
  { name: "Lavender", value: "saas", group: "Light" },
  { name: "Mist", value: "minimal", group: "Light" },
  { name: "Glacier", value: "apple", group: "Light" },
  { name: "Blush", value: "blush", group: "Light" },
  { name: "Peach", value: "#ffe1cc,#fff4ec,#ffd1dc", group: "Light" },
  { name: "Mint", value: "#d1fae5,#f0fdf4,#bae6fd", group: "Light" },
  { name: "Sunset", value: "#b8a1ff,#ec6fa6,#ffd27a", group: "Bold" },
  { name: "Ember", value: "#ff9f4a,#ff6b6b,#ec6fa6", group: "Bold" },
  { name: "Aurora", value: "#22d3ee,#a78bfa,#34d399", group: "Bold" },
  { name: "Ocean", value: "#38bdf8,#6366f1,#0ea5e9", group: "Bold" },
  { name: "Citrus", value: "#fde047,#fb923c,#f472b6", group: "Bold" },
  { name: "Lagoon", value: "#2dd4bf,#3b82f6,#a5f3fc", group: "Bold" },
  { name: "Galaxy", value: "cinematic", group: "Dark" },
  { name: "Dusk", value: "#2a0f1b,#110b0d,#5b2a86", group: "Dark" },
  { name: "Midnight", value: "#0f172a,#020617,#1e3a8a", group: "Dark" },
  { name: "Forest", value: "#052e16,#0a0f0d,#134e4a", group: "Dark" },
  { name: "Graphite", value: "#1f2937,#0b0f14,#374151", group: "Dark" },
  { name: "Wine", value: "#4c0519,#18060c,#831843", group: "Dark" },
  { name: "Paper", value: "solid:#ffffff", group: "Solid" },
  { name: "Cream", value: "solid:#fdf8e1", group: "Solid" },
  { name: "Pink", value: "solid:#ec6fa6", group: "Solid" },
  { name: "Noir", value: "solid:#0b0709", group: "Solid" },
];

export const LOOKS = [
  { value: "minimal", name: "Minimal", note: "Soft gray, quiet shadow" },
  { value: "saas", name: "SaaS", note: "Pastel gradient, crisp window" },
  { value: "cinematic", name: "Cinematic", note: "Deep tones, bold titles" },
  { value: "apple", name: "Apple", note: "Cool, airy, keynote feel" },
];

export const FORMATS = [
  { value: "16:9", name: "Landscape", note: "Site, YouTube" },
  { value: "9:16", name: "Vertical", note: "Reels, Shorts, TikTok" },
  { value: "1:1", name: "Square", note: "Feeds" },
  { value: "4:5", name: "Portrait", note: "Instagram, LinkedIn" },
];

export const MOVEMENTS = [
  { value: "calm", name: "Calm" },
  { value: "standard", name: "Standard" },
  { value: "dynamic", name: "Dynamic" },
];

export const DEVICES = [
  { value: "", name: "Window" },
  { value: "browser", name: "Browser" },
  { value: "macbook", name: "MacBook" },
];

export const CURSOR_SHAPES = [
  { value: "", name: "Arrow", glyph: "↖︎" },
  { value: "hand", name: "Hand", glyph: "☝︎" },
  { value: "halo", name: "Halo", glyph: "◎︎" },
  { value: "hand halo", name: "Hand + halo", glyph: "☝︎" },
];

export const CURSOR_COLORS = [
  { value: "", name: "Black", swatch: "#141418" },
  { value: "white", name: "White", swatch: "#ffffff" },
  { value: "brand", name: "Violet", swatch: "#6a4cff" },
  { value: "#ec6fa6", name: "Pink", swatch: "#ec6fa6" },
  { value: "#ff9f4a", name: "Orange", swatch: "#ff9f4a" },
];

export const CURSOR_SIZES = [
  { value: "small", name: "S" },
  { value: "", name: "M" },
  { value: "large", name: "L" },
  { value: "xl", name: "XL" },
];

export const SOUNDS = [
  { value: false, name: "Off" },
  { value: "warm", name: "Warm" },
  { value: "cold", name: "Cool" },
];

export function backdropCss(value: string): string {
  if (PRESET_STOPS[value]) return `linear-gradient(135deg, ${PRESET_STOPS[value].join(", ")})`;
  if (value.startsWith("solid:")) return value.slice(6);
  const stops = value.split(",").map((stop) => stop.trim()).filter(Boolean);
  return stops.length > 1 ? `linear-gradient(135deg, ${stops.join(", ")})` : stops[0] ?? "#c4b5fd";
}

export const isDarkBackdrop = (value: string) => BACKDROPS.find((b) => b.value === value)?.group === "Dark" || value === "solid:#0b0709";

export const cursorWords = (shape: string, color: string, size: string) => [shape, color, size].filter(Boolean).join(" ");

export function cursorParts(words = "") {
  const tokens = words.split(/\s+/).filter(Boolean);
  const shape = tokens.includes("hand") && tokens.includes("halo") ? "hand halo" : tokens.includes("hand") ? "hand" : tokens.includes("halo") ? "halo" : "";
  const color = tokens.find((t) => CURSOR_COLORS.some((c) => c.value === t && t)) ?? "";
  const size = tokens.find((t) => CURSOR_SIZES.some((s) => s.value === t && t)) ?? "";
  return { shape, color, size };
}
