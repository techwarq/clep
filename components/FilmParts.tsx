"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getVoices, motionFile, type Beat, type Voice } from "../lib/motion";

/* ------------------------------------------------------------------ voice previews */

/** One shared <audio>: starting a preview stops the one before it. */
export function useVoicePlayer() {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);

  useEffect(() => () => audio.current?.pause(), []);

  const toggle = useCallback((v: Voice) => {
    const src = motionFile(v.preview);
    if (!src) return;
    if (!audio.current) {
      audio.current = new Audio();
      audio.current.onended = () => setPlaying(null);
      audio.current.onerror = () => setPlaying(null);
    }
    const a = audio.current;
    if (playing === v.id) {
      a.pause();
      setPlaying(null);
      return;
    }
    a.pause();
    a.src = src;
    a.currentTime = 0;
    a.play().then(() => setPlaying(v.id)).catch(() => setPlaying(null));
  }, [playing]);

  return { playing, toggle };
}

type Player = ReturnType<typeof useVoicePlayer>;

const meta = (v: Voice) => [v.accent, v.gender].filter(Boolean).join(" · ");

function PlayBtn({ v, player }: { v: Voice; player: Player }) {
  if (!v.preview) return null;
  const on = player.playing === v.id;
  return (
    <button
      type="button"
      className={`fv-play ${on ? "on" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        player.toggle(v);
      }}
      aria-label={on ? `Stop ${v.label} preview` : `Play ${v.label} preview`}
    >
      {on ? "■" : "▶"}
    </button>
  );
}

function VoiceRow({ v, selected, onPick, player }: { v: Voice; selected: boolean; onPick: (id: string) => void; player: Player }) {
  return (
    <div
      className={`fv-row ${selected ? "selected" : ""}`}
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={() => onPick(v.id)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onPick(v.id))}
    >
      <span className="fv-radio" aria-hidden />
      <b>{v.label}</b>
      <span className="fv-desc">{v.description}</span>
      <span className="fv-meta">{meta(v)}</span>
      <PlayBtn v={v} player={player} />
    </div>
  );
}

/** Narrator card shown under a film reply. */
export function VoiceCard({
  voices,
  selected,
  onPick,
  onBrowse,
  player,
}: {
  voices: Voice[];
  selected: string | undefined;
  onPick: (id: string) => void;
  onBrowse: () => void;
  player: Player;
}) {
  return (
    <div className="fv-card" role="radiogroup" aria-label="Narrator">
      <div className="fv-head">
        <span aria-hidden>🎙</span> Narrator
      </div>
      {voices.map((v) => (
        <VoiceRow key={v.id} v={v} selected={v.id === selected} onPick={onPick} player={player} />
      ))}
      <button type="button" className="fv-browse" onClick={onBrowse}>
        Browse all voices
      </button>
    </div>
  );
}

export function VoiceChip({ voice, onChange }: { voice: string | undefined; onChange: () => void }) {
  return (
    <button type="button" className="fv-chip" onClick={onChange}>
      <span aria-hidden>🎙</span> {voice ?? "Narrator"} · <u>change</u>
    </button>
  );
}

/** Full catalogue from GET /voices, filterable by gender and accent. */
export function VoiceBrowser({
  selected,
  onPick,
  onClose,
  player,
}: {
  selected: string | undefined;
  onPick: (id: string) => void;
  onClose: () => void;
  player: Player;
}) {
  const [all, setAll] = useState<Voice[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [accent, setAccent] = useState<string | null>(null);

  useEffect(() => {
    getVoices()
      .then((r) => setAll(r.voices))
      .catch((e) => setErr(e instanceof Error ? e.message : "Couldn't load voices"));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const uniq = (k: "gender" | "accent") => Array.from(new Set((all ?? []).map((v) => v[k]).filter(Boolean))) as string[];
  const shown = (all ?? []).filter((v) => (!gender || v.gender === gender) && (!accent || v.accent === accent));

  const chips = (label: string, opts: string[], cur: string | null, set: (x: string | null) => void) =>
    opts.length > 1 && (
      <div className="fv-filter">
        <span>{label}</span>
        <button type="button" className={!cur ? "on" : ""} onClick={() => set(null)}>
          All
        </button>
        {opts.map((o) => (
          <button type="button" key={o} className={cur === o ? "on" : ""} onClick={() => set(cur === o ? null : o)}>
            {o}
          </button>
        ))}
      </div>
    );

  return (
    <div className="fv-modal" onClick={onClose} role="dialog" aria-modal="true" aria-label="Choose a narrator">
      <div className="fv-modal-in" onClick={(e) => e.stopPropagation()}>
        <div className="fv-modal-head">
          <b>Choose a narrator</b>
          <span>Every preview reads the same line, so they&apos;re easy to compare.</span>
          <button type="button" className="fv-x" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        {chips("Gender", uniq("gender"), gender, setGender)}
        {chips("Accent", uniq("accent"), accent, setAccent)}
        <div className="fv-list" role="radiogroup">
          {err && <p className="mk-form-error">{err}</p>}
          {!all && !err && <p className="mk-hint">Loading voices…</p>}
          {shown.map((v) => (
            <VoiceRow key={v.id} v={v} selected={v.id === selected} onPick={onPick} player={player} />
          ))}
          {all && !shown.length && <p className="mk-hint">No voices match those filters.</p>}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ film script */

/** *word* → accent word, `code` → mono pill — matching what the video renders. */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("*") && p.endsWith("*") && p.length > 2 ? (
          <em key={i} className="fs-accent">
            {p.slice(1, -1)}
          </em>
        ) : p.startsWith("`") && p.endsWith("`") && p.length > 2 ? (
          <code key={i} className="fs-code">
            {p.slice(1, -1)}
          </code>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

/** What a beat puts on screen, flattened to one line. */
function onScreen(b: Beat): string | null {
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v : null);
  const list = (v: unknown) => (Array.isArray(v) && v.every((x) => typeof x === "string") && v.length ? (v as string[]).join(" ") : null);
  return (
    str(b.text) ??
    list(b.words) ??
    list(b.phrases) ??
    (str(b.prompt) ? `\`${b.prompt}\`` : null) ??
    str(b.title) ??
    str(b.headline) ??
    null
  );
}

