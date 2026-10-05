"use client";

import { useEffect, useState } from "react";
import ClepLogo, { ClepMark } from "./Logo";

export type DashView = "create" | "videos";

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
];

export default function Sidebar({
  view,
  onNavigate,
  keyHint,
  onLogout,
}: {
  view: DashView;
  onNavigate: (v: DashView) => void;
  /** The access key in use, masked (va_…abcd). */
  keyHint: string;
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
        <a className="sb2-item" href="mailto:support@clep.dev" data-tip={collapsed ? "Support" : undefined} aria-label="Support">
          <span className="sb2-ico">{I.support}</span>
          <span className="sb2-label">Support</span>
        </a>
      </nav>

      <div className="sb2-bottom">
        <div className="sb2-user-wrap">
          <button className="sb2-user" onClick={() => setMenuOpen((m) => !m)} data-tip={collapsed ? "Access key" : undefined} aria-label="Access key menu">
            <span className="sb2-avatar">⚿</span>
            <span className="sb2-user-text">
              <b>Access key</b>
              <span>{keyHint}</span>
            </span>
            <span className="sb2-updown">{I.updown}</span>
          </button>
          {menuOpen && (
            <>
              <div className="menu-scrim" onClick={() => setMenuOpen(false)} />
              <div className="avatar-menu sb2-menu">
                <div className="avatar-head">
                  <strong>Access key</strong>
                  <span>{keyHint}</span>
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout();
                  }}
                >
                  Remove access key
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
