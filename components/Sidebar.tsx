"use client";

import { useEffect, useState } from "react";
import type { ClepUser } from "../lib/api";
import ClepLogo, { ClepMark } from "./Logo";

export type DashView = "create" | "videos" | "capture" | "keys" | "billing" | "usage";

const COLLAPSE_KEY = "clep_sidebar_collapsed";

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {children}
    </svg>
  );
}

const I = {
  create: (
    <Icon>
      <path d="M12 3.5l1.9 4.6 4.6 1.9-4.6 1.9L12 16.5l-1.9-4.6L5.5 10l4.6-1.9L12 3.5z" />
      <path d="M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8z" />
    </Icon>
  ),
  videos: (
    <Icon>
      <rect x="3.5" y="5" width="17" height="14" rx="3" />
      <path d="M10.5 9.5v5l4.2-2.5-4.2-2.5z" />
    </Icon>
  ),
  capture: (
    <Icon>
      <rect x="3" y="6.5" width="13" height="11" rx="2.5" />
      <path d="M16 10.5l4.5-2.5v8l-4.5-2.5" />
    </Icon>
  ),
  billing: (
    <Icon>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="M3 10h18M7 14.5h3" />
    </Icon>
  ),
  docs: (
    <Icon>
      <path d="M6 3.5h8.5L19 8v11.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1z" />
      <path d="M14 3.5V8h5M8.5 12.5h7M8.5 16h5" />
    </Icon>
  ),
  support: (
    <Icon>
      <path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.1A8 8 0 1 1 20 12z" />
      <path d="M8.5 12h.01M12 12h.01M15.5 12h.01" />
    </Icon>
  ),
  panel: (
    <Icon>
      <rect x="3.5" y="4" width="17" height="16" rx="3" />
      <path d="M9.5 4v16M15.5 10l-2 2 2 2" />
    </Icon>
  ),
  panelOpen: (
    <Icon>
      <rect x="3.5" y="4" width="17" height="16" rx="3" />
      <path d="M9.5 4v16M13.5 10l2 2-2 2" />
    </Icon>
  ),
  spark: (
    <Icon>
      <path d="M12 3.5l1.9 4.6 4.6 1.9-4.6 1.9L12 16.5l-1.9-4.6L5.5 10l4.6-1.9L12 3.5z" />
    </Icon>
  ),
  updown: (
    <Icon>
      <path d="M8 9l4-4 4 4M8 15l4 4 4-4" />
    </Icon>
  ),
};

const MAIN: { key: DashView; label: string; icon: React.ReactNode; soon?: boolean }[] = [
  { key: "create", label: "Create", icon: I.create },
  { key: "videos", label: "Videos", icon: I.videos },
  { key: "capture", label: "Capture", icon: I.capture, soon: true },
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
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {}
  }, []);

  const toggle = () => {
    setCollapsed((c) => {
      try {
        window.localStorage.setItem(COLLAPSE_KEY, c ? "0" : "1");
      } catch {}
      return !c;
    });
    setMenuOpen(false);
  };

  const initial = user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "?";
  const plan = planName ? planName[0].toUpperCase() + planName.slice(1).toLowerCase() : "Free";
  const isFree = !planName || planName.toLowerCase() === "free";

  return (
    <aside className={`sb sb2 ${collapsed ? "collapsed" : ""}`}>
      <div className="sb2-head">
        <a href="/" className="sb2-brand" aria-label="clep — home">
          {collapsed ? <ClepMark size={30} /> : <ClepLogo height={24} />}
        </a>
        <button className="sb2-toggle" onClick={toggle} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} data-tip={collapsed ? "Expand" : undefined}>
          {collapsed ? I.panelOpen : I.panel}
        </button>
      </div>

      <nav className="sb2-nav">
        {MAIN.map((n) => (
          <button
            key={n.key}
            className={`sb2-item ${view === n.key ? "active" : ""} ${n.soon ? "soon" : ""}`}
            disabled={n.soon}
            onClick={() => !n.soon && onNavigate(n.key)}
            data-tip={collapsed ? (n.soon ? `${n.label} · soon` : n.label) : undefined}
            aria-label={n.label}
          >
            <span className="sb2-ico">{n.icon}</span>
            <span className="sb2-label">{n.label}</span>
            {n.soon && <span className="sb2-soon">Soon</span>}
          </button>
        ))}
      </nav>

      <div className="sb2-sep" />
      <span className="sb2-section">Other</span>
      <nav className="sb2-nav">
        <button className={`sb2-item ${view === "billing" ? "active" : ""}`} onClick={() => onNavigate("billing")} data-tip={collapsed ? "Billing" : undefined} aria-label="Billing">
          <span className="sb2-ico">{I.billing}</span>
          <span className="sb2-label">Billing</span>
        </button>
        <a className="sb2-item" href="https://github.com/techwarq/clep_plugin_be" target="_blank" rel="noreferrer" data-tip={collapsed ? "Documentation" : undefined} aria-label="Documentation">
          <span className="sb2-ico">{I.docs}</span>
          <span className="sb2-label">Documentation</span>
          <span className="sb2-ext">↗</span>
        </a>
        <a className="sb2-item" href="mailto:support@clep.dev" data-tip={collapsed ? "Support" : undefined} aria-label="Support">
          <span className="sb2-ico">{I.support}</span>
          <span className="sb2-label">Support</span>
        </a>
      </nav>

      <div className="sb2-bottom">
        {collapsed ? (
          <button className="sb2-item sb2-plan-mini" onClick={() => onNavigate("billing")} data-tip={`${plan} plan`} aria-label={`${plan} plan`}>
            <span className="sb2-ico">{I.spark}</span>
          </button>
        ) : (
          <div className="sb2-plan">
            <div className="sb2-plan-head">
              <span className="sb2-plan-ico">{I.spark}</span>
              <b>
                {plan} <span>plan</span>
              </b>
            </div>
            <p>{isFree ? "More videos, 1080p60 exports and priority rendering." : "Thanks for backing Clep. Manage seats and invoices anytime."}</p>
            <button className="sb2-plan-btn" onClick={() => onNavigate("billing")}>
              {isFree ? "Upgrade to Pro" : "Manage plan"}
            </button>
          </div>
        )}

        <div className="sb2-user-wrap">
          <button className="sb2-user" onClick={() => setMenuOpen((m) => !m)} data-tip={collapsed ? user?.name || "Account" : undefined} aria-label="Account menu">
            <span className="sb2-avatar">{initial}</span>
            <span className="sb2-user-text">
              <b>{user?.name || "Account"}</b>
              <span>{user?.email || ""}</span>
            </span>
            <span className="sb2-updown">{I.updown}</span>
          </button>
          {menuOpen && (
            <>
              <div className="menu-scrim" onClick={() => setMenuOpen(false)} />
              <div className="avatar-menu sb2-menu">
                <div className="avatar-head">
                  <strong>{user?.name || "Account"}</strong>
                  <span>{user?.email || ""}</span>
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onNavigate("keys");
                  }}
                >
                  API keys
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onNavigate("usage");
                  }}
                >
                  Usage
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout();
                  }}
                >
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
