"use client";

import { useEffect, useState } from "react";
import { useDash } from "../../../lib/dashboard";
import type { CreatedKey } from "../../../lib/platform";
import { Ico } from "../icons";

export default function NewKeyPanel({ created, rotated, onDone }: { created: CreatedKey; rotated: boolean; onDone: () => void }) {
  const { toast } = useDash();
  const [copied, setCopied] = useState<"key" | "export" | null>(null);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  const copy = async (what: "key" | "export") => {
    try {
      await navigator.clipboard.writeText(what === "key" ? created.key : `export CLEP_API_KEY=${created.key}`);
      setCopied(what);
    } catch {
      toast("Couldn't copy: select the key and copy it by hand");
    }
  };

  return (
    <section className="cd-card cd-newkey" role="alert">
      <h2>{rotated ? "Your regenerated key" : "Your new key"}: {created.label}</h2>
      <p className="cd-newkey-warn">
        Copy it now. Clep only stores a fingerprint of it, so this is the only time you'll see the full key.
        {rotated && " The old key has already stopped working."}
      </p>
      <div className="cd-copy mono">
        <code className="cd-newkey-value" onFocus={(e) => window.getSelection()?.selectAllChildren(e.currentTarget)} tabIndex={0}>{created.key}</code>
        <button type="button" className="cd-btn cd-btn-sm cd-btn-pink" onClick={() => void copy("key")}>{Ico.copy} {copied === "key" ? "Copied" : "Copy key"}</button>
        <button type="button" className="cd-btn cd-btn-sm" onClick={() => void copy("export")}>{copied === "export" ? "Copied" : "Copy export line"}</button>
      </div>
      <p className="cd-muted">Add it to your environment: run the export line in the terminal you start your agent from (or add it to ~/.zshrc), or store it in your CI's secrets. Never commit it or paste it into the agent's chat.</p>
      <button type="button" className="cd-btn" onClick={onDone} disabled={!copied}>
        {copied ? "I've saved it" : "Copy the key to continue"}
      </button>
    </section>
  );
}
