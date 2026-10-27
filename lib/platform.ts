export const API_BASE = (process.env.NEXT_PUBLIC_CLEP_API_URL ?? "https://api.clep.abstraklabs.com").replace(/\/v1\/?$/, "").replace(/\/$/, "");

const SESSION_KEY = "clep_session";

export type Plan = "free" | "beta" | "pro" | "studio";
export type ClipStatus = "queued" | "running" | "done" | "failed";
export type User = { id: string; email: string; name: string | null };
export type Usage = { plan: Plan; used_seconds: number; limit_seconds: number; period_start: string };
export type Account = { user: User; usage: Usage; keys: number; connected: boolean };
export type AccessKey = { id: string; prefix: string; label: string | null; created_at: string; last_used_at: string | null };
export type CreatedKey = AccessKey & { key: string };
export type BrandKit = {
  style?: string;
  bg?: string;
  aspect?: string;
  movement?: string;
  captions?: boolean;
  look?: { device?: string; glow?: boolean; reflection?: boolean; cursor?: string; sound?: boolean | string };
  intro?: { title?: string };
  outro?: { title?: string; cta?: string; brand?: string };
};

export interface Clip {
  id: string;
  name: string;
  url: string | null;
  kind: string | null;
  prompt: string | null;
  status: ClipStatus;
  stage: string | null;
  progress: number;
  error: string | null;
  export_seconds: number | null;
  video: { url: string; bytes: number } | null;
  created_at: string;
  updated_at: string;
}

export interface Feature {
  slug: string;
  name: string;
  route: string | null;
  description: string | null;
}

export interface Project {
  id: string;
  name: string;
  repo_url: string | null;
  app_url: string | null;
  framework: string | null;
  synced_at: string;
  features: Feature[];
}

export class SignedOut extends Error {}

export function sessionToken(): string | null {
  try {
    return window.localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function keepSession(token: string | null) {
  try {
    if (token) window.localStorage.setItem(SESSION_KEY, token);
    else window.localStorage.removeItem(SESSION_KEY);
  } catch {}
}

async function request(path: string, init: RequestInit = {}, token = sessionToken()): Promise<Response> {
  const headers: Record<string, string> = { ...(init.headers as Record<string, string>) };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (init.body) headers["Content-Type"] = "application/json";
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  } catch {
    throw new Error("Can't reach Clep. Check your connection and try again");
  }
  if (res.status === 401 && token) {
    keepSession(null);
    throw new SignedOut("Your session ended. Sign in again");
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res;
}

const json = async <T,>(path: string, init: RequestInit = {}) => (await (await request(path, init)).json()) as T;
const send = <T,>(method: string, path: string, body?: unknown) =>
  json<T>(path, { method, body: body === undefined ? undefined : JSON.stringify(body) });

export async function signIn(email: string, code: string): Promise<User> {
  const res = await request("/api/signin", { method: "POST", body: JSON.stringify({ email, code }) }, null);
  const { token, user } = (await res.json()) as { token: string; user: User };
  keepSession(token);
  return user;
}

export async function signOut() {
  await request("/api/signout", { method: "POST" }).catch(() => undefined);
  keepSession(null);
}

export const reserveSeat = async (seat: { name: string; email: string; product_url?: string }) =>
  (await (await request("/api/reserve", { method: "POST", body: JSON.stringify(seat) }, null)).json()) as { status: "reserved" | "already_reserved" };

export const getAccount = () => json<Account>("/api/me");
export const listKeys = async () => (await json<{ keys: AccessKey[] }>("/api/me/keys")).keys;
export const createKey = (label: string) => send<CreatedKey>("POST", "/api/me/keys", { label });
export const revokeKey = (id: string) => send<{ ok: true }>("DELETE", `/api/me/keys/${encodeURIComponent(id)}`);
export const listClips = async () => (await json<{ clips: Clip[] }>("/api/me/clips")).clips;
export const getClip = (id: string) => json<Clip>(`/api/me/clips/${encodeURIComponent(id)}`);
export const startClip = (body: { url: string; name?: string; prompt?: string }) => send<Clip>("POST", "/api/me/clips", body);
export const retryClip = (id: string) => send<{ id: string; status: ClipStatus }>("POST", `/api/me/clips/${encodeURIComponent(id)}/retry`);
export const listProjects = async () => (await json<{ projects: Project[] }>("/api/me/projects")).projects;
export const getBrandKit = async () => (await json<{ kit: BrandKit | null }>("/api/me/brand")).kit;
export const saveBrandKit = async (kit: BrandKit) => (await send<{ kit: BrandKit }>("PUT", "/api/me/brand", { kit })).kit;

const videos = new Map<string, Promise<string>>();
export function clipVideoUrl(clipId: string): Promise<string> {
  let url = videos.get(clipId);
  if (!url) {
    url = request(`/api/me/clips/${encodeURIComponent(clipId)}/video`)
      .then((r) => r.blob())
      .then((b) => URL.createObjectURL(b));
    url.catch(() => videos.delete(clipId));
    videos.set(clipId, url);
  }
  return url;
}

export const KIND_LABEL: Record<string, string> = { tour: "Walkthrough", feature: "Feature", mockup: "Mockup", launch: "Launch", local: "Local recording" };
export const kindLabel = (clip: Clip) => KIND_LABEL[clip.kind ?? ""] ?? "Clip";
export const clipTitle = (clip: Clip) => clip.name !== "clip" ? clip.name : clip.prompt || clip.url || "Clip";
export const isBusy = (clip: Clip) => clip.status === "queued" || clip.status === "running";
