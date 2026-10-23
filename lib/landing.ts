export const SKILL_URL = "https://api.clep.abstraklabs.com/skill.md";

export interface LandingVideo {
  slug: string;
  title: string;
  line: string;
}

// Landing clips are served from R2 (bucket clep-site-media) through Cloudflare's CDN.
// NEXT_PUBLIC_MEDIA_URL overrides it; set it to /showcase to use the copies in public/.
const MEDIA_BASE = (process.env.NEXT_PUBLIC_MEDIA_URL || "https://media.clep.abstraklabs.com").replace(/\/$/, "");

export const videoSrc = (slug: string) => `${MEDIA_BASE}/${slug}.mp4`;
export const posterSrc = (slug: string) => `${MEDIA_BASE}/${slug}.jpg`;

export const HERO_VIDEO: LandingVideo = {
  slug: "hero-trakstartups",
  title: "Trakstartups",
  line: "30 seconds, recorded from the live product.",
};

export const LAUNCH_VIDEO: LandingVideo = {
  slug: "launch-push",
  title: "Push a feature. Get the launch video.",
  line: "Clep spots the new feature on your push, films it on the preview deploy and hands back a clip ready to post.",
};

export interface Effect extends LandingVideo {
  detected: string;
}

export const EFFECTS: Effect[] = [
  {
    slug: "effect-zoom",
    title: "Zoom-ins",
    detected: "Each click",
    line: "Pushes in on the button you press, then follows the results as they stream in.",
  },
  {
    slug: "effect-typing",
    title: "Typing",
    detected: "A text field",
    line: "Finds the input, types at 1.7x and keeps the camera on the words.",
  },
  {
    slug: "effect-click-upload",
    title: "Clicks & uploads",
    detected: "A file drop",
    line: "Drawn cursor, press ripple, and the converting wait cut down to 2x.",
  },
  {
    slug: "effect-multistep",
    title: "Multi-step flows",
    detected: "Chained states",
    line: "Install, trace, run, report: every step its own shot, all in one take.",
  },
  {
    slug: "effect-walkthrough",
    title: "Scroll walkthroughs",
    detected: "Page sections",
    line: "No markup needed. It finds the sections, scrolls calmly and holds on each.",
  },
  {
    slug: "effect-vertical",
    title: "Any format",
    detected: "9:16 asked",
    line: "The same recording, recomposed for the feed.",
  },
  {
    slug: "effect-cursor",
    title: "Smooth cursor",
    detected: "A shaky mouse",
    line: "Your jittery path, redrawn as one calm glide between clicks.",
  },
  {
    slug: "effect-deadair",
    title: "Dead-air cuts",
    detected: "A long wait",
    line: "Fifteen seconds of spinner plays in six. The action stays at 1x.",
  },
  {
    slug: "effect-looks",
    title: "Looks",
    detected: "--style asked",
    line: "Minimal, SaaS, cinematic or Apple: backdrop, shadow and frame in one flag.",
  },
  {
    slug: "effect-captions",
    title: "Captions",
    detected: "A narrator script",
    line: "Word-by-word captions, timed to the voiceover and the clicks.",
  },
  {
    slug: "effect-keys",
    title: "Keystrokes",
    detected: "A shortcut",
    line: "Shows ⌘K and every key that matters, so viewers can follow along.",
  },
  {
    slug: "effect-blur",
    title: "Privacy blur",
    detected: "An API key",
    line: "Emails, keys and card numbers blurred the moment they hit the screen.",
  },
];

export const PACING = [
  ["Action", "1x"],
  ["Typing", "1.7x"],
  ["Loading", "2x"],
  ["Dead air", "5x"],
];
