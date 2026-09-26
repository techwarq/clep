"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  chatTurn,
  extractBrand,
  getJob,
  getTemplates,
  getUsage,
  motionFile,
  previewStills,
  startRender,
  uploadAsset,
  type Beat,
  type Draft,
  type MotionControls,
  type MotionJob,
  type MotionTemplate,
  type Slot,
  type Usage,
} from "../lib/motion";

type Msg = { role: "user" | "assistant"; content: string };
type Brand = { project: string; name: string; url: string; screenshots: string[]; shotPaths: string[] };

const LS = "clep_motion_state_v2";

// A custom video has no template: the director wrote a beat sheet and the engine directs it.
const CUSTOM_TPL: MotionTemplate = {
  id: "custom",
  name: "Custom",
  tagline: "Your own structure, directed by Clep.",
  bestFor: "anything the templates don't cover",
  references: [],
  defaults: {},
  slots: {},
  example: null,
};

const BEAT_LABEL: Record<string, string> = {
  hook: "Hook", words: "Word flash", statement: "Statement", problem: "Problem", product: "Product shot",
  click: "Click", list: "List", features: "Features", steps: "Steps", compare: "Before / after", stat: "Stat",
  quote: "Quote", chat: "Chat", search: "Search", table: "Table", terminal: "Terminal", code: "Code",
  cta: "Call to action", logo: "Logo",
};

const JOB_LABEL: Record<string, string> = {
  queued: "Queued…", dispatched: "Starting render…", running: "Starting render…", preparing: "Preparing your assets…",
  rendering: "Rendering your video…", uploading: "Finishing up…",
};

const humanize = (k: string) => k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

/** A beat field → the slot editor that fits its shape, so beats reuse the template field UI. */
function slotFor(key: string, v: unknown): Slot {
  if (key === "screenshot") return { label: "Screenshot", type: "image" };
  if (Array.isArray(v)) {
    if (v.length && Array.isArray(v[0])) return { label: humanize(key), type: "table" };
    if (v.length && typeof v[0] === "object") {
      const fields = Array.from(new Set(v.flatMap((x) => Object.keys((x as object) ?? {}))));
      return { label: humanize(key), type: "items", fields };
    }
    return { label: humanize(key), type: "textList" };
  }
  return { label: humanize(key), type: "text" };
}

function BeatsEditor({
  beats,
  onChange,
  brand,
  onUpload,
}: {
  beats: Beat[];
  onChange: (b: Beat[]) => void;
  brand: Brand | null;
  onUpload: (f: File) => Promise<string | null>;
}) {
  const set = (i: number, k: string, v: unknown) => onChange(beats.map((b, j) => (j === i ? { ...b, [k]: v } : b)));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= beats.length) return;
    const a = [...beats];
    [a[i], a[j]] = [a[j], a[i]];
    onChange(a);
  };
  return (
    <div className="ms-beats">
      {beats.map((b, i) => (
        <div className="ms-beat" key={i}>
          <div className="ms-beat-head">
            <b>
              {String(i + 1).padStart(2, "0")} · {BEAT_LABEL[b.kind] ?? b.kind}
            </b>
            <span>
              <button type="button" className="mk-mini-link" onClick={() => move(i, -1)} aria-label="Move up" disabled={i === 0}>↑</button>
              <button type="button" className="mk-mini-link" onClick={() => move(i, 1)} aria-label="Move down" disabled={i === beats.length - 1}>↓</button>
              <button type="button" className="mk-mini-link" onClick={() => onChange(beats.filter((_, j) => j !== i))} aria-label="Remove beat">✕</button>
            </span>
          </div>
          {Object.entries(b)
            .filter(([k, v]) => k !== "kind" && v !== null && v !== "" && !(Array.isArray(v) && !v.length && k !== "items"))
            .map(([k, v]) => (
              <SlotField key={k} id={`beat-${i}-${k}`} slot={slotFor(k, v)} value={v} onChange={(nv) => set(i, k, nv)} brand={brand} onUpload={onUpload} />
            ))}
        </div>
      ))}
      <p className="mk-hint">Reorder or remove beats here, or ask in the chat — “add a before/after beat”, “end on the logo”.</p>
    </div>
  );
}
const SUGGESTIONS = [
  "A 20s launch video for our new feature",
  "Teaser for next week's launch — high energy",
  "Explain how our AI agent works, calm and clean",
  "Vertical cut for TikTok about our app",
];

