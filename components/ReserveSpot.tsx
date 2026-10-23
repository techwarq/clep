"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthArt, MailIcon } from "./AuthSplit";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Private beta sign-up, laid out like log in / sign up. The access code is emailed afterwards. */
export default function ReserveSpot() {
  const [name, setName] = useState("");
  const [app, setApp] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return setError("Tell us your name");
    if (!EMAIL.test(email.trim())) return setError("Enter a valid email");
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), app: app.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || data?.message || "Something went wrong, try again");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong, try again");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-split">
      <AuthArt />

      <section className="auth-panel">
        <div className="auth-box">
          <Link href="/" aria-label="Clep home" className="auth-logo">
            <img src="/brand/clep-logo-cream.png" alt="Clep" width={110} height={43} />
          </Link>

          {done ? (
            <div className="auth-done" role="status">
              <h1>
                You&apos;re
                <br />
                <span>In.</span>
              </h1>
              <p className="auth-lead">
                Your access code is on its way to <strong>{email.trim()}</strong>.
                <br />
                It should land in a few minutes. Check your inbox and your spam folder.
              </p>
              <Link href="/login" className="auth-submit">Log in with your code</Link>
            </div>
          ) : (
            <>
              <h1>
                Reserve
                <br />
                Your <span>Spot</span>
              </h1>
              <p className="auth-lead">Private beta. We&apos;ll email you an access code.</p>

              <form onSubmit={submit} noValidate className="reserve-form">
                <label className="auth-field">
                  <PersonIcon />
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" />
                </label>
                <label className="auth-field">
                  <AppIcon />
                  <input value={app} onChange={(e) => setApp(e.target.value)} placeholder="App name (optional)" autoComplete="organization" />
                </label>
                <label className="auth-field">
                  <MailIcon />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    autoComplete="email"
                    inputMode="email"
                  />
                </label>

                {error && <p className="auth-error" role="alert">{error}</p>}

                <button type="submit" className="auth-submit" disabled={busy}>
                  {busy ? "Reserving…" : "Reserve My Spot"}
                </button>
              </form>
            </>
          )}

          <p className="auth-alt">
            Already have a code? <Link href="/login">Log in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

function PersonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </svg>
  );
}

function AppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M3 9h18" />
      <circle cx="6.5" cy="6.5" r="0.6" fill="currentColor" />
      <circle cx="9" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}
