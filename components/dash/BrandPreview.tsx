import { CURSOR_COLORS, CURSOR_SHAPES, backdropCss, cursorParts } from "../../lib/brand-options";
import type { BrandKit } from "../../lib/platform";

const ASPECT: Record<string, string> = { "16:9": "16 / 9", "9:16": "9 / 16", "1:1": "1 / 1", "4:5": "4 / 5" };

export default function BrandPreview({ kit, backdrop }: { kit: BrandKit; backdrop: string }) {
  const look = kit.look ?? {};
  const cursor = cursorParts(look.cursor);
  const glyph = CURSOR_SHAPES.find((s) => s.value === cursor.shape)?.glyph ?? "↖︎";
  const ink = CURSOR_COLORS.find((c) => c.value === cursor.color)?.swatch ?? "#141418";
  const scale = { small: 0.8, large: 1.3, xl: 1.6 }[cursor.size] ?? 1;
  const tall = kit.aspect === "9:16" || kit.aspect === "4:5";

  return (
    <div className={`cd-frame look-${kit.style ?? "saas"} ${tall ? "tall" : ""}`} style={{ background: backdropCss(backdrop), aspectRatio: ASPECT[kit.aspect ?? "16:9"] }}>
      <div className={`cd-frame-window device-${look.device || "window"} ${look.glow ? "glow" : ""} ${look.reflection ? "reflect" : ""}`}>
        <div className="cd-frame-bar">
          <i /><i /><i />
          {look.device === "browser" && <span className="cd-frame-url">yourapp.com</span>}
        </div>
        <div className="cd-frame-body">
          <span />
          <span />
          <span className="short" />
          <b className="cd-frame-btn">Export CSV</b>
        </div>
        <span className={`cd-frame-cursor ${cursor.shape.includes("halo") ? "halo" : ""}`} style={{ color: ink, fontSize: `${18 * scale}px` }}>
          {glyph}
        </span>
      </div>
      {kit.captions !== false && <span className="cd-frame-caption">Export your report in one click</span>}
      {(kit.outro?.brand || kit.outro?.cta) && (
        <span className="cd-frame-outro">
          {kit.outro?.brand && <b>{kit.outro.brand}</b>}
          {kit.outro?.cta && <em>{kit.outro.cta}</em>}
        </span>
      )}
    </div>
  );
}
