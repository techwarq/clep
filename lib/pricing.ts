/** Clep's public plans (Platform Plan, 24 Oct 2026). One source for the landing, /pricing and the dashboard. */

export type Plan = {
  name: string;
  monthly: number;
  yearly: number; // per month, billed yearly
  for: string;
  minutes: string;
  limit: number; // export minutes a month
  highlights: string[];
  featured?: boolean;
};

export const PLANS: Plan[] = [
  {
    name: "Free",
    monthly: 0,
    yearly: 0,
    for: "Trying it out",
    minutes: "1 export minute a month",
    limit: 1,
    highlights: ["Every effect, every format", "1080p60, clips up to 30 s", "1 interactive demo, branded", "\"Made with Clep\" badge"],
  },
  {
    name: "Pro",
    monthly: 19,
    yearly: 15,
    for: "Solo founders who post often",
    minutes: "10 export minutes a month (~20 clips)",
    limit: 10,
    highlights: ["Up to 4K60, clips up to 2 min", "No badge, captions", "5 min of AI voiceover", "Unlimited interactive demos", "1 brand kit, 1 GitHub repo"],
    featured: true,
  },
  {
    name: "Studio",
    monthly: 39,
    yearly: 31,
    for: "Small teams that ship daily",
    minutes: "30 export minutes a month",
    limit: 30,
    highlights: ["4K60, clips up to 5 min", "15 min of AI voiceover", "Unlimited brand kits and repos", "API, webhooks, 3 seats", "Live-HTML demos + analytics", "Priority rendering"],
  },
];

/** A cell is a plain value, true (included) or false (not included). */
export type Cell = string | boolean;

export const COMPARE: { group: string; rows: [string, Cell, Cell, Cell][] }[] = [
  {
    group: "Exports",
    rows: [
      ["Export minutes per month", "1", "10", "30"],
      ["Longest clip", "30 s", "2 min", "5 min"],
      ["Quality", "1080p60", "Up to 4K60", "4K60"],
      ["Formats: 16:9, 9:16, 1:1, custom size", true, true, true],
      ["Watermark", "\"Made with Clep\"", "None", "None"],
      ["Render queue", "Standard", "Standard", "Priority"],
      ["Videos kept for", "7 days", "90 days", "1 year"],
    ],
  },
  {
    group: "Editing",
    rows: [
      ["Zooms, cursor, speed-ups, dead-air cuts, looks", true, true, true],
      ["Privacy blur and keystrokes", true, true, true],
      ["Captions", false, true, true],
      ["AI voiceover", false, "5 min/mo", "15 min/mo"],
      ["Brand kit", false, "1", "Unlimited"],
    ],
  },
  {
    group: "Sharing",
    rows: [
      ["Interactive demos", "1, branded", "Unlimited", "Unlimited"],
      ["Live-HTML demos and step analytics", false, false, true],
      ["GitHub: a clip on every PR", false, "1 repo", "Unlimited repos"],
    ],
  },
  {
    group: "Team",
    rows: [
      ["API and webhooks", false, false, true],
      ["Seats", "1", "1", "3"],
    ],
  },
];

export const ADDONS = [
  { name: "More minutes", price: "$8", detail: "5 extra export minutes, on any paid plan." },
];
