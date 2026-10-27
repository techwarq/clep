"use client";

import { useEffect, useState } from "react";
import BrandPreview from "../../../components/dash/BrandPreview";
import "./brand.css";
import { PageHead } from "../../../components/dash/ui";
import { useDash } from "../../../lib/dashboard";
import {
  BACKDROPS,
  CURSOR_COLORS,
  CURSOR_SHAPES,
  CURSOR_SIZES,
  DEVICES,
  FORMATS,
  LOOKS,
  MOVEMENTS,
  SOUNDS,
  backdropCss,
  cursorParts,
  cursorWords,
} from "../../../lib/brand-options";
import { getBrandKit, saveBrandKit, type BrandKit } from "../../../lib/platform";

const STARTER: BrandKit = { style: "saas", bg: "saas", aspect: "16:9", movement: "standard", captions: true, look: { sound: "warm" } };
const GROUPS = ["Wallpapers", "Light", "Bold", "Dark", "Solid"] as const;

export default function Brand() {
  const { toast, fail } = useDash();
  const [kit, setKit] = useState<BrandKit>(STARTER);
  const [saved, setSaved] = useState<string>(JSON.stringify(STARTER));
  const [custom, setCustom] = useState(["#ec6fa6", "#ffd27a"]);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getBrandKit()
      .then((stored) => {
        if (!stored) return;
        setKit(stored);
        setSaved(JSON.stringify(stored));
      }, fail)
      .finally(() => setReady(true));
  }, [fail]);

  const set = (patch: BrandKit) => setKit((current) => ({ ...current, ...patch }));
  const setLook = (patch: NonNullable<BrandKit["look"]>) => setKit((current) => ({ ...current, look: { ...current.look, ...patch } }));
  const setOutro = (patch: NonNullable<BrandKit["outro"]>) => setKit((current) => ({ ...current, outro: { ...current.outro, ...patch } }));
  const cursor = cursorParts(kit.look?.cursor);
  const setCursor = (patch: Partial<typeof cursor>) => {
    const next = { ...cursor, ...patch };
    setLook({ cursor: cursorWords(next.shape, next.color, next.size) });
  };
  const backdrop = kit.bg ?? "saas";
  const dirty = JSON.stringify(kit) !== saved;

  const save = async () => {
    setBusy(true);
    try {
      const stored = await saveBrandKit(kit);
      setSaved(JSON.stringify(stored));
      toast("Brand kit saved. New clips use it");
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cd-page">
      <PageHead title="Brand kit" sub="Look, backdrop, frame, cursor and sound for every new clip. Your agent never needs to know; anything it asks for still wins.">
        <button type="button" className="cd-btn" onClick={() => setKit(STARTER)}>Reset</button>
        <button type="button" className="cd-btn cd-btn-pink" onClick={() => void save()} disabled={!ready || !dirty || busy}>
          {!ready ? "Loading…" : busy ? "Saving…" : dirty ? "Save kit" : "Saved"}
        </button>
      </PageHead>

      <div className="cd-brand-layout">
        <div className="cd-stack">
          <section className="cd-card">
            <h3 className="cd-side-h">Look</h3>
            <div className="cd-choice-grid">
              {LOOKS.map((l) => (
                <button key={l.value} type="button" className={`cd-choice ${kit.style === l.value ? "on" : ""}`} onClick={() => set({ style: l.value })}>
                  <b>{l.name}</b>
                  <small>{l.note}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="cd-card">
            <h3 className="cd-side-h">Backdrop</h3>
            {GROUPS.map((group) => (
              <div key={group} className="cd-swatch-group">
                <p className="cd-label">{group}</p>
                <div className="cd-swatches">
                  {BACKDROPS.filter((b) => b.group === group).map((b) => (
                    <button key={b.value} type="button" title={b.name} style={{ background: backdropCss(b.value) }} className={backdrop === b.value ? "on" : ""} onClick={() => set({ bg: b.value })} aria-label={`${b.name} backdrop`} />
                  ))}
                </div>
              </div>
            ))}
            <div className="cd-swatch-group">
              <p className="cd-label">Your colours</p>
              <div className="cd-custom-bg">
                {custom.map((color, i) => (
                  <input key={i} type="color" value={color} aria-label={`Gradient colour ${i + 1}`} onChange={(e) => setCustom(custom.map((c, j) => (j === i ? e.target.value : c)))} />
                ))}
                <button type="button" className="cd-btn cd-btn-sm" onClick={() => set({ bg: custom.join(",") })}>Use gradient</button>
                <button type="button" className="cd-btn cd-btn-sm" onClick={() => set({ bg: `solid:${custom[0]}` })}>Use solid</button>
              </div>
            </div>
          </section>

          <section className="cd-card">
            <h3 className="cd-side-h">Format &amp; motion</h3>
            <div className="cd-choice-grid">
              {FORMATS.map((f) => (
                <button key={f.value} type="button" className={`cd-choice ${kit.aspect === f.value ? "on" : ""}`} onClick={() => set({ aspect: f.value })}>
                  <b>{f.value} {f.name}</b>
                  <small>{f.note}</small>
                </button>
              ))}
            </div>
            <p className="cd-label">Camera movement</p>
            <Pills options={MOVEMENTS} value={kit.movement ?? "standard"} onPick={(movement) => set({ movement })} />
          </section>

          <section className="cd-card">
            <h3 className="cd-side-h">Frame</h3>
            <Pills options={DEVICES} value={kit.look?.device ?? ""} onPick={(device) => setLook({ device })} />
            <div className="cd-toggle-row">
              <Toggle label="Glow" on={!!kit.look?.glow} flip={() => setLook({ glow: !kit.look?.glow })} />
              <Toggle label="Reflection" on={!!kit.look?.reflection} flip={() => setLook({ reflection: !kit.look?.reflection })} />
            </div>
          </section>

          <section className="cd-card">
            <h3 className="cd-side-h">Cursor</h3>
            <Pills options={CURSOR_SHAPES.map((s) => ({ value: s.value, name: `${s.glyph} ${s.name}` }))} value={cursor.shape} onPick={(shape) => setCursor({ shape })} />
            <div className="cd-swatches cd-swatches-sm">
              {CURSOR_COLORS.map((c) => (
                <button key={c.name} type="button" title={c.name} style={{ background: c.swatch }} className={cursor.color === c.value ? "on" : ""} onClick={() => setCursor({ color: c.value })} aria-label={`${c.name} cursor`} />
              ))}
            </div>
            <Pills options={CURSOR_SIZES} value={cursor.size} onPick={(size) => setCursor({ size })} />
          </section>

          <section className="cd-card">
            <h3 className="cd-side-h">Sound &amp; captions</h3>
            <Pills options={SOUNDS.map((s) => ({ value: String(s.value), name: s.name }))} value={String(kit.look?.sound ?? "warm")} onPick={(sound) => setLook({ sound: sound === "false" ? false : sound })} />
            <div className="cd-toggle-row">
              <Toggle label="Captions" on={kit.captions !== false} flip={() => set({ captions: kit.captions === false })} />
            </div>
          </section>

          <section className="cd-card">
            <h3 className="cd-side-h">End card</h3>
            <div className="cd-fields">
              <input className="cd-input" value={kit.outro?.brand ?? ""} maxLength={80} onChange={(e) => setOutro({ brand: e.target.value })} placeholder="Brand name, e.g. Acme" />
              <input className="cd-input" value={kit.outro?.cta ?? ""} maxLength={80} onChange={(e) => setOutro({ cta: e.target.value })} placeholder="Call to action, e.g. Try it free at acme.com" />
            </div>
          </section>
        </div>

        <section className="cd-card cd-brand-preview">
          <h3 className="cd-side-h">Preview</h3>
          <BrandPreview kit={kit} backdrop={backdrop} />
          <p className="cd-muted">
            {LOOKS.find((l) => l.value === kit.style)?.name} · {BACKDROPS.find((b) => b.value === backdrop)?.name ?? "Custom"} backdrop · {kit.aspect} · {kit.movement} camera
          </p>
        </section>
      </div>
    </div>
  );
}

function Pills<T extends string>({ options, value, onPick }: { options: { value: T; name: string }[]; value: string; onPick: (value: T) => void }) {
  return (
    <div className="cd-pills cd-pills-btn">
      {options.map((o) => (
        <button key={o.value || o.name} type="button" className={value === o.value ? "on" : ""} onClick={() => onPick(o.value)}>{o.name}</button>
      ))}
    </div>
  );
}

function Toggle({ label, on, flip }: { label: string; on: boolean; flip: () => void }) {
  return (
    <label className="cd-toggle">
      <button type="button" role="switch" aria-checked={on} aria-label={label} className="cd-switch" onClick={flip} />
      {label}
    </label>
  );
}
