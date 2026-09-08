"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login, setToken, setUser, signup } from "../lib/api";

export default function AuthCard({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const isSignup = mode === "signup";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (isSignup && name.trim().length < 2) errs.name = "Tell us your name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = "Enter a valid email";
    if (password.length < 8) errs.password = "Minimum 8 characters";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setBusy(true);
    try {
      const trimmedEmail = email.trim();
      const { token, name: resolvedName } = isSignup
        ? await signup(trimmedEmail, password, name.trim())
        : await login(trimmedEmail, password);
      setToken(token);
      setUser({ email: trimmedEmail, name: resolvedName });
      setToast(isSignup ? "Account created — welcome to clep!" : "Welcome back!");
      window.setTimeout(() => router.push("/dashboard"), 900);
    } catch (err) {
      setBusy(false);
      setErrors({ form: err instanceof Error ? err.message : "Something went wrong — try again" });
    }
  };

  return (
    <>
      <main className="wrap auth-page">
        <div className="auth-card">
          <Link href="/" aria-label="clep — home">
            <Image src="/logo.png" alt="clep" width={760} height={413} className="auth-logo" priority />
          </Link>
          <h1>{isSignup ? "Create your account" : "Welcome back"}</h1>
          <p className="auth-sub">
            {isSignup ? (
              <>Free plan · 3 conversions a month · <u>No credit card needed</u></>
            ) : (
              <>Pick up right where you left off.</>
            )}
          </p>

          <button className="btn btn-ghost auth-social" onClick={() => setToast("Google sign-in ships at launch")}>
            <span className="g-mark">G</span> Continue with Google
          </button>
          <div className="auth-div"><span>or</span></div>

          <form onSubmit={submit} noValidate>
            {isSignup && (
              <label className="field">
                <span>Name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Priya Sharma"
                  autoComplete="name"
                />
                {errors.name && <em>{errors.name}</em>}
              </label>
            )}
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
            <label className="field">
              <span>Password</span>
              <div className="pw-wrap">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8+ characters"
                  autoComplete={isSignup ? "new-password" : "current-password"}
                />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)} aria-label={showPw ? "Hide password" : "Show password"}>
                  {showPw ? "🙈" : "👁"}
                </button>
              </div>
              {errors.password && <em>{errors.password}</em>}
            </label>

            {!isSignup && (
              <div className="auth-row">
                <span />
                <button type="button" className="link-btn" onClick={() => setToast("Reset link ships at launch")}>
                  Forgot password?
                </button>
              </div>
            )}

            {errors.form && <p className="auth-form-error" role="alert">{errors.form}</p>}

            <button className="btn btn-lime auth-submit" type="submit" disabled={busy}>
              {busy ? (isSignup ? "Creating account…" : "Logging in…") : isSignup ? "Create free account" : "Log in"}
            </button>
          </form>

          <p className="auth-alt">
            {isSignup ? (
              <>Already have an account? <Link href="/login">Log in</Link></>
            ) : (
              <>New to clep? <Link href="/signup">Create an account</Link></>
            )}
          </p>
          {isSignup && (
            <p className="auth-terms">By signing up you agree to the Terms & Privacy Policy.</p>
          )}
        </div>
      </main>
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
