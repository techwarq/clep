"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccount, listClips, listProjects, sessionToken, signOut, SignedOut, streamDashboard, type Account, type Clip, type DashboardSnapshot, type Project } from "./platform";

interface DashState {
  clips: Clip[];
  projects: Project[];
  account: Account | null;
  loaded: boolean;
  err: string | null;
  refresh: () => Promise<void>;
  toast: (m: string) => void;
  logout: () => void;
  fail: (e: unknown) => void;
}

const FIRST_RETRY_MS = 1000;
const LONGEST_RETRY_MS = 30000;

const Ctx = createContext<DashState | null>(null);

export const useDash = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useDash outside DashProvider");
  return v;
};

export function DashProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [clips, setClips] = useState<Clip[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [account, setAccount] = useState<Account | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const toast = useCallback((m: string) => {
    setMessage(m);
    window.setTimeout(() => setMessage(null), 2600);
  }, []);

  const leave = useCallback(() => router.replace("/signin"), [router]);

  const logout = useCallback(() => {
    void signOut().then(leave);
  }, [leave]);

  const fail = useCallback(
    (e: unknown) => {
      if (e instanceof SignedOut) return leave();
      toast(e instanceof Error ? e.message : "Something went wrong");
    },
    [leave, toast],
  );

  const show = useCallback((snapshot: DashboardSnapshot) => {
    setAccount(snapshot.account);
    setClips(snapshot.clips);
    setProjects(snapshot.projects);
    setErr(null);
    setLoaded(true);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const [account, clips, projects] = await Promise.all([getAccount(), listClips(), listProjects()]);
      show({ account, clips, projects });
    } catch (e) {
      if (e instanceof SignedOut) return leave();
      setErr(e instanceof Error ? e.message : "Couldn't load your videos");
      setLoaded(true);
    }
  }, [leave, show]);

  useEffect(() => {
    if (!sessionToken()) return leave();
    const live = new AbortController();
    const pause = (ms: number) => new Promise((resume) => window.setTimeout(resume, ms));
    void (async () => {
      let retryIn = FIRST_RETRY_MS;
      while (!live.signal.aborted) {
        try {
          await streamDashboard((snapshot) => {
            retryIn = FIRST_RETRY_MS;
            show(snapshot);
          }, live.signal);
        } catch (e) {
          if (live.signal.aborted) return;
          if (e instanceof SignedOut) return leave();
          await refresh();
          retryIn = Math.min(retryIn * 2, LONGEST_RETRY_MS);
        }
        await pause(retryIn);
      }
    })();
    return () => live.abort();
  }, [leave, refresh, show]);

  useEffect(() => {
    const outcome = new URLSearchParams(window.location.search).get("billing");
    if (!outcome) return;
    toast(outcome === "done" ? "Payment received. Your plan switches over in a few seconds" : "Checkout cancelled. Nothing was charged");
    router.replace(window.location.pathname);
  }, [router, toast]);

  return (
    <Ctx.Provider value={{ clips, projects, account, loaded, err, refresh, toast, logout, fail }}>
      {children}
      {message && <div className="cd-toast" role="status">{message}</div>}
    </Ctx.Provider>
  );
}

/** "2 hours ago", "3 days ago". */
export function ago(iso: string) {
  const s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  const steps: [number, string][] = [[60, "second"], [60, "minute"], [24, "hour"], [30, "day"], [12, "month"]];
  let n = s;
  for (const [size, unit] of steps) {
    if (n < size) return `${n} ${unit}${n === 1 ? "" : "s"} ago`;
    n = Math.round(n / size);
  }
  return `${n} year${n === 1 ? "" : "s"} ago`;
}

export const isLocal = (url: string | null | undefined) => !!url && /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])/.test(url);
