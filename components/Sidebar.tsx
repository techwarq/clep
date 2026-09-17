"use client";

import Image from "next/image";
import { useState } from "react";
import type { ClepUser } from "../lib/api";

export type DashView = "start" | "keys" | "billing" | "usage";

const NAV: { key: DashView; label: string; icon: string }[] = [
  { key: "start", label: "Get Started", icon: "🚀" },
  { key: "keys", label: "API Keys", icon: "🔑" },
  { key: "billing", label: "Billing", icon: "💳" },
  { key: "usage", label: "Usage", icon: "🕘" },
];

export default function Sidebar({
  view,
  onNavigate,
  user,
  planName,
  onLogout,
}: {
  view: DashView;
  onNavigate: (v: DashView) => void;
  user: ClepUser | null;
  planName: string | null;
  onLogout: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <aside className="sb">
      <div className="sb-brand">
        <Image src="/clep-icon.png" alt="" width={26} height={26} className="sb-mark" />
        <span>clep</span>
      </div>

      <div className="sb-workspace">
        <span className="sb-workspace-dot">{user?.name?.[0]?.toUpperCase() ?? "?"}</span>
        <span className="sb-workspace-name">{user ? `${user.name || user.email}'s workspace` : "Loading…"}</span>
      </div>

      <nav className="sb-nav">
        {NAV.map((n) => (
          <button
            key={n.key}
            className={`sb-nav-item ${view === n.key ? "active" : ""}`}
            onClick={() => onNavigate(n.key)}
          >
            <span className="sb-nav-icon">{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>

      <div className="sb-footer">
        <a className="sb-nav-item sb-link" href="https://github.com/techwarq/clep_plugin_be" target="_blank" rel="noreferrer">
          <span className="sb-nav-icon">📖</span>Docs
        </a>
        <a className="sb-nav-item sb-link" href="mailto:support@clep.dev">
          <span className="sb-nav-icon">💬</span>Contact Us
        </a>

        <button className="sb-plan-card" onClick={() => onNavigate("billing")}>
          <span className="sb-plan-label">PLAN</span>
          <span className="sb-plan-value">{planName ? planName.toUpperCase() : "—"}</span>
        </button>

        <div className="sb-user-wrap">
          <button className="sb-user-row" onClick={() => setMenuOpen((m) => !m)}>
            <span className="sb-user-dot">{user?.name?.[0]?.toUpperCase() ?? "?"}</span>
            <span className="sb-user-name">{user?.name || user?.email || "Account"}</span>
          </button>
          {menuOpen && (
            <>
              <div className="menu-scrim" onClick={() => setMenuOpen(false)} />
              <div className="avatar-menu sb-user-menu">
                <button onClick={() => { setMenuOpen(false); onLogout(); }}>Logout</button>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
