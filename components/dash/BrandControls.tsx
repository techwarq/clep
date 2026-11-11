export function Pills<T extends string>({ options, value, onPick }: { options: { value: T; name: string }[]; value: string; onPick: (value: T) => void }) {
  return (
    <div className="cd-pills cd-pills-btn">
      {options.map((o) => (
        <button key={o.value || o.name} type="button" className={value === o.value ? "on" : ""} onClick={() => onPick(o.value)}>{o.name}</button>
      ))}
    </div>
  );
}

export function Toggle({ label, on, flip }: { label: string; on: boolean; flip: () => void }) {
  return (
    <label className="cd-toggle">
      <button type="button" role="switch" aria-checked={on} aria-label={label} className="cd-switch" onClick={flip} />
      {label}
    </label>
  );
}
