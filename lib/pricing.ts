/** Clep's public plans. One source for the landing teaser and the /pricing page. */

export type Plan = {
  name: string;
  monthly: number;
  yearly: number; // per month, billed yearly
  for: string;
  minutes: string;
  highlights: string[];
  featured?: boolean;
};

export const PLANS: Plan[] = [
  {
    name: "Free",
    monthly: 0,
    yearly: 0,
    for: "Trying it out",
    minutes: "3 export minutes a month",
    highlights: ["Every effect, every format", "1080p60, clips up to 30 s", "\"Made with Clep\" badge"],
  },
  {
    name: "Pro",
    monthly: 19,
    yearly: 15,
    for: "Solo founders who post often",
    minutes: "30 export minutes a month",
    highlights: ["Up to 4K60, clips up to 2 min", "No watermark, captions", "5 min of AI voiceover", "A clip on every PR (1 repo)"],
    featured: true,
  },
  {
    name: "Studio",
    monthly: 39,
    yearly: 31,
    for: "Small teams that ship daily",
    minutes: "60 export minutes a month",
    highlights: ["Clips up to 5 min, priority renders", "15 min of AI voiceover", "API, webhooks, unlimited repos", "3 seats (+$10 per extra seat)"],
  },
];

/** A cell is a plain value, true (included) or false (not included). */
export type Cell = string | boolean;

export const COMPARE: { group: string; rows: [string, Cell, Cell, Cell][] }[] = [
  {
    group: "Exports",
    rows: [
      ["Export minutes per month", "3", "30", "60"],
      ["Longest clip", "30 s", "2 min", "5 min"],
      ["Quality", "1080p60", "Up to 4K60", "Up to 4K60"],
      ["Formats: 16:9, 9:16, 1:1, custom size", true, true, true],
      ["One recording rendered in several formats", false, true, true],
      ["Watermark", "\"Made with Clep\"", "None", "None"],
      ["Render queue", "Standard", "Standard", "Priority"],
      ["Videos kept for", "7 days", "90 days", "1 year"],
    ],
  },
  {
    group: "Editing",
    rows: [
      ["Zooms, cursor, speed-ups, dead-air cuts, styles", true, true, true],
      ["Automatic privacy blur and keystrokes", true, true, true],
      ["Captions", false, true, true],
      ["AI voiceover", false, "5 min/mo", "15 min/mo"],
      ["Brand kit: backgrounds, colours, logo outro", false, "1", "Unlimited"],
    ],
  },
  {
    group: "Recording",
    rows: [
      ["On your own machine or CI", true, true, true],
      ["Public URLs on our servers", false, true, true],
      ["GitHub: a clip on every PR", false, "1 repo", "Unlimited repos"],
    ],
  },
  {
    group: "Team",
    rows: [
      ["API and webhooks", false, false, true],
      ["Seats", "1", "1", "3 (+$10 each)"],
    ],
  },
];

export const ADDONS = [
  { name: "More minutes", price: "$8", detail: "20 extra export minutes." },
  { name: "More voiceover", price: "$5", detail: "10 extra minutes of AI voiceover." },
  { name: "Overage", price: "~$0.40", detail: "Per export minute past your plan, only if you turn it on. Otherwise renders pause at the limit." },
];
