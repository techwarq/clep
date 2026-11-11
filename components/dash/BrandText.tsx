import { ACCENTS, CAPTION_STYLES, CHAPTER_STYLES } from "../../lib/brand-options";
import type { BrandKit } from "../../lib/platform";
import { Toggle } from "./BrandControls";
import ChapterCard from "./ChapterCard";

type Look = NonNullable<BrandKit["look"]>;

export default function BrandText({ kit, set, setLook }: { kit: BrandKit; set: (patch: BrandKit) => void; setLook: (patch: Look) => void }) {
  const look = kit.look ?? {};
  const accent = look.accent ?? ACCENTS[0];
  const captionStyle = look.caption_style ?? "dark";

  return (
    <section className="cd-card">
      <h3 className="cd-side-h">Captions &amp; chapter cards</h3>
      <div className="cd-toggle-row cd-toggle-top">
        <Toggle label="Show captions" on={kit.captions !== false} flip={() => set({ captions: kit.captions === false })} />
      </div>
      <div className={`cd-caption-grid ${kit.captions === false ? "off" : ""}`}>
        {CAPTION_STYLES.map((style) => (
          <button key={style.value} type="button" className={`cd-caption-choice ${captionStyle === style.value ? "on" : ""}`} onClick={() => setLook({ caption_style: style.value })}>
            <span className="cd-caption-stage" style={{ "--brand": accent } as React.CSSProperties}>
              <span className={`cd-caption-pill caption-${style.value}`}>Export in one click</span>
            </span>
            <b>{style.name}</b>
            <small>{style.note}</small>
          </button>
        ))}
      </div>
      <p className="cd-label">Chapter cards</p>
      <div className="cd-chapter-grid">
        {CHAPTER_STYLES.map((style) => (
          <button key={style.value} type="button" className={`cd-caption-choice ${(look.chapter_style ?? "dark") === style.value ? "on" : ""}`} onClick={() => setLook({ chapter_style: style.value })}>
            <span className="cd-caption-stage cd-chapter-stage" style={{ "--brand": accent } as React.CSSProperties}>
              <ChapterCard design={style.value} title="Reports" />
            </span>
            <b>{style.name}</b>
          </button>
        ))}
      </div>
      <p className="cd-label">Accent colour</p>
      <div className="cd-swatches cd-swatches-sm cd-accents">
        {ACCENTS.map((color) => (
          <button key={color} type="button" title={color} style={{ background: color }} className={accent === color ? "on" : ""} onClick={() => setLook({ accent: color })} aria-label={`Accent ${color}`} />
        ))}
        <input type="color" value={accent} aria-label="Custom accent colour" onChange={(e) => setLook({ accent: e.target.value })} />
      </div>
    </section>
  );
}
