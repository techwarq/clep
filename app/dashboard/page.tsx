"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar, { type DashView } from "../../components/Sidebar";
import Studio from "../../components/Studio";
import VideosView from "../../components/VideosView";
import { clearAccessKey, getAccessKey, isBusy, listJobs, type Job } from "../../lib/platform";

export default function Dashboard() {
  return (
    <Suspense fallback={null}>
      <DashboardInner />
    </Suspense>
  );
}

function DashboardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<DashView>(searchParams.get("view") === "videos" ? "videos" : "create");
  const [keyHint, setKeyHint] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  const removeKey = useCallback(() => {
    clearAccessKey();
    router.replace("/login");
  }, [router]);

  const refresh = useCallback(async () => {
    try {
      setJobs(await listJobs());
      setErr(null);
    } catch (e) {
      const m = e instanceof Error ? e.message : "Couldn't load your videos";
      if (m === "That access key isn't valid") return removeKey();
      setErr(m);
    } finally {
      setLoaded(true);
    }
  }, [removeKey]);

  useEffect(() => {
    const key = getAccessKey();
    if (!key) {
      router.replace("/login");
      return;
    }
    setKeyHint(`${key.slice(0, 3)}…${key.slice(-4)}`);
    void refresh();
  }, [router, refresh]);

  // Poll while anything is queued or rendering.
  const busy = jobs.some(isBusy);
  useEffect(() => {
    if (!busy) return;
    const t = window.setInterval(() => void refresh(), 5000);
    return () => window.clearInterval(t);
  }, [busy, refresh]);

  return (
    <div className="app-shell">
      <Sidebar view={view} onNavigate={setView} keyHint={keyHint} onLogout={removeKey} />

      <main className={`sb-main ${view === "create" ? "sb-main-full" : ""}`}>
        <div className={view === "create" ? "" : "mk-wrap"}>
          {view === "create" && <Studio jobs={jobs} onJobs={() => void refresh()} onToast={showToast} />}
          {view === "videos" && (
            <VideosView
              jobs={jobs}
              loaded={loaded}
              err={err}
              onJobs={() => void refresh()}
              onToast={showToast}
              onCreate={() => setView("create")}
            />
          )}
        </div>
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
