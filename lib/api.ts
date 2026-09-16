const API_URL = process.env.NEXT_PUBLIC_API_URL;

const TOKEN_KEY = "clep_token";
const USER_KEY = "clep_user";

export interface StoredUser {
  email: string;
  name: string;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function getUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as StoredUser) : null;
}

export function setUser(user: StoredUser): void {
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

async function parseError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string };
    return body.error ?? `request failed (${res.status})`;
  } catch {
    return `request failed (${res.status})`;
  }
}

export async function signup(
  email: string,
  password: string,
  name: string,
): Promise<{ token: string; userId: string; name: string }> {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function login(email: string, password: string): Promise<{ token: string; name: string }> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

// ---- Jobs ----

export type JobStatus = "uploaded" | "parsing" | "extracting" | "validating" | "reviewing" | "complete" | "failed";

export interface JobFile {
  key: string;
  name: string;
  contentType: string;
  documentType?: string;
}

export interface JobSummary {
  total: number;
  verified: number;
  needsReview: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface JobDetail {
  id: string;
  status: JobStatus;
  files: JobFile[];
  totalPages: number | null;
  processedPages: number;
  parsedPages?: number;
  filesParsed?: number;
  totalFiles?: number;
  items: unknown[];
  summary: JobSummary;
  error?: string;
  createdAt: string;
  updatedAt: string;
  // Only present once mode has flipped to "custom" via POST /chat.
  chat?: ChatMessage[];
  schemaStatus?: "drafting" | "confirmed";
}

export type JobListItem = Pick<JobDetail, "id" | "status" | "summary" | "createdAt" | "updatedAt"> & {
  mode: string;
  files: string[]; // file names only — see routes/jobs.ts's GET /jobs summary shape
};

async function authedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { ...init.headers, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res;
}

export async function createJob(
  files: Array<{ name: string; contentType: string }>,
): Promise<{ jobId: string; uploads: Array<{ fileIndex: number; uploadUrl: string; key: string }> }> {
  const res = await authedFetch("/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ files }),
  });
  return res.json();
}

// Uploads directly to R2 via the presigned URL — not authedFetch, this
// goes straight to Cloudflare's R2 endpoint, not the Worker (see
// src/lib/presign.ts on the backend for why: the Worker never sees the
// file's bytes).
export async function uploadToPresignedUrl(uploadUrl: string, file: File): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!res.ok) throw new Error(`upload failed (${res.status})`);
}

export async function sendChatMessage(jobId: string, message: string): Promise<JobDetail> {
  const res = await authedFetch(`/jobs/${jobId}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  return res.json();
}

export async function startExtract(jobId: string): Promise<JobDetail> {
  const res = await authedFetch(`/jobs/${jobId}/extract`, { method: "POST" });
  return res.json();
}

export async function getJobStatus(jobId: string): Promise<JobDetail> {
  const res = await authedFetch(`/jobs/${jobId}`);
  return res.json();
}

export async function listJobs(): Promise<JobListItem[]> {
  const res = await authedFetch("/jobs");
  const body = (await res.json()) as { jobs: JobListItem[] };
  return body.jobs;
}

export async function downloadExport(jobId: string, format: "xlsx" | "csv" | "json"): Promise<Blob> {
  const res = await authedFetch(`/jobs/${jobId}/export?format=${format}`);
  return res.blob();
}

// ---- Billing ----

export interface PlanInfo {
  email: string;
  name: string;
  planName: string;
  pagesRemaining: number;
  pageQuota: number;
  maxPagesPerDoc: number;
}

export async function getMe(): Promise<PlanInfo> {
  const res = await authedFetch("/billing/me");
  return res.json();
}

export async function startCheckout(planName: string): Promise<{ checkoutUrl: string }> {
  const res = await authedFetch("/billing/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ planName }),
  });
  return res.json();
}

// ---- CLEP video platform (pipeline_clep backend, hosted separately) ----
// Frontend lives here in /Users/sonalinayak/clep.
// Backend lives in /Users/sonalinayak/Desktop/allore-pipelines/pipeline_clep
// (platform/server.py today, hosted FastAPI/Workers tomorrow).
// No public npm SDK yet — instrumentation is done by the Claude Code plugin.

const CLEP_API_URL = process.env.NEXT_PUBLIC_CLEP_API_URL ?? "";
const CLEP_KEY_KEY = "clep_api_key";

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

// ---- Clep auth (separate from the DocToSheet auth above — different
// backend, different account system, so deliberately different storage
// keys. A DocToSheet session must never be mistaken for a Clep session.) ----

const CLEP_TOKEN_KEY = "clep_video_token";
const CLEP_USER_KEY = "clep_video_user";

export interface ClepUser {
  email: string;
  name: string;
  api_key: string;
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

function setClepSession(token: string, user: ClepUser): void {
  window.localStorage.setItem(CLEP_TOKEN_KEY, token);
  window.localStorage.setItem(CLEP_USER_KEY, JSON.stringify(user));
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
  const token = getClepToken();
  if (!token) throw new Error("not logged in");
  const res = await clepAuthFetch("/auth/me", { headers: { Authorization: `Bearer ${token}` } });
  return res.json();
}

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