function load<T>(k: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/* ------------------------------------------------------------------ slot editors */

function SlotField({
  id,
  slot,
  value,
  onChange,
  brand,
  onUpload,
}: {
  id: string;
  slot: Slot;
  value: unknown;
  onChange: (v: unknown) => void;
  brand: Brand | null;
  onUpload: (f: File) => Promise<string | null>;
}) {
  const v = value ?? slot.default;
  const count = (n: number, max?: number) =>
    max ? <span className={`ms-count ${n > max ? "over" : ""}`}>{n}/{max}</span> : null;

  if (slot.type === "text") {
    const s = String(v ?? "");
    const long = (slot.max ?? 0) > 50 || s.includes("\n");
    return (
      <div className="mk-field">
        <label className="mk-flabel" htmlFor={id}>
          {slot.label} {count(s.length, slot.max)}
        </label>
        {long ? (
          <textarea id={id} className="mk-textarea" rows={2} value={s} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <input id={id} className="mk-input" value={s} onChange={(e) => onChange(e.target.value)} />
        )}
      </div>
    );
  }
  if (slot.type === "textList") {
    const arr = Array.isArray(v) ? (v as string[]) : [];
    return (
      <div className="mk-field">
        <label className="mk-flabel" htmlFor={id}>
          {slot.label} <span className="ms-hint">one per line</span> {count(arr.length, slot.maxItems)}
        </label>
        <textarea
          id={id}
          className="mk-textarea"
          rows={Math.min(6, Math.max(2, arr.length))}
          value={arr.join("\n")}
          onChange={(e) => onChange(e.target.value.split("\n"))}
          onBlur={(e) => onChange(e.target.value.split("\n").map((x) => x.trim()).filter(Boolean))}
        />
      </div>
    );
  }
  if (slot.type === "table") {
    const rows = Array.isArray(v) ? (v as string[][]) : [];
    return (
      <div className="mk-field">
        <label className="mk-flabel" htmlFor={id}>
          {slot.label} <span className="ms-hint">one row per line · cells split by |</span> {count(rows.length, slot.maxItems)}
        </label>
        <textarea
          id={id}
          className="mk-textarea ms-mono"
          rows={Math.min(8, Math.max(3, rows.length))}
          value={rows.map((r) => r.join(" | ")).join("\n")}
          onChange={(e) => onChange(e.target.value.split("\n").map((l) => l.split("|").map((c) => c.trim())))}
          onBlur={(e) =>
            onChange(
              e.target.value
                .split("\n")
                .filter((l) => l.trim())
                .map((l) => l.split("|").map((c) => c.trim())),
            )
          }
        />
      </div>
    );
  }
  if (slot.type === "items") {
    const items = Array.isArray(v) ? (v as Record<string, string>[]) : [];
    const fields = slot.fields ?? Object.keys(items[0] ?? {});
    const set = (i: number, f: string, val: string) =>
      onChange(items.map((it, j) => (j === i ? { ...it, [f]: val } : it)));
    return (
      <div className="mk-field">
        <span className="mk-flabel">
          {slot.label} {count(items.length, slot.maxItems)}
        </span>
        <div className="ms-items">
          {items.map((it, i) => (
            <div className="ms-item" key={i} style={{ gridTemplateColumns: `repeat(${fields.length}, 1fr) auto` }}>
              {fields.map((f) =>
                f === "from" ? (
                  <select key={f} className="mk-input" value={it[f] ?? "user"} onChange={(e) => set(i, f, e.target.value)}>
                    <option value="user">user</option>
                    <option value="agent">agent</option>
                  </select>
                ) : (
                  <input key={f} className="mk-input" placeholder={f} value={it[f] ?? ""} onChange={(e) => set(i, f, e.target.value)} />
                ),
              )}
              <button type="button" className="mk-mini-link" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Remove">
                ✕
              </button>
            </div>
          ))}
          {(!slot.maxItems || items.length < slot.maxItems) && (
            <button
              type="button"
              className="mk-btn-light ms-add"
              onClick={() => onChange([...items, Object.fromEntries(fields.map((f) => [f, f === "from" ? "user" : ""]))])}
            >
              ＋ Add
            </button>
          )}
        </div>
      </div>
    );
  }
  if (slot.type === "image") {
    const cur = typeof v === "string" ? v : "";
    return (
      <div className="mk-field">
        <span className="mk-flabel">{slot.label}</span>
        <div className="ms-shots">
          {(brand?.shotPaths ?? []).slice(0, 6).map((p, i) => (
            <button
              type="button"
              key={p}
              className={`ms-shot ${cur === p || (!cur && i === 0) ? "active" : ""}`}
              onClick={() => onChange(p)}
              style={{ backgroundImage: `url(${brand?.screenshots[i]})` }}
              aria-label={`Use screenshot ${i + 1}`}
            />
          ))}
          <label className="ms-shot ms-upload">
            ＋
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) {
                  const p = await onUpload(f);
                  if (p) onChange(p);
                }
              }}
            />
          </label>
        </div>
        {!brand && <p className="mk-hint">Add your site URL in the chat — we&apos;ll grab real screenshots.</p>}
      </div>
    );
  }
  // clip
  const cur = v as { src?: string } | undefined;
  return (
    <div className="mk-field">
      <span className="mk-flabel">{slot.label}</span>
      <div className="ms-clip">
        <span className={`ms-clip-mode ${!cur?.src ? "active" : ""}`}>
          <b>Auto tour</b>
          <span>We record a guided tour of your site — cursor, clicks, push-ins.</span>
        </span>
        <label className={`ms-clip-mode ${cur?.src ? "active" : ""}`}>
          <b>{cur?.src ? cur.src.replace("user/", "") : "Upload a recording"}</b>
          <span>MP4 of your product. Clep Capture recordings are coming soon.</span>
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) {
                const p = await onUpload(f);
                if (p) onChange({ src: p });
              }
            }}
          />
        </label>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ studio */

