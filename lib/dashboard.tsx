"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccount, isBusy, listClips, listProjects, sessionToken, signOut, SignedOut, type Account, type Clip, type Project } from "./platform";

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

  const refresh = useCallback(async () => {
    try {
      const [nextAccount, nextClips, nextProjects] = await Promise.all([getAccount(), listClips(), listProjects()]);
      setAccount(nextAccount);
      setClips(nextClips);
      setProjects(nextProjects);
      setErr(null);
    } catch (e) {
      if (e instanceof SignedOut) return leave();
      setErr(e instanceof Error ? e.message : "Couldn't load your videos");
    } finally {
      setLoaded(true);
    }
  }, [leave]);

  useEffect(() => {
    if (!sessionToken()) return leave();
    void refresh();
  }, [leave, refresh]);

  const busy = clips.some(isBusy);
  useEffect(() => {
    const t = window.setInterval(() => void refresh(), busy ? 5000 : 15000);
    return () => window.clearInterval(t);
  }, [busy, refresh]);

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
