"use client";

import { useEffect, useRef } from "react";

const CELL = 22;
const PINK = "232, 96, 146";
const HOT = "255, 170, 200";

interface Lit { c: number; r: number; a: number; phase: number; speed: number; glow: boolean; outline: boolean }
interface Spark { x: number; y: number; size: number; phase: number; speed: number }
interface Pulse { horiz: boolean; line: number; pos: number; dir: 1 | -1; speed: number; len: number; cell: number }
interface Flash { c: number; r: number; life: number }

/**
 * The page backdrop, fixed behind every section: a fine pink grid beaded at its crossings and
 * glowing toward the corners, breathing cells, twinkling pixel sparks, and short electric pulses
 * that run along the lines and light up cells as they pass. The middle stays calm so text reads.
 */
export default function PixelGrid() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const base = document.createElement("canvas");
    let w = 0, h = 0, cols = 0, rows = 0, raf = 0, last = 0, dpr = 1;
    let lit: Lit[] = [], sparks: Spark[] = [], pulses: Pulse[] = [], flashes: Flash[] = [];

    // Canvas shadowBlur re-blurs on every draw call, which is what made this backdrop heavy.
    // The glows are baked into sprites once and stamped with globalAlpha instead.
    const sprite = (size: number, blur: number, paint: (g: CanvasRenderingContext2D, o: number) => void) => {
      const pad = blur * 2, o = pad;
      const c = document.createElement("canvas");
      c.width = c.height = (size + pad * 2) * dpr;
      const g = c.getContext("2d")!;
      g.scale(dpr, dpr);
      g.shadowColor = `rgba(${PINK}, 1)`;
      g.shadowBlur = blur;
      paint(g, o);
      return { c, pad, full: size + pad * 2 };
    };
    let glowCell = sprite(CELL - 1, 18, () => {}), flashCell = glowCell, spark = glowCell;
    const makeSprites = () => {
      const cell = (g: CanvasRenderingContext2D, o: number) => { g.fillStyle = `rgb(${HOT})`; g.fillRect(o, o, CELL - 1, CELL - 1); };
      glowCell = sprite(CELL - 1, 18, cell);
      flashCell = sprite(CELL - 1, 22, cell);
      spark = sprite(5, 8, (g, o) => { g.fillStyle = `rgb(${HOT})`; g.fillRect(o, o, 5, 5); });
    };

    // how "hot" a point is: 1 in the top-left / bottom-right corners, fading to 0 in the middle
    const heat = (x: number, y: number) => {
      const R = Math.max(w, h);
      const d1 = Math.hypot(x, y) / (R * 0.55);
      const d2 = Math.hypot(w - x, h - y) / (R * 0.55);
      const d3 = Math.hypot(x, h - y) / (R * 0.4);
      const d4 = Math.hypot(w - x, y) / (R * 0.35);
      return Math.max(0, 1 - d1, 0.9 - d2, 0.6 - d3, 0.5 - d4);
    };
    const side = (x: number) => Math.abs(x / w - 0.5) * 2;

    const newPulse = (): Pulse => {
      const horiz = Math.random() < 0.45;
      let line = Math.floor(Math.random() * (horiz ? rows : cols));
      if (!horiz) {
        const k = Math.floor(Math.random() * cols * 0.3);
        line = Math.random() < 0.5 ? k : cols - 1 - k;
      }
      const dir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
      const span = horiz ? w : h;
      return { horiz, line, dir, pos: dir === 1 ? -30 : span + 30, speed: 120 + Math.random() * 200, len: 14 + Math.random() * 30, cell: -1 };
    };

    // static layer: the grid lines and the beads where they cross, tinted by heat
    const paintBase = () => {
      const raw = document.createElement("canvas");
      raw.width = w * dpr;
      raw.height = h * dpr;
      const bctx = raw.getContext("2d")!;
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bctx.lineWidth = 1;
      for (let x = 0.5; x < w; x += CELL) {
        for (let y = 0; y < h; y += CELL) {
          const k = heat(x, y + CELL / 2);
          bctx.strokeStyle = `rgba(${PINK}, ${0.03 + 0.26 * k * k})`;
          bctx.beginPath(); bctx.moveTo(x, y); bctx.lineTo(x, y + CELL); bctx.stroke();
        }
      }
      for (let y = 0.5; y < h; y += CELL) {
        for (let x = 0; x < w; x += CELL) {
          const k = heat(x + CELL / 2, y);
          bctx.strokeStyle = `rgba(${PINK}, ${0.03 + 0.26 * k * k})`;
          bctx.beginPath(); bctx.moveTo(x, y); bctx.lineTo(x + CELL, y); bctx.stroke();
        }
      }
      for (let x = 0; x < w; x += CELL) {
        for (let y = 0; y < h; y += CELL) {
          const k = heat(x, y);
          if (k < 0.25 || Math.random() > 0.12) continue;
          bctx.fillStyle = `rgba(${HOT}, ${0.35 * k})`;
          bctx.fillRect(x - 0.5, y - 0.5, 2, 2);
        }
      }
      base.width = w * dpr;
      base.height = h * dpr;
      const out = base.getContext("2d")!;
      out.filter = "blur(0.6px)";
      out.drawImage(raw, 0, 0);
    };

    const seed = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      makeSprites();
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / CELL);
      rows = Math.ceil(h / CELL);
      paintBase();
      lit = []; sparks = []; flashes = [];
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const x = c * CELL + CELL / 2, y = r * CELL + CELL / 2, k = heat(x, y), s = side(x);
          const p = s < 0.5 ? 0 : 0.004 + 0.07 * Math.pow(s, 2.5) + 0.12 * k * s;
          if (Math.random() < p) {
            lit.push({ c, r, a: 0.15 + Math.random() * 0.5, phase: Math.random() * 6.3, speed: 0.3 + Math.random() * 1.1, glow: Math.random() < 0.14 + 0.2 * s, outline: Math.random() < 0.1 });
          }
        }
      }
      for (let i = 0; i < Math.round((w * h) / 9000); i++) {
        const x = Math.random() * w;
        if (side(x) < 0.3 && Math.random() < 0.6) continue;
        sparks.push({ x, y: Math.random() * h, size: 2 + Math.random() * 3, phase: Math.random() * 6.3, speed: 0.8 + Math.random() * 2.4 });
      }
      pulses = Array.from({ length: Math.max(5, Math.round((w * h) / 140000)) }, () => {
        const p = newPulse();
        p.pos = Math.random() * (p.horiz ? w : h);
        return p;
      });
    };

    const draw = (ms: number) => {
      const t = ms / 1000, dt = Math.min(0.05, last ? t - last : 0);
      last = t;
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = 0.85 + 0.15 * Math.sin(t * 0.7);
      ctx.drawImage(base, 0, 0, w, h);
      ctx.globalAlpha = 1;

      for (const s of lit) {
        const x = s.c * CELL, y = s.r * CELL;
        const a = s.a * (0.45 + 0.55 * Math.sin(t * s.speed + s.phase));
        if (a <= 0.01) continue;
        if (s.outline) {
          ctx.strokeStyle = `rgba(${PINK}, ${a})`;
          ctx.strokeRect(x + 1.5, y + 1.5, CELL - 2, CELL - 2);
        } else if (s.glow) {
          ctx.globalAlpha = Math.min(1, a + 0.3);
          ctx.drawImage(glowCell.c, x + 1 - glowCell.pad, y + 1 - glowCell.pad, glowCell.full, glowCell.full);
          ctx.globalAlpha = 1;
        } else {
          ctx.fillStyle = `rgba(${PINK}, ${a * 0.55})`;
          ctx.fillRect(x + 1, y + 1, CELL - 1, CELL - 1);
        }
      }

      flashes = flashes.filter((f) => (f.life -= dt * 1.3) > 0);
      for (const f of flashes) {
        ctx.globalAlpha = f.life * 0.9;
        ctx.drawImage(flashCell.c, f.c * CELL + 1 - flashCell.pad, f.r * CELL + 1 - flashCell.pad, flashCell.full, flashCell.full);
      }

      // twinkling pixel sparks
      for (const s of sparks) {
        const k = Math.max(0, Math.sin(t * s.speed + s.phase));
        if (k < 0.08) continue;
        const z = s.size * (0.5 + 0.5 * k), scale = z / 5, full = spark.full * scale;
        ctx.globalAlpha = 0.25 + 0.75 * k;
        ctx.drawImage(spark.c, s.x - full / 2, s.y - full / 2, full, full);
      }
      ctx.globalAlpha = 1;

      // short electric pulses along the lines
      ctx.lineCap = "round";
      ctx.lineWidth = 1.4;
      for (let i = 0; i < pulses.length; i++) {
        const p = pulses[i];
        p.pos += p.dir * p.speed * dt;
        const span = p.horiz ? w : h;
        if (p.pos < -p.len - 30 || p.pos > span + p.len + 30) { pulses[i] = newPulse(); continue; }
        const fixed = p.line * CELL + 0.5, tail = p.pos - p.dir * p.len;
        const [hx, hy, tx, ty] = p.horiz ? [p.pos, fixed, tail, fixed] : [fixed, p.pos, fixed, tail];
        const a = 0.25 + 0.75 * Math.min(1, side(hx) * 1.3);
        const g = ctx.createLinearGradient(tx, ty, hx, hy);
        g.addColorStop(0, `rgba(${PINK}, 0)`);
        g.addColorStop(1, `rgba(${HOT}, ${a})`);
        ctx.strokeStyle = g;
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy);
        ctx.globalAlpha = 0.3; ctx.lineWidth = 5; ctx.stroke();
        ctx.globalAlpha = 1; ctx.lineWidth = 1.4; ctx.stroke();
        ctx.fillStyle = `rgba(255, 240, 246, ${a})`;
        ctx.fillRect(hx - 1.5, hy - 1.5, 3, 3);
        const cell = Math.floor(p.pos / CELL);
        if (cell !== p.cell) {
          p.cell = cell;
          if (side(hx) > 0.4 && Math.random() < 0.08) {
            const off = Math.random() < 0.5 ? -1 : 0;
            flashes.push(p.horiz ? { c: cell, r: p.line + off, life: 1 } : { c: p.line + off, r: cell, life: 1 });
          }
        }
      }
      ctx.lineWidth = 1;
      if (!still) raf = requestAnimationFrame(draw);
    };

    seed();
    raf = requestAnimationFrame(draw);
    let resizeTimer = 0;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => { seed(); if (still) draw(0); }, 120);
    };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); clearTimeout(resizeTimer); window.removeEventListener("resize", onResize); };
  }, []);

  return <canvas ref={ref} className="pixel-grid" aria-hidden />;
}
