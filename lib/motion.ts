// Clep Motion API client — the Worker at NEXT_PUBLIC_CLEP_API_URL (/v1/motion/*).
// Templates, brand kit from a URL, chat → draft, storyboard stills, queued render jobs.
// Auth: the dashboard session token (Bearer), else the stored API key.

import { getApiKey, getClepToken } from "./api";

// .../v1 — same base the rest of the dashboard uses. NEXT_PUBLIC_MOTION_API_URL overrides it for local dev.
export const API_BASE = (process.env.NEXT_PUBLIC_MOTION_API_URL ?? process.env.NEXT_PUBLIC_CLEP_API_URL ?? "http://localhost:8787/v1").replace(/\/$/, "");
const ORIGIN = API_BASE.replace(/\/v1$/, "");
const MOTION = `${API_BASE}/motion`;

/** Worker-relative media path (/v1/motion/files/…, /outputs/…) → absolute URL. */
export const motionFile = (path?: string | null) => {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  if (path.startsWith("/v1/")) return `${ORIGIN}${path}`;
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
};

export type SlotType = "text" | "textList" | "table" | "items" | "image" | "clip";

export interface Slot {
  label: string;
  type: SlotType;
  max?: number;
  maxItems?: number;
  fields?: string[];
  default?: unknown;
}

export interface MotionTemplate {
  id: string;
  name: string;
  tagline: string;
  bestFor: string;
  references: string[];
  defaults: Record<string, string>;
  slots: Record<string, Slot>;
  example?: { video: string | null; poster: string | null; brand: string } | null;
}

export interface MotionControls {
  fontPairings: Record<string, { label: string }>;
  backdrops: Record<string, { label: string; kind: string; colors?: string[] }>;
  pace: Record<string, number>;
  textAnims: string[];
  transitions: Record<string, number>;
  camera: Record<string, number>;
  formats: Record<string, [number, number]>;
}

/** template = a template id, or "custom" (values = {title, mood, style?, seconds, beats[]}). */
export interface Draft {
  template: string;
  values: Record<string, unknown>;
  controls: Record<string, unknown>;
}

export interface Beat {
  kind: string;
  [field: string]: unknown;
}

export interface BrandResult {
  project: string;
  brand: { name: string; url?: string; colors: Record<string, string>; screenshots?: string[] };
  palette?: string[];
  screenshots: string[]; // absolute URLs, same order as brand.screenshots
}

export type JobStatus = "queued" | "dispatched" | "running" | "preparing" | "rendering" | "uploading" | "done" | "error";

export interface MotionJob {
  id: string;
  status: JobStatus;
  progress: number;
  video?: string;
  outputs?: { format: string; out: string; bytes: number }[];
  error?: string | null;
  queuePosition?: number;
}

export interface Usage {
  plan: string;
  videos: number;
  limit: number;
  inflight: number;
}

function authHeaders(): Record<string, string> {
  const token = getClepToken();
  if (token) return { Authorization: `Bearer ${token}` };
  const key = getApiKey();
  return key ? { "X-API-Key": key } : {};
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${MOTION}${path}`, { ...init, headers: { ...authHeaders(), ...((init.headers as Record<string, string>) ?? {}) } });
  } catch {
    throw new Error(`Can't reach the Clep API at ${API_BASE}`);
  }
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(body.error ?? `request failed (${res.status})`);
  return body as T;
}

const post = <T,>(path: string, body: unknown) =>
  call<T>(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const getTemplates = () => call<{ templates: MotionTemplate[]; controls: MotionControls }>("/templates");
export const getUsage = () => call<Usage>("/usage");

/** Starts brand extraction (a queued job) and resolves once the kit is ready — usually 15–30s. */
export async function extractBrand(url: string, onStatus?: (s: string) => void): Promise<BrandResult> {
  const { project } = await post<{ project: string; job: string }>("/projects", { url });
  const started = Date.now();
  for (;;) {
    const p = await call<{
      status: string;
      error?: string | null;
      brand: BrandResult["brand"] | null;
      palette?: string[];
      screenshots: { path: string; url: string }[];
    }>(`/projects/${project}`);
    if (p.status === "ready" && p.brand) {
      return { project, brand: p.brand, palette: p.palette, screenshots: p.screenshots.map((s) => motionFile(s.url)!) };
    }
    if (p.status === "error") throw new Error(p.error || "Couldn't read that site");
    if (Date.now() - started > 4 * 60_000) throw new Error("Reading your site is taking too long — try again");
    onStatus?.(Date.now() - started > 20_000 ? "Still reading your site — grabbing screenshots…" : "Reading your site — colors, fonts, logo, screenshots…");
    await wait(1500);
  }
}

export const chatTurn = (body: { message: string; project?: string | null; draft?: Draft | null; history?: { role: string; content: string }[] }) =>
  post<Draft & { reply: string; fixes?: string[] }>("/chat", body);

export const previewStills = (project: string, draft: Draft) =>
  post<{ storyboard: string; stills: { type: string; url: string }[] }>("/preview", { project, ...draft });

export async function getJob(id: string): Promise<MotionJob> {
  const j = await call<{
    id: string;
    status: JobStatus;
    progress: number;
    out: string | null;
    error: string | null;
    result: { outputs?: MotionJob["outputs"] } | null;
    queue_position?: number;
  }>(`/jobs/${id}`);
  return {
    id: j.id,
    status: j.status,
    progress: j.progress ?? 0,
    video: j.out ?? undefined,
    outputs: j.result?.outputs,
    error: j.error,
    queuePosition: j.queue_position,
  };
}

export async function startRender(project: string, draft: Draft, formats?: string[]): Promise<MotionJob> {
  const r = await post<{ job: string }>("/render", { project, ...draft, ...(formats?.length ? { formats } : {}) });
  return { id: r.job, status: "queued", progress: 0 };
}

export async function uploadAsset(project: string, file: File): Promise<{ path: string; url: string }> {
  return call(`/projects/${encodeURIComponent(project)}/uploads?name=${encodeURIComponent(file.name)}`, {
    method: "POST",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
}
