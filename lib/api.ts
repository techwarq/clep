async function parseError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string };
    return body.error ?? `request failed (${res.status})`;
  } catch {
    return `request failed (${res.status})`;
  }
}

// ---- Clep auth ----

const CLEP_API_URL = process.env.NEXT_PUBLIC_CLEP_API_URL ?? "";
const CLEP_KEY_KEY = "clep_api_key";
const CLEP_TOKEN_KEY = "clep_video_token";
const CLEP_USER_KEY = "clep_video_user";

export function getApiKey(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CLEP_KEY_KEY);
}

export function setApiKey(key: string): void {
  window.localStorage.setItem(CLEP_KEY_KEY, key);
}

export function clearApiKey(): void {
  window.localStorage.removeItem(CLEP_KEY_KEY);
}

export interface ClepUser {
  email: string;
  name: string;
  api_key: string;
  plan_name?: string;
}

export function getClepToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CLEP_TOKEN_KEY);
}

export function getClepUser(): ClepUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(CLEP_USER_KEY);
  return raw ? (JSON.parse(raw) as ClepUser) : null;
}

function setClepUser(user: ClepUser): void {
  window.localStorage.setItem(CLEP_USER_KEY, JSON.stringify(user));
}

function setClepSession(token: string, user: ClepUser): void {
  window.localStorage.setItem(CLEP_TOKEN_KEY, token);
  setClepUser(user);
  setApiKey(user.api_key);
}

export function clearClepSession(): void {
  window.localStorage.removeItem(CLEP_TOKEN_KEY);
  window.localStorage.removeItem(CLEP_USER_KEY);
  clearApiKey();
}

async function clepAuthFetch(path: string, init: RequestInit = {}): Promise<Response> {
  if (!CLEP_API_URL) throw new Error("Set NEXT_PUBLIC_CLEP_API_URL to your hosted backend");
  const res = await fetch(`${CLEP_API_URL}${path}`, init);
  if (!res.ok) throw new Error(await parseError(res));
  return res;
}

// Bearer-token-authed calls — dashboard/account endpoints (/auth/*, /billing/*),
// as opposed to clepFetch below which is X-API-Key-authed (/api/* — what the
// plugin/CLI uses).
async function clepBearerFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getClepToken();
  if (!token) throw new Error("not logged in");
  return clepAuthFetch(path, {
    ...init,
    headers: { ...(init.headers ?? {}), Authorization: `Bearer ${token}` },
  });
}

export async function clepSignup(email: string, password: string, name: string): Promise<ClepUser> {
  const res = await clepAuthFetch("/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  const data = (await res.json()) as { token: string; api_key: string; name: string };
  const user: ClepUser = { email, name: data.name, api_key: data.api_key };
  setClepSession(data.token, user);
  return user;
}

export async function clepLogin(email: string, password: string): Promise<ClepUser> {
  const res = await clepAuthFetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json()) as { token: string; api_key: string; name: string };
  const user: ClepUser = { email, name: data.name, api_key: data.api_key };
  setClepSession(data.token, user);
  return user;
}

export async function clepMe(): Promise<ClepUser> {
  const res = await clepBearerFetch("/auth/me");
  const user = (await res.json()) as ClepUser;
  setClepUser(user);
  setApiKey(user.api_key);
  return user;
}

// Invalidates the old key immediately — anything using it (the plugin, a
// deployed app's SDK) breaks until reconfigured with the new one.
export async function regenerateApiKey(): Promise<string> {
  const res = await clepBearerFetch("/auth/regenerate-key", { method: "POST" });
  const { api_key } = (await res.json()) as { api_key: string };
  setApiKey(api_key);
  const user = getClepUser();
  if (user) setClepUser({ ...user, api_key });
  return api_key;
}

// ---- Billing (Dodo Payments) ----

export interface BillingInfo {
  plan_name: string;
  billing_configured: boolean;
}

export async function getBilling(): Promise<BillingInfo> {
  const res = await clepBearerFetch("/billing/me");
  return res.json();
}

export async function startClepCheckout(returnUrl: string): Promise<{ checkout_url: string }> {
  const res = await clepBearerFetch("/billing/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ return_url: returnUrl }),
  });
  return res.json();
}

// ---- CLEP video platform (X-API-Key-authed — what the plugin/CLI uses) ----

export interface ClepFeature {
  name: string;
  title?: string;
  url?: string;
  source?: string;
  updated?: string;
  element?: unknown;
  component?: string[];
  interactions?: unknown[];
  states?: string[];
  has_input?: boolean;
  has_button?: boolean;
  button_label?: string;
}

export interface ClepJob {
  id: string;
  status: "queued" | "recording" | "editing" | "done" | "error";
  name: string;
  url?: string;
  style?: string;
  quality?: string;
  out?: string | null;
  error?: string | null;
  created?: number;
}

export interface CreateClipInput {
  url: string;
  name: string;
  query?: string;
  style?: string;
  fps?: number;
  quality?: string;
  steps?: unknown[];
}

async function clepFetch(path: string, init: RequestInit = {}): Promise<Response> {
  if (!CLEP_API_URL) throw new Error("Set NEXT_PUBLIC_CLEP_API_URL to your hosted backend");
  const key = getApiKey();
  const res = await fetch(`${CLEP_API_URL}${path}`, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      ...(key ? { "X-API-Key": key } : {}),
    },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res;
}

export async function scanFeatures(url: string): Promise<{ features: ClepFeature[] }> {
  const res = await clepFetch(`/api/features?url=${encodeURIComponent(url)}`);
  return res.json();
}

export async function getRegistry(): Promise<{ features: ClepFeature[] }> {
  const res = await clepFetch("/api/registry");
  return res.json();
}

export async function createClip(input: CreateClipInput): Promise<{ job_id: string; status: string }> {
  const res = await clepFetch("/api/clips", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return res.json();
}

export async function listClipJobs(): Promise<{ jobs: ClepJob[] }> {
  const res = await clepFetch("/api/jobs");
  return res.json();
}

export async function getClipJob(id: string): Promise<ClepJob> {
  const res = await clepFetch(`/api/jobs/${id}`);
  return res.json();
}
