import { EFFECTS, LAUNCH_VIDEO, type LandingVideo } from "./landing";

export type ShowcaseKind = "demo" | "effect";

export interface ShowcaseVideo extends LandingVideo {
  kind: ShowcaseKind;
}

const demo = (slug: string, title: string, line: string): ShowcaseVideo => ({ slug, title, line, kind: "demo" });

export const SHOWCASE: ShowcaseVideo[] = [
  { ...LAUNCH_VIDEO, kind: "demo" },
  demo("demo-clep", "You shipped the feature", "A merged PR turned into a launch film for the new feature."),
  demo("demo-ailens", "AI Lens", "From the terminal into the app, every step filmed in one take."),
  demo("demo-edith", "Edith", "A desktop app demo with the camera following each action."),
  demo("hero-trakstartups", "TrakStartups", "A calm scroll walkthrough of a live data site."),
  ...EFFECTS.map((effect) => ({ ...effect, kind: "effect" as const })),
];

export const SHOWCASE_TABS: { key: ShowcaseKind | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "demo", label: "Product demos" },
  { key: "effect", label: "Effects" },
];