export default function MotionStudio({ onToast }: { onToast: (m: string) => void }) {
  const [templates, setTemplates] = useState<MotionTemplate[]>([]);
  const [controls, setControls] = useState<MotionControls | null>(null);
  const [apiErr, setApiErr] = useState<string | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [tab, setTab] = useState<"content" | "style">("content");
  const [stills, setStills] = useState<{ type: string; url: string }[] | null>(null);
  const [job, setJob] = useState<MotionJob | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    getTemplates()
      .then((r) => {
        const order = ["feature-film", "agent-run", "teaser", "editorial", "phone-chat"];
        setTemplates([...r.templates].sort((a, b) => (order.indexOf(a.id) + 99) % 99 - (order.indexOf(b.id) + 99) % 99));
        setControls(r.controls);
      })
      .catch((e) => setApiErr(e instanceof Error ? e.message : String(e)));
    getUsage().then(setUsage).catch(() => {});
    const s = load<{ brand: Brand | null; draft: Draft | null; msgs: Msg[]; url: string }>(LS, { brand: null, draft: null, msgs: [], url: "" });
    setBrand(s.brand);
    setDraft(s.draft);
    setMsgs(s.msgs);
    setUrl(s.url);
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(LS, JSON.stringify({ brand, draft, msgs: msgs.slice(-20), url }));
    } catch {}
  }, [brand, draft, msgs, url]);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy]);

  // Poll the render job.
  useEffect(() => {
    if (!job || job.status === "done" || job.status === "error") return;
    const t = window.setInterval(async () => {
      try {
        const j = await getJob(job.id);
        setJob(j);
        if (j.status === "done") {
          onToast("Your video is ready");
          getUsage().then(setUsage).catch(() => {});
        }
      } catch {}
    }, 2000);
    return () => window.clearInterval(t);
  }, [job, onToast]);

  const tpl = useMemo(
    () => (draft?.template === "custom" ? CUSTOM_TPL : templates.find((t) => t.id === draft?.template) ?? null),
    [templates, draft],
  );

  const ensureBrand = async (): Promise<Brand | null> => {
    const u = url.trim();
    if (!u) return brand;
    const normalized = /^https?:\/\//i.test(u) ? u : `https://${u}`;
    if (brand && brand.url === normalized) return brand;
    setBusy("Reading your site — colors, fonts, logo, screenshots…");
    const r = await extractBrand(normalized, setBusy);
    const b: Brand = {
      project: r.project,
      name: r.brand.name,
      url: normalized,
      screenshots: r.screenshots,
      shotPaths: r.brand.screenshots ?? [],
    };
    setBrand(b);
    return b;
  };

  const send = async (text?: string) => {
    const message = (text ?? input).trim();
    if (!message || busy) return;
    setInput("");
    const next: Msg[] = [...msgs, { role: "user", content: message }];
    setMsgs(next);
    try {
      const b = await ensureBrand();
      setBusy(draft ? "Updating your video…" : "Directing your video…");
      const r = await chatTurn({ message, project: b?.project ?? null, draft, history: next });
      setDraft({ template: r.template, values: r.values, controls: r.controls });
      setMsgs([...next, { role: "assistant", content: r.reply }]);
      setStills(null);
      if (b) void refreshPreview(b, { template: r.template, values: r.values, controls: r.controls });
    } catch (e) {
      setMsgs([...next, { role: "assistant", content: e instanceof Error ? e.message : "Something went wrong." }]);
    } finally {
      setBusy(null);
    }
  };

  const pickTemplate = (t: MotionTemplate) => {
    const keep = draft?.template === t.id;
    setDraft(keep ? draft : { template: t.id, values: {}, controls: {} });
    setStills(null);
    setJob(null);
    setMsgs((m) => [...m, { role: "assistant", content: `Switched to ${t.name}. Edit the fields, or tell me what to change.` }]);
  };

  const setValue = (k: string, v: unknown) => draft && setDraft({ ...draft, values: { ...draft.values, [k]: v } });
  const setControl = (k: string, v: unknown) => draft && setDraft({ ...draft, controls: { ...draft.controls, [k]: v } });
  const ctl = (k: string) => (draft?.controls[k] as string | undefined) ?? tpl?.defaults[k] ?? "";

  const refreshPreview = async (b = brand, d = draft) => {
    if (!b || !d) return onToast("Add your site URL first");
    setBusy("Rendering storyboard…");
    try {
      const r = await previewStills(b.project, d);
      setStills(r.stills.map((s) => ({ ...s, url: motionFile(s.url)! })));
    } catch (e) {
      onToast(e instanceof Error ? e.message : "Preview failed");
    } finally {
      setBusy(null);
    }
  };

  const render = async () => {
    if (!brand || !draft) return onToast("Add your site URL first");
    try {
      setStills(null);
      setJob(await startRender(brand.project, draft));
    } catch (e) {
      onToast(e instanceof Error ? e.message : "Render failed to start");
    }
  };

  const upload = async (f: File) => {
    if (!brand) {
      onToast("Add your site URL first");
      return null;
    }
    try {
      setBusy(`Uploading ${f.name}…`);
      return (await uploadAsset(brand.project, f)).path;
    } catch (e) {
      onToast(e instanceof Error ? e.message : "Upload failed");
      return null;
    } finally {
      setBusy(null);
    }
  };

  const brandColors = (draft?.controls.colors as Record<string, string> | undefined) ?? {};

  return (
    <div className="ms">
      <div className="mk-pagehead">
        <div>
          <h1>Create</h1>
          <p>Describe the video. Pick a look. Ship it today.</p>
        </div>
        <span className="ms-headchips">
          {usage && (
            <span className="ms-usage" title={`${usage.plan} plan`}>
              {usage.videos}/{usage.limit} videos this month
            </span>
          )}
          {brand && (
            <span className="ms-brandchip" title={brand.url}>
              <i /> {brand.name}
            </span>
          )}
        </span>
      </div>

      {apiErr && (
        <section className="mk-card">
          <div className="mk-card-body">
            <p className="mk-form-error" style={{ margin: 0 }}>{apiErr}</p>
          </div>
        </section>
      )}

      {/* CHAT */}
      <section className="mk-card ms-chat">
        {msgs.length > 0 && (
          <div className="ms-thread" ref={threadRef}>
            {msgs.map((m, i) => (
              <div key={i} className={`ms-msg ${m.role}`}>
                {m.role === "assistant" && <span className="ms-ava">✦</span>}
                <p>{m.content}</p>
              </div>
            ))}
            {busy && (
              <div className="ms-msg assistant">
                <span className="ms-ava">✦</span>
                <p className="ms-busy">
                  <i className="mk-spin" /> {busy}
                </p>
              </div>
            )}
          </div>
        )}
        <div className="ms-composer">
          <textarea
            className="ms-input"
            rows={msgs.length ? 1 : 2}
            placeholder={draft ? "Tell me what to change — “make it calmer”, “vertical for TikTok”, “new CTA: Join the beta”" : "What are you launching? Describe the video you want…"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <div className="ms-composer-row">
            <label className="ms-url">
              <span aria-hidden>🔗</span>
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="yoursite.com" aria-label="Your site URL" />
            </label>
            <button className="mk-btn-dark ms-send" disabled={!!busy || !input.trim()} onClick={() => void send()}>
              {busy ? "Working…" : draft ? "Update →" : "Create →"}
            </button>
          </div>
          {!msgs.length && (
            <div className="ms-suggest">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => setInput(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* TEMPLATES */}
      <div className="ms-sechead">
        <h2>Templates</h2>
        <span>Directed looks from what ships — hover to play.</span>
      </div>
      <div className="ms-tpls">
        {templates.map((t) => (
          <button
            type="button"
            key={t.id}
            className={`ms-tpl ${draft?.template === t.id ? "active" : ""}`}
            onClick={() => pickTemplate(t)}
            onMouseEnter={(e) => e.currentTarget.querySelector("video")?.play().catch(() => {})}
            onMouseLeave={(e) => {
              const v = e.currentTarget.querySelector("video");
              if (v) {
                v.pause();
                v.currentTime = 0;
              }
            }}
          >
            <span className="ms-tpl-media">
              {t.example?.video ? (
                <video src={motionFile(t.example.video)} poster={motionFile(t.example.poster)} muted loop playsInline preload="metadata" />
              ) : null}
            </span>
            <b>{t.name}</b>
            <span>{t.bestFor}</span>
          </button>
        ))}
      </div>

      {/* EDITOR */}
      {draft && tpl && controls && (
        <div className="ms-work">
          <section className="mk-card ms-editor">
            <div className="ms-tabs">
              <button className={tab === "content" ? "active" : ""} onClick={() => setTab("content")}>
                Content
              </button>
              <button className={tab === "style" ? "active" : ""} onClick={() => setTab("style")}>
                Style
              </button>
              <span className="ms-tplname">{tpl.name}</span>
            </div>
            <div className="mk-card-body">
              {tab === "content" && tpl.id === "custom" && (
                <BeatsEditor
                  beats={(draft.values.beats as Beat[] | undefined) ?? []}
                  onChange={(b) => setValue("beats", b)}
                  brand={brand}
                  onUpload={upload}
                />
              )}
              {tab === "content" &&
                tpl.id !== "custom" &&
                Object.entries(tpl.slots).map(([k, s]) => (
                  <SlotField key={k} id={`slot-${k}`} slot={s} value={draft.values[k]} onChange={(v) => setValue(k, v)} brand={brand} onUpload={upload} />
                ))}
              {tab === "style" && (
                <>
                  <div className="ms-grid2">
                    <div className="mk-field">
                      <label className="mk-flabel" htmlFor="c-font">Fonts</label>
                      <select id="c-font" className="mk-input" value={ctl("fontPairing")} onChange={(e) => setControl("fontPairing", e.target.value)}>
                        {Object.entries(controls.fontPairings).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mk-field">
                      <label className="mk-flabel" htmlFor="c-format">Format</label>
                      <select id="c-format" className="mk-input" value={ctl("format")} onChange={(e) => setControl("format", e.target.value)}>
                        {Object.keys(controls.formats).map((k) => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mk-field">
                    <span className="mk-flabel">Backdrop</span>
                    <div className="ms-chips">
                      {Object.entries(controls.backdrops).map(([k, v]) => (
                        <button key={k} type="button" className={ctl("backdrop") === k ? "active" : ""} onClick={() => setControl("backdrop", k)}>
                          <i
                            style={{
                              background: v.colors ? `linear-gradient(135deg, ${v.colors.join(",")})` : undefined,
                            }}
                            className={`ms-sw ms-sw-${v.kind}`}
                          />
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {(
                    [
                      ["pace", "Pace", Object.keys(controls.pace)],
                      ["textAnim", "Text animation", controls.textAnims],
                      ["transition", "Transitions", Object.keys(controls.transitions)],
                      ["camera", "Camera", Object.keys(controls.camera)],
                    ] as [string, string, string[]][]
                  ).map(([k, label, opts]) => (
                    <div className="mk-field" key={k}>
                      <span className="mk-flabel">{label}</span>
                      <div className="ms-seg">
                        {opts.map((o) => (
                          <button key={o} type="button" className={ctl(k) === o ? "active" : ""} onClick={() => setControl(k, o)}>
                            {o}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="mk-field">
                    <span className="mk-flabel">Colors</span>
                    <div className="mk-dots-row">
                      {(["background", "foreground", "primary", "accent"] as const).map((k) => (
                        <label key={k} className="mk-dotpick" title={k}>
                          <input
                            type="color"
                            value={brandColors[k] ?? "#000000"}
                            onChange={(e) => setControl("colors", { ...brandColors, [k]: e.target.value })}
                            aria-label={`${k} color`}
                          />
                          <span className="mk-mono">{k}</span>
                        </label>
                      ))}
                    </div>
                    <p className="mk-hint">Blank colors use your site&apos;s own palette.</p>
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="ms-preview">
            <div className="ms-stage">
              {job?.status === "done" && job.video ? (
                <video src={motionFile(job.video)} controls autoPlay playsInline />
              ) : stills && stills.length ? (
                <div className="ms-stills">
                  {stills.map((s, i) => (
                    <figure key={i}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.url} alt={s.type} />
                      <figcaption>{String(i + 1).padStart(2, "0")} · {s.type.replace(/_/g, " ")}</figcaption>
                    </figure>
                  ))}
                </div>
              ) : tpl.example?.video ? (
                <video src={motionFile(tpl.example.video)} poster={motionFile(tpl.example.poster)} muted loop autoPlay playsInline />
              ) : null}
              {job && job.status !== "done" && job.status !== "error" && (
                <div className="ms-progress">
                  <i className="mk-spin" />{" "}
                  {job.status === "queued" && job.queuePosition ? `Queued — ${job.queuePosition} ahead of you` : JOB_LABEL[job.status] ?? "Working…"}
                  <span className={`ms-bar ${job.status === "rendering" ? "ms-bar-live" : ""}`}>
                    <span style={{ width: `${Math.round(job.progress * 100)}%` }} />
                  </span>
                </div>
              )}
            </div>
            <p className="ms-caption">
              {job?.status === "done"
                ? "Your video is ready."
                : job?.status === "error"
                  ? `Render failed: ${job.error}`
                  : stills
                    ? "Storyboard — one frame per scene. Edit fields, then refresh or render."
                    : tpl.example
                      ? `Example: ${tpl.example.brand}. Your version uses your brand.`
                      : "Preview the storyboard to see your video frame by frame."}
            </p>
            <div className="ms-actions">
              <button className="mk-btn-light" disabled={!!busy || !brand} onClick={() => void refreshPreview()}>
                {stills ? "Refresh storyboard" : "Preview storyboard"}
              </button>
              <button className="mk-btn-dark" disabled={!brand || (!!job && job.status !== "done" && job.status !== "error")} onClick={() => void render()}>
                Render video →
              </button>
              {job?.status === "done" &&
                (job.outputs?.length ? job.outputs : job.video ? [{ format: String(ctl("format") || "16:9"), out: job.video, bytes: 0 }] : []).map((o) => (
                  <a
                    key={o.out}
                    className="mk-btn-light"
                    href={`${motionFile(o.out)}?dl=${encodeURIComponent(`${brand?.name ?? "clep"}-${draft?.template ?? "video"}-${o.format.replace(":", "x")}.mp4`)}`}
                  >
                    Download {o.format}
                  </a>
                ))}
            </div>
            {!brand && <p className="mk-hint">Add your site URL in the chat box to preview and render with your brand.</p>}
          </section>
        </div>
      )}
    </div>
  );
}
