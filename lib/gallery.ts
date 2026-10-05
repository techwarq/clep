// Showcase videos for the Create gallery — served by studio-site (content.techwarq.space/media).
// Reels are the vertical cuts (reels engine), motion is the wide launch films (motion engine).

export type VideoKind = "reel" | "motion";

export interface ShowcaseVideo {
  slug: string;
  kind: VideoKind;
  title: string;
  line: string;
  tags: string;
  duration: string;
}

export const SHOWCASE_BASE = (process.env.NEXT_PUBLIC_SHOWCASE_URL ?? "https://content.techwarq.space/media").replace(/\/$/, "");

export const showcaseSrc = (v: ShowcaseVideo) => `${SHOWCASE_BASE}/${v.slug}.mp4`;
export const showcasePoster = (v: ShowcaseVideo) => `${SHOWCASE_BASE}/${v.slug}.jpg`;

export const SHOWCASE: ShowcaseVideo[] = [
  { slug: "reel-48-hours", kind: "reel", title: "48 Hours #01", line: "One thing, 48 hours.", tags: "Documentary edit · series opener", duration: "0:41" },
  { slug: "reel-exosat", kind: "reel", title: "Exosat", line: "Your phone dies. The fix is overhead.", tags: "Explainer reel · stat cards", duration: "0:50" },
  { slug: "reel-build-until-they-notice", kind: "reel", title: "Build until they notice", line: "A founder, heads down.", tags: "Founder story · voiceover + real footage", duration: "1:02" },
  { slug: "explainer-qwen-deepseek", kind: "reel", title: "Qwen vs DeepSeek", line: "Two models, one question.", tags: "Tech explainer · motion UI", duration: "1:00" },
  { slug: "reel-antimattr-yc", kind: "reel", title: "A week at YC", line: "Startup life, up close.", tags: "Lifestyle reel · movie scene + motion graphics", duration: "0:34" },
  { slug: "reel-my-story", kind: "reel", title: "My story, 16 → 22", line: "Six years in a minute.", tags: "Personal intro · aesthetic edit", duration: "0:54" },
  { slug: "reel-48-hours-rules", kind: "reel", title: "48 Hours: The Rules", line: "No moving the goalpost.", tags: "Documentary edit · creator's own voice", duration: "1:04" },
  { slug: "launch-clep-motion-ui", kind: "motion", title: "Clep", line: "From idea to product, in one take.", tags: "Product launch · motion-UI film · voiced", duration: "0:48" },
  { slug: "launch-truemile", kind: "motion", title: "TrueMile", line: "The product, told as a journey.", tags: "Launch film · recreated product UI", duration: "0:32" },
  { slug: "launch-notch", kind: "motion", title: "Notch", line: "Your Mac's notch, finally useful.", tags: "Product launch · one-object motion film", duration: "0:20" },
  { slug: "launch-maritime", kind: "motion", title: "Maritime", line: "An agent's story at sea.", tags: "Launch film · halftone motion", duration: "0:33" },
  { slug: "launch-truecaller", kind: "motion", title: "Truecaller Business Chat", line: "From unread to answered.", tags: "Feature launch · motion-UI film", duration: "0:44" },
  { slug: "launch-talo-anime", kind: "motion", title: "Talo", line: "A launch drawn like a comic.", tags: "Anime launch · kinetic comic style", duration: "0:30" },
  { slug: "launch-teaser", kind: "motion", title: "Prismo 2", line: "Ten seconds, on the beat.", tags: "Teaser · kinetic type", duration: "0:10" },
  { slug: "film-48-hours-rules-16x9", kind: "motion", title: "48 Hours: The Rules", line: "The same story, cut wide.", tags: "16:9 edit · documentary motion graphics", duration: "1:04" },
];
