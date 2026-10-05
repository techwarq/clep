"use client";

import { useEffect, useState } from "react";
import type { VideoKind } from "../lib/gallery";
import { createMotion, createReel, isBusy, type Job } from "../lib/platform";
import Gallery from "./Gallery";
import JobCard from "./JobCard";

const LS_KIND = "clep_create_kind";
const KIND_LABEL: Record<VideoKind, string> = { reel: "Reel", motion: "Motion video" };
const SECONDS = [15, 20, 30, 45, 60];

const SUGGESTIONS: Record<VideoKind, string[]> = {
  motion: [
    "A 20s launch film for our new feature",
    "Teaser for next week's launch — high energy",
    "Explain how our AI agent works, calm and clean",
  ],
  reel: [
    "meme: introverts vs extroverts at a party",
    "An explainer on why satellites can text your phone",
    "Qwen vs DeepSeek, explained in under a minute",
  ],
};

/** Create: pick Reel or Motion video, describe it, and it's queued on the render VM. */
export default function Studio({ jobs, onJobs, onToast }: { jobs: Job[]; onJobs: () => void; onToast: (m: string) => void }) {
  const [kind, setKind] = useState<VideoKind>("motion");
  const [input, setInput] = useState("");
  const [url, setUrl] = useState("");
  const [seconds, setSeconds] = useState(20);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(LS_KIND) === "reel") setKind("reel");
    } catch {}
  }, []);

  const pickKind = (k: VideoKind) => {
    setKind(k);
    try {
      window.localStorage.setItem(LS_KIND, k);
    } catch {}
  };

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    let site = url.trim();
    if (kind === "motion") {
      if (!site) return onToast("Add your site URL — the film is made from it");
      if (!/^https?:\/\//i.test(site)) site = `https://${site}`;
    }
    setBusy(true);
    try {
      if (kind === "reel") await createReel(text);
      else await createMotion({ url: site, request: text, seconds });
      setInput("");
      onToast(kind === "reel" ? "Reel queued — it shows up below" : "Motion video queued — films take about 12 minutes");
      onJobs();
    } catch (e) {
      onToast(e instanceof Error ? e.message : "Couldn't start the video");
    } finally {
      setBusy(false);
    }
  };

  const mine = jobs.filter((j) => (kind === "reel" ? j.engine === "reels" : j.engine === "motion"));

  return (
    <div className="cx cx-home">
      <div className="cx-home-top" />
      <div className="cx-home-center">
        <h1>{kind === "reel" ? "What's your reel about?" : "What are you launching?"}</h1>
        <p>
          {kind === "reel"
            ? "Give Clep a topic — it writes, cuts and renders a vertical reel."
            : "Drop your site and describe the film — Clep directs it in your brand."}
        </p>

        <div className="cx-composer big">
          <textarea
            className="cx-input"
            rows={3}
            placeholder={kind === "reel" ? "What's the reel about? Topic, angle, tone…" : "Describe the film you want…"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <div className="cx-row">
            <label className="cx-kind" title="What to make">
              <span className={`cx-ratio-ico r-${kind === "reel" ? "9x16" : "16x9"}`} aria-hidden />
              <select value={kind} onChange={(e) => pickKind(e.target.value as VideoKind)} aria-label="Video type">
                {(Object.keys(KIND_LABEL) as VideoKind[]).map((k) => (
                  <option key={k} value={k}>
                    {KIND_LABEL[k]}
                  </option>
                ))}
              </select>
            </label>
            {kind === "motion" ? (
              <>
                <label className="cx-url" title="Your site — the film uses its colors, fonts and screens">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden>
                    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
                  </svg>
                  <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="yoursite.com" aria-label="Your site URL" />
                </label>
                <label className="cx-ratio" title="Length">
                  <select value={seconds} onChange={(e) => setSeconds(Number(e.target.value))} aria-label="Length in seconds">
                    {SECONDS.map((s) => (
                      <option key={s} value={s}>
                        {s}s
                      </option>
                    ))}
                  </select>
                </label>
              </>
            ) : (
              <span className="cx-row-spacer" />
            )}
            <button className="cx-send" disabled={busy || !input.trim()} onClick={() => void send()} aria-label="Send">
              {busy ? <i className="mk-spin" /> : "↑"}
            </button>
          </div>
        </div>

        <div className="cx-suggest">
          {SUGGESTIONS[kind].map((sg) => (
            <button key={sg} type="button" onClick={() => setInput(sg)}>
              {sg}
            </button>
          ))}
        </div>

        {mine.length > 0 && (
          <div className="cx-home-tpls">
            <span className="cx-label">
              Your {kind === "reel" ? "reels" : "motion videos"}
              {mine.some(isBusy) ? " · updating live" : ""}
            </span>
            <div className="jc-grid">
              {mine.slice(0, 8).map((j) => (
                <JobCard key={j.id} job={j} onChange={onJobs} onToast={onToast} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="cx-gallery">
        <span className="cx-label">{kind === "reel" ? "Reels made with Clep" : "Motion videos made with Clep"}</span>
        <Gallery kind={kind} />
      </div>
    </div>
  );
}

