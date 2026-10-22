"use client";

import { useState } from "react";

export default function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="cmd">
      <span className="cmd-prompt" aria-hidden>$</span>
      <code className="cmd-text">{command}</code>
      <button type="button" className="cmd-button" onClick={copy} aria-label="Copy command">
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
