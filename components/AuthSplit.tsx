"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { sessionToken, signIn } from "../lib/platform";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ACCESS_CODE = /^\d{6}$/;

export default function AuthSplit() {
  return (
    <Suspense fallback={null}>
      <SignInPanel />
    </Suspense>
  );
}

function SignInPanel() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (sessionToken()) router.replace("/dashboard");
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL.test(email.trim())) return setError("Enter the email you reserved with");
    if (!ACCESS_CODE.test(code.trim())) return setError("Enter the 6-digit code from your email");
    setError("");
    setBusy(true);
    try {
      await signIn(email.trim().toLowerCase(), code.trim());
      router.push("/dashboard");
    } catch (err) {
      setBusy(false);
      setError(err instanceof Error ? err.message : "Something went wrong, try again");
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
          <h1>
            Welcome
            <br />
            <span>Back</span>
          </h1>
          <p className="auth-lead">
            Sign in with your email and the access code
            <br />
            we sent when your seat opened.
          </p>

          <form onSubmit={submit} noValidate>
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
            <label className="auth-field">
              <KeyIcon />
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit access code"
                autoComplete="one-time-code"
                inputMode="numeric"
                spellCheck={false}
              />
            </label>

            {error && <p className="auth-error" role="alert">{error}</p>}

            <button type="submit" className="auth-submit" disabled={busy}>
              {busy ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="auth-note">
            No access code yet? <Link href="/reserve">Reserve your spot</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

/** The glass C on the pink sky, left half of the split auth pages. */
export function AuthArt() {
  return (
    <div className="auth-art" aria-hidden>
      <div className="auth-c">
        <div className="auth-c-glass" />
        <img src="/brand/auth-c-line.png" alt="" className="auth-c-line" />
      </div>
    </div>
  );
}

export function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
