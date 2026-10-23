"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAccessKey, setAccessKey, verifyKey } from "../lib/platform";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_KEY = "clep_email";

type Mode = "signup" | "login";

const COPY: Record<Mode, { first: string; cta: string; busy: string; alt: string; altLink: string; altHref: string }> = {
  signup: { first: "Create", cta: "Create Account", busy: "Creating…", alt: "Already have an account?", altLink: "Log in", altHref: "/login" },
  login: { first: "Log Into", cta: "Log In", busy: "Logging in…", alt: "Don't have an account?", altLink: "Create Account", altHref: "/signup" },
};

/**
 * Split-screen sign up / log in. For now the access code is what gets you in: it's checked
 * against the API (GET /v1/me) and kept in this browser. Google sign-in isn't wired yet.
 */
export default function AuthSplit({ mode }: { mode: Mode }) {
  const router = useRouter();
  const copy = COPY[mode];
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (getAccessKey()) router.replace("/dashboard");
    try {
      setEmail(window.localStorage.getItem(EMAIL_KEY) ?? "");
    } catch {}
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL.test(email.trim())) return setError("Enter your work email");
    if (!code.trim()) return setError("Enter your access code");
    setError("");
    setBusy(true);
    try {
      await verifyKey(code.trim());
      setAccessKey(code.trim());
      try {
        window.localStorage.setItem(EMAIL_KEY, email.trim());
      } catch {}
      router.push("/dashboard");
    } catch (err) {
      setBusy(false);
      const msg = err instanceof Error ? err.message : "Something went wrong, try again";
      setError(msg === "That access key isn't valid" ? "That access code isn't valid" : msg);
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
            {copy.first}
            <br />
            Your <span>Account</span>
          </h1>
          <p className="auth-lead">
            Create worth watching launch videos
            <br />
            in seconds using a website link.
          </p>

          <button type="button" className="auth-google" disabled title="Coming soon">
            <GoogleIcon />
            Continue with Google
            <em>Soon</em>
          </button>

          <div className="auth-or"><span>OR</span></div>

          <form onSubmit={submit} noValidate>
            <label className="auth-field">
              <MailIcon />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Work email"
                autoComplete="email"
                inputMode="email"
              />
            </label>
            <label className="auth-field">
              <KeyIcon />
              <input
                type={show ? "text" : "password"}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Access code"
                autoComplete="off"
                spellCheck={false}
              />
              <button type="button" className="auth-eye" onClick={() => setShow(!show)} aria-label={show ? "Hide code" : "Show code"}>
                <EyeIcon off={!show} />
              </button>
            </label>

            {error && <p className="auth-error" role="alert">{error}</p>}

            <button type="submit" className="auth-submit" disabled={busy}>
              {busy ? copy.busy : copy.cta}
            </button>
          </form>

          <p className="auth-alt">
            {copy.alt} <Link href={copy.altHref}>{copy.altLink}</Link>
          </p>
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

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
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

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M4 4l16 16" />}
    </svg>
  );
}
