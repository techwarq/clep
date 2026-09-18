"use client";

import { useState } from "react";
import Link from "next/link";
import ClepLogo from "./Logo";

export default function InviteCard() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (name.trim().length < 2) errs.name = "Tell us your name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = "Enter a valid email";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setBusy(true);
    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || data?.message || "Something went wrong — try again");
      setDone(true);
    } catch (err) {
      setBusy(false);
      setErrors({ form: err instanceof Error ? err.message : "Something went wrong — try again" });
    }
  };

  return (
    <main className="wrap auth-page">
      <div className="auth-card">
        <Link href="/" aria-label="clep — home" style={{ display: "inline-block" }}>
          <ClepLogo markSize={34} fontSize={27} />
        </Link>
        {done ? (
          <>
            <h1>You&apos;re on the list ✓</h1>
            <p className="auth-sub">Thanks {name.trim()} — we&apos;ll email {email.trim()} when your invite is ready.</p>
            <Link className="btn btn-lime auth-submit" href="/">
              Back to home
            </Link>
          </>
        ) : (
          <>
            <h1>Ask for an invite</h1>
            <p className="auth-sub">Clep is in private beta — leave your details and we&apos;ll let you in.</p>
            <form onSubmit={submit} noValidate>
              <label className="field">
                <span>Name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sonali Nayak"
                  autoComplete="name"
                />
                {errors.name && <em>{errors.name}</em>}
              </label>
              <label className="field">
                <span>Email</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  inputMode="email"
                />
                {errors.email && <em>{errors.email}</em>}
              </label>

              {errors.form && <p className="auth-form-error" role="alert">{errors.form}</p>}

              <button className="btn btn-lime auth-submit" type="submit" disabled={busy}>
                {busy ? "Requesting…" : "Request invite →"}
              </button>
            </form>
            <p className="auth-alt">
              <Link href="/">← Back to home</Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
