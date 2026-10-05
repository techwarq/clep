// Clep platform API (video-automation) — called straight from the browser with the user's access key.
//   POST /v1/reels {prompt}  ·  POST /v1/motion {url, request, seconds?}
//   GET /v1/jobs[/:id]  ·  POST /v1/jobs/:id/retry  ·  GET /v1/videos/:id (mp4)

const BASE = (process.env.NEXT_PUBLIC_CLEP_API_URL ?? "https://api.clep.abstraklabs.com").replace(/\/v1\/?$/, "").replace(/\/$/, "");
const KEY = "clep_access_key";

export type Engine = "reels" | "motion";
export type JobStatus = "queued" | "running" | "done" | "failed";

export interface Job {
  id: string;
  engine: Engine;
  input: { prompt?: string; url?: string; request?: string; seconds?: number } | null;
  status: JobStatus;
  attempts: number;
  error: string | null;
  cost_usd: number;
  video: { id: string; url: string } | null;
  has_draft: boolean;
  created_at: string;
  updated_at: string;
}

export function getAccessKey(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setAccessKey(k: string) {
  try {
    window.localStorage.setItem(KEY, k);
  } catch {}
}

export function clearAccessKey() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {}
}

async function request(path: string, init: RequestInit = {}, key = getAccessKey()): Promise<Response> {
  if (!key) throw new Error("Add your access key first");
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { ...init, headers: { ...(init.headers as Record<string, string>), Authorization: `Bearer ${key}` } });
  } catch {
    throw new Error("Can't reach Clep — check your connection and try again");
  }
  if (res.status === 401) throw new Error("That access key isn't valid");
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res;
}

const json = async <T,>(path: string, init: RequestInit = {}) => (await (await request(path, init)).json()) as T;
const post = <T,>(path: string, body?: unknown) =>
  json<T>(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });

/** Checks a key against the API without storing it. */
export async function verifyKey(key: string): Promise<void> {
  await request("/v1/jobs", {}, key);
}

export const createReel = (prompt: string) => post<{ id: string; status: JobStatus }>("/v1/reels", { prompt });
export const createMotion = (body: { url: string; request: string; seconds?: number }) =>
  post<{ id: string; status: JobStatus }>("/v1/motion", body);
export const listJobs = () => json<Job[]>("/v1/jobs");
export const getJob = (id: string) => json<Job>(`/v1/jobs/${encodeURIComponent(id)}`);
export const retryJob = (id: string) => post<{ id: string; status: JobStatus; from_draft: boolean }>(`/v1/jobs/${encodeURIComponent(id)}/retry`);

/** The mp4 needs the key in a header, so it's fetched once and played from a local object URL. */
const blobs = new Map<string, Promise<string>>();
export function videoObjectUrl(videoId: string): Promise<string> {
  let p = blobs.get(videoId);
  if (!p) {
    p = request(`/v1/videos/${encodeURIComponent(videoId)}`)
      .then((r) => r.blob())
      .then((b) => URL.createObjectURL(b));
    p.catch(() => blobs.delete(videoId));
    blobs.set(videoId, p);
  }
  return p;
}

export const jobTitle = (j: Job) => j.input?.prompt || j.input?.request || (j.engine === "reels" ? "Reel" : "Motion video");
export const isBusy = (j: Job) => j.status === "queued" || j.status === "running";
