"use client";

import { useState } from "react";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Waitlist({ id }: { id?: string }) {
  const [name, setName] = useState("");
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
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
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

  if (done) {
    return (
      <p id={id} className="waitlist-done" role="status">
        You&apos;re on the list. We&apos;ll email {email.trim()} when it&apos;s your turn.
      </p>
    );
  }

  return (
    <form id={id} className="waitlist" onSubmit={submit} noValidate>
      <div className="waitlist-row">
        <input
          aria-label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          autoComplete="name"
        />
        <input
          aria-label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          autoComplete="email"
          inputMode="email"
        />
        <button type="submit" disabled={busy}>
          {busy ? "Joining…" : "Join waitlist"}
        </button>
      </div>
      {error && <p className="waitlist-error" role="alert">{error}</p>}
    </form>
  );
}
