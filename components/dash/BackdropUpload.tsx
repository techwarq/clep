"use client";

import { useRef, useState } from "react";
import { useDash } from "../../lib/dashboard";
import { uploadBackdrop } from "../../lib/platform";

const MAX_BYTES = 10 * 1024 * 1024;

export default function BackdropUpload({ preview, chosen, onUploaded }: { preview: string | null; chosen: boolean; onUploaded: (bg: string) => void }) {
  const { toast, fail } = useDash();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_BYTES) return fail(new Error("Pick an image under 10 MB"));
    setBusy(true);
    try {
      onUploaded(await uploadBackdrop(file));
      toast("Backdrop uploaded. Save the kit to use it");
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div className="cd-swatch-group">
      <p className="cd-label">Your image</p>
      <div className="cd-upload-row">
        {preview && <span className={`cd-upload-thumb ${chosen ? "on" : ""}`} style={{ backgroundImage: `url(${preview})` }} />}
        <button type="button" className="cd-btn cd-btn-sm" disabled={busy} onClick={() => input.current?.click()}>
          {busy ? "Uploading…" : preview ? "Replace image" : "Upload image"}
        </button>
        <small className="cd-muted">PNG, JPEG or WebP, up to 10 MB. 2560 × 1440 or larger looks best.</small>
        <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => void pick(e.target.files?.[0])} />
      </div>
    </div>
  );
}
