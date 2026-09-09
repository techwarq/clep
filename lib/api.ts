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

export async function downloadExport(jobId: string, format: "xlsx" | "csv"): Promise<Blob> {
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
