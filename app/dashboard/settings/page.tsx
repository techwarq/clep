"use client";

import Link from "next/link";
import { PageHead, Soon } from "../../../components/dash/ui";
import { useDash } from "../../../lib/dashboard";
import { useTheme, type ThemeChoice } from "../../../lib/theme";

const THEMES: [ThemeChoice, string][] = [["light", "Light"], ["dark", "Dark"], ["system", "Match my system"]];

export default function Settings() {
  const { account, logout } = useDash();
  const { choice, choose } = useTheme();

  return (
    <div className="cd-page cd-narrow">
      <PageHead title="Settings" sub="Your account and team." />

      <section className="cd-card">
        <div className="cd-card-head">
          <div>
            <h2>Account</h2>
            <p>{account ? <>Signed in as <b>{account.user.email}</b> · {account.usage.plan} plan</> : "Loading…"}</p>
          </div>
          <Link href="/dashboard/keys" className="cd-btn">Manage API keys</Link>
        </div>
        <div className="cd-danger">
          <div>
            <b>Sign out</b>
            <p className="cd-muted">Ends this browser's session. Your keys and videos stay on Clep.</p>
          </div>
          <button type="button" className="cd-btn cd-btn-danger" onClick={logout}>Sign out</button>
        </div>
      </section>

      <section className="cd-card">
        <div className="cd-card-head">
          <div>
            <h2>Appearance</h2>
            <p>Light is white with a hint of Clep pink; dark sits on the sunset sky.</p>
          </div>
          <div className="cd-pills cd-pills-btn" role="radiogroup" aria-label="Theme">
            {THEMES.map(([value, label]) => (
              <button key={value} type="button" role="radio" aria-checked={choice === value} className={choice === value ? "on" : ""} onClick={() => choose(value)}>{label}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="cd-card">
        <div className="cd-card-head">
          <div>
            <h2>Team members <Soon /></h2>
            <p>Invite teammates to share projects, brand kits and minutes. Studio includes 3 seats.</p>
          </div>
          <button type="button" className="cd-btn" disabled>Invite</button>
        </div>
      </section>
    </div>
  );
}
