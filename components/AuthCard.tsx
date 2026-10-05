"use client";

import { useEffect, useState } from "react";
import ClepLogo from "./Logo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAccessKey, setAccessKey, verifyKey } from "../lib/platform";

/** Access-key gate: no accounts — paste the key you were given and you're in. */
export default function AuthCard() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (getAccessKey()) router.replace("/dashboard");
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const k = key.trim();
    if (!k) return setError("Paste your access key");
    setBusy(true);
    setError(null);
    try {
      await verifyKey(k);
      setAccessKey(k);
      router.push("/dashboard");
    } catch (err) {
      setBusy(false);
      setError(err instanceof Error ? err.message : "Something went wrong — try again");
    }
  };

  return (
    <main className="wrap auth-page">
      <div className="auth-card">
        <Link href="/" aria-label="clep — home">
          <ClepLogo height={34} />
        </Link>
        <h1>Enter your access key</h1>
        <p className="auth-sub">Paste the key you were given to start making videos.</p>

        <form onSubmit={submit} noValidate>
          <label className="field">
            <span>Access key</span>
            <div className="pw-wrap">
              <input
                type={show ? "text" : "password"}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="va_…"
                autoComplete="off"
                spellCheck={false}
                autoFocus
              />
              <button type="button" className="pw-toggle" onClick={() => setShow(!show)} aria-label={show ? "Hide key" : "Show key"}>
                {show ? "🙈" : "👁"}
              </button>
            </div>
          </label>

          {error && <p className="auth-form-error" role="alert">{error}</p>}

          <button className="btn btn-lime auth-submit" type="submit" disabled={busy}>
            {busy ? "Checking…" : "Continue"}
          </button>
        </form>

        <p className="auth-alt">
          No key yet? <Link href="/invite">Request access</Link>
        </p>
        <p className="auth-terms">Your key stays in this browser. Remove it anytime from the account menu.</p>
      </div>
    </main>
  );
}
