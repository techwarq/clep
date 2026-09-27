"use client";

import { useState } from "react";
import type { ClepUser } from "../lib/api";
import ClepLogo from "./Logo";

export type DashView = "create" | "videos" | "capture" | "keys" | "billing" | "usage";

function Icon({ d, extra }: { d: string; extra?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
      {extra ? <path d={extra} /> : null}
    </svg>
  );
}

const NAV: { key: DashView; label: string; icon: React.ReactNode; badge?: string; disabled?: boolean }[] = [
  {
    key: "create",
    label: "Create",
    icon: <Icon d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3z" extra="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z" />,
  },
  {
    key: "videos",
    label: "Videos",
    icon: <Icon d="M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-11z" extra="M4 9h16M8 5v4M12 5v4M16 5v4" />,
  },
  {
    key: "capture",
    label: "Capture",
    badge: "Soon",
    disabled: true,
    icon: <Icon d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-9z" extra="M10 9.5v5l4-2.5-4-2.5z" />,
  },
  {
    key: "keys",
    label: "API Keys",
    icon: <Icon d="M8 15.5a3.5 3.5 0 1 0 0 .01M11.2 12.3 20 3.5m-4.5 1L18 7m-5.5-.5L15 9" />,
  },
  {
    key: "billing",
    label: "Billing",
    icon: <Icon d="M12 3l7 2.8v5.4c0 4.8-3.4 7.8-7 9.3-3.6-1.5-7-4.5-7-9.3V5.8L12 3z" />,
  },
  {
    key: "usage",
    label: "Usage",
    icon: <Icon d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM12 8v4l2.8 1.8" />,
  },
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
  const initial = user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "?";
  const workspaceName = user ? `${user.name || user.email}'s workspace` : "Loading…";

  return (
    <aside className="sb">
      <div className="sb-top">
        <div className="sb-brand">
          <ClepLogo height={24} />
        </div>

        <button className="sb-workspace" title={workspaceName}>
          <span className="sb-workspace-dot">{initial}</span>
          <span className="sb-workspace-name">{workspaceName}</span>
          <svg className="sb-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M8 9l4-4 4 4M8 15l4 4 4-4" />
          </svg>
        </button>

        <nav className="sb-nav">
          {NAV.map((n) => (
            <button
              key={n.key}
              className={`sb-nav-item ${view === n.key ? "active" : ""} ${n.disabled ? "disabled" : ""}`}
              disabled={n.disabled}
              title={n.disabled ? "Coming soon" : undefined}
              onClick={() => !n.disabled && onNavigate(n.key)}
            >
              <span className="sb-nav-icon">{n.icon}</span>
              {n.label}
              {n.badge && <span className="sb-badge">{n.badge}</span>}
            </button>
          ))}
        </nav>
      </div>

      <div className="sb-footer">
        <a className="sb-nav-item sb-link" href="https://github.com/techwarq/clep_plugin_be" target="_blank" rel="noreferrer">
          <span className="sb-nav-icon">
            <Icon d="M5 4.5h10.5A2.5 2.5 0 0 1 18 7v13.5H7.5A2.5 2.5 0 0 1 5 18V4.5zM5 16.5A2.5 2.5 0 0 1 7.5 14H18" />
          </span>
          Docs
          <span className="sb-ext">↗</span>
        </a>
        <a className="sb-nav-item sb-link" href="mailto:support@clep.dev">
          <span className="sb-nav-icon">
            <Icon d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM9.6 9.6a2.5 2.5 0 1 1 3.9 2c-.8.6-1.5 1-1.5 1.9M12 17h.01" />
          </span>
          Contact Us
        </a>

        <button className="sb-plan-card" onClick={() => onNavigate("billing")} title="View billing">
          <span className="sb-wallet">
            <Icon d="M3.5 6.5h17v11h-17zM3.5 10h17M16 14.5h3" />
          </span>
          <span className="sb-plan-text">
            <span className="sb-plan-label">PLAN</span>
            <span className="sb-plan-value">{planName ? planName.toUpperCase() : "FREE"}</span>
          </span>
          <svg className="sb-refresh" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20 11a8 8 0 0 0-14.9-3M4 5v4h4M4 13a8 8 0 0 0 14.9 3M20 19v-4h-4" />
          </svg>
        </button>

        <div className="sb-user-wrap">
          <button className="sb-user-row" onClick={() => setMenuOpen((m) => !m)}>
            <span className="sb-user-dot">{initial}</span>
            <span className="sb-user-name">{user?.name || user?.email || "Account"}</span>
            <svg className="sb-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M8 9l4-4 4 4M8 15l4 4 4-4" />
            </svg>
          </button>
          {menuOpen && (
            <>
              <div className="menu-scrim" onClick={() => setMenuOpen(false)} />
              <div className="avatar-menu sb-user-menu">
                <div className="avatar-head">
                  <strong>{user?.name || "Account"}</strong>
                  <span>{user?.email || ""}</span>
                </div>
                <button onClick={() => { setMenuOpen(false); onLogout(); }}>Log out</button>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