/** ≈ total voiceover chars / 14.5 + ~1.5s per beat. */
export function estimateSeconds(beats: Beat[]) {
  const chars = beats.reduce((n, b) => n + (typeof b.vo === "string" ? b.vo.length : 0), 0);
  return Math.round(chars / 14.5 + beats.length * 1.5);
}

export function FilmScript({
  values,
  voice,
  stills,
  onChangeBeats,
  onVoice,
}: {
  values: Record<string, unknown>;
  voice: string | undefined;
  stills: { type: string; url: string }[] | null;
  onChangeBeats: (b: Beat[]) => void;
  onVoice: () => void;
}) {
  const beats = useMemo(() => (Array.isArray(values.beats) ? (values.beats as Beat[]) : []), [values.beats]);
  const [editing, setEditing] = useState<number | null>(null);
  const secs = estimateSeconds(beats);
  const set = (i: number, k: string, v: string) => onChangeBeats(beats.map((b, j) => (j === i ? { ...b, [k]: v } : b)));

  return (
    <div className="fs">
      <div className="fs-head">
        <div>
          <span className="cx-label">Film script</span>
          <h2>{typeof values.title === "string" && values.title ? values.title : "Untitled film"}</h2>
        </div>
        <div className="fs-meta">
          {typeof values.mood === "string" && <span className="fs-pill">{values.mood}</span>}
          <VoiceChip voice={voice} onChange={onVoice} />
          <span className="fs-pill mono">≈ {secs}s</span>
          <span className="fs-pill mono">{beats.length} beats</span>
        </div>
      </div>

      <ol className="fs-beats">
        {beats.map((b, i) => {
          const scr = onScreen(b);
          const still = stills?.[i];
          const isEditing = editing === i;
          return (
            <li key={i} className={`fs-beat ${b.dark ? "dark" : ""}`}>
              <span className="fs-n">{i + 1}</span>
              <div className="fs-body">
                <div className="fs-top">
                  <span className="fs-kind">
                    {b.kind}
                    {b.dark ? <i title="Dark scene"> ◐</i> : null}
                  </span>
                  <button type="button" className="mk-mini-link" onClick={() => setEditing(isEditing ? null : i)}>
                    {isEditing ? "Done" : "Edit"}
                  </button>
                </div>
                {isEditing ? (
                  <>
                    <label className="fs-edit">
                      <span>🗣 Voiceover</span>
                      <textarea className="mk-textarea" rows={2} value={typeof b.vo === "string" ? b.vo : ""} onChange={(e) => set(i, "vo", e.target.value)} />
                    </label>
                    {typeof b.text === "string" && (
                      <label className="fs-edit">
                        <span>▭ On screen · *word* = accent</span>
                        <input className="mk-input" value={b.text} onChange={(e) => set(i, "text", e.target.value)} />
                      </label>
                    )}
                  </>
                ) : (
                  <>
                    {typeof b.vo === "string" && b.vo && (
                      <p className="fs-vo">
                        <span aria-hidden>🗣</span> “{b.vo}”
                      </p>
                    )}
                    {scr && (
                      <p className="fs-screen">
                        <span aria-hidden>▭</span> <Rich text={scr} />
                      </p>
                    )}
                  </>
                )}
              </div>
              {still && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="fs-still" src={still.url} alt={`Beat ${i + 1}: ${still.type}`} />
              )}
            </li>
          );
        })}
      </ol>
      <p className="mk-hint">Edit a line here, or just ask in the chat — “make the grind beat faster”, “change the CTA to Try it free”.</p>
    </div>
  );
}
