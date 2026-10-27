"use client";

import { useEffect, useState } from "react";
import { clipVideoUrl } from "./platform";

// The API has no poster or duration yet, so the browser makes them: load the MP4 once, grab a frame
// a quarter of the way in, and keep a small JPEG + the length in localStorage keyed by clip id.

export interface Thumb {
  src: string;
  seconds: number;
}

const PREFIX = "clep_thumb:";
const WIDTH = 320;
const memo = new Map<string, Promise<Thumb | null>>();

// At most two videos decoding at once.
let running = 0;
const waiting: (() => void)[] = [];
const slot = () => new Promise<void>((go) => (running < 2 ? (running++, go()) : waiting.push(() => (running++, go()))));
const release = () => {
  running--;
  waiting.shift()?.();
};

function read(id: string): Thumb | null {
  try {
    const raw = window.localStorage.getItem(PREFIX + id);
    return raw ? (JSON.parse(raw) as Thumb) : null;
  } catch {
    return null;
  }
}

function write(id: string, t: Thumb) {
  try {
    window.localStorage.setItem(PREFIX + id, JSON.stringify(t));
  } catch {} // storage full: it just gets made again next visit
}

async function make(id: string): Promise<Thumb | null> {
  await slot();
  try {
    const url = await clipVideoUrl(id);
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = url;
    await new Promise<void>((ok, fail) => {
      video.onloadedmetadata = () => ok();
      video.onerror = () => fail(new Error("unreadable video"));
    });
    const seconds = Number.isFinite(video.duration) ? video.duration : 0;
    video.currentTime = Math.min(seconds * 0.25, Math.max(seconds - 0.1, 0));
    await new Promise<void>((ok) => (video.onseeked = () => ok()));
    const h = Math.round((WIDTH * video.videoHeight) / (video.videoWidth || 16)) || 180;
    const canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = h;
    canvas.getContext("2d")?.drawImage(video, 0, 0, WIDTH, h);
    const t = { src: canvas.toDataURL("image/jpeg", 0.72), seconds };
    write(id, t);
    return t;
  } catch {
    return null;
  } finally {
    release();
  }
}

export function getThumb(id: string): Promise<Thumb | null> {
  const cached = read(id);
  if (cached) return Promise.resolve(cached);
  let p = memo.get(id);
  if (!p) {
    p = make(id);
    memo.set(id, p);
  }
  return p;
}

/** The thumbnail for a finished video, once `visible` turns true. undefined = not yet, null = couldn't make one. */
export function useThumb(id: string | undefined, visible: boolean) {
  const [thumb, setThumb] = useState<Thumb | null | undefined>(undefined);
  useEffect(() => {
    if (!id || thumb !== undefined) return;
    const cached = read(id); // after mount, so server and client render the same first frame
    if (cached) return setThumb(cached);
    if (!visible) return;
    let live = true;
    void getThumb(id).then((t) => live && setThumb(t));
    return () => {
      live = false;
    };
  }, [id, visible, thumb]);
  return thumb;
}

export const clock = (s: number) => {
  const t = Math.round(s);
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
};
