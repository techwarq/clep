export default function ChapterCard({ design, title, className = "" }: { design: string; title: string; className?: string }) {
  if (design === "off") return <span className={`cd-chapter chapter-off ${className}`}>No card</span>;
  if (design === "pill") {
    return (
      <span className={`cd-chapter chapter-pill ${className}`}>
        <i>01</i>
        <b>{title}</b>
      </span>
    );
  }
  if (design === "badge") {
    return (
      <span className={`cd-chapter chapter-badge ${className}`}>
        <i>01</i>
        <span>
          <small>CHAPTER</small>
          <b>{title}</b>
        </span>
      </span>
    );
  }
  return (
    <span className={`cd-chapter chapter-${design} ${className}`}>
      <small>STEP 01</small>
      <b>{title}</b>
    </span>
  );
}
